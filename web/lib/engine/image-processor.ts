import type { ParameterKey } from "@/lib/edit-state";

export type ProcessorEditState = Record<ParameterKey, number>;

const MAX_CHANNEL = 255;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const TEMPERATURE_STRENGTH = 0.3;
const TINT_STRENGTH = 0.2;
const DEHAZE_BLACK = 0.12;
const DEHAZE_VEIL = 0.3;
const DEHAZE_LIFT = 0.12;
const DEHAZE_SATURATION = 0.4;
const TEXTURE_RADIUS = 0.0022;
const CLARITY_RADIUS = 0.014;
const TEXTURE_GAIN = 1.1;
const CLARITY_GAIN = 1.25;
const VIGNETTE_UNIFORM = 0.32;
const VIGNETTE_EDGE = 1.28;
const VIGNETTE_DARKEN = 0.9;
const VIGNETTE_LIGHTEN = 0.55;
const GRAIN_AMPLITUDE = 26;
const GRAIN_REFERENCE = 900;
const GRAIN_MIDTONE = 0.55;
const GRAIN_QUANTUM = 1 / 127;
const VIGNETTE_BUCKETS = 1024;
const VIGNETTE_MAX_RADIUS_SQUARED = 2;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

const srgbToLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

const linearToSrgb = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const clampIndex = (index: number, size: number) =>
  index < 0 ? 0 : index >= size ? size - 1 : index;

const hashNoise = (x: number, y: number) => {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
};

export const isNeutral = (edits: ProcessorEditState) =>
  edits.exposure === 0 &&
  edits.contrast === 0 &&
  edits.highlights === 0 &&
  edits.shadows === 0 &&
  edits.whites === 0 &&
  edits.blacks === 0 &&
  edits.temperature === 0 &&
  edits.tint === 0 &&
  edits.vibrance === 0 &&
  edits.saturation === 0 &&
  edits.texture === 0 &&
  edits.clarity === 0 &&
  edits.dehaze === 0 &&
  edits.vignette === 0 &&
  edits.grain === 0;

const applyToneRegions = (value: number, edits: ProcessorEditState) => {
  const shadows = edits.shadows / 100;
  const highlights = edits.highlights / 100;
  const whites = edits.whites / 100;
  const blacks = edits.blacks / 100;

  let result = value;
  result += shadows * 0.4 * (1 - smoothstep(0, 0.5, result));
  result += highlights * 0.4 * smoothstep(0.5, 1, result);
  result += blacks * 0.3 * (1 - result) * (1 - result);
  result += whites * 0.3 * result * result;
  return result;
};

const applyDehaze = (value: number, dehaze: number) => {
  if (dehaze === 0) return value;
  if (dehaze > 0) {
    const pivot = DEHAZE_BLACK * dehaze;
    return (value - pivot) / (1 - pivot);
  }
  return value * (1 + DEHAZE_VEIL * dehaze) - DEHAZE_LIFT * dehaze;
};

const buildChannelCurve = (
  channelGain: number,
  exposureFactor: number,
  contrastFactor: number,
  dehaze: number,
  edits: ProcessorEditState,
) => {
  const curve = new Uint8ClampedArray(MAX_CHANNEL + 1);
  for (let i = 0; i <= MAX_CHANNEL; i += 1) {
    const linear = srgbToLinear(i / MAX_CHANNEL) * channelGain * exposureFactor;
    const toned = applyToneRegions(linearToSrgb(linear), edits);
    const contrasted = (toned - 0.5) * contrastFactor + 0.5;
    const dehazed = applyDehaze(clamp01(contrasted), dehaze);
    curve[i] = Math.round(clamp01(dehazed) * MAX_CHANNEL);
  }
  return curve;
};

const boxBlurLuma = (
  luma: Float32Array,
  target: Float32Array,
  width: number,
  height: number,
  radius: number,
  scratch: Float32Array,
) => {
  const window = radius * 2 + 1;

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    let sum = 0;
    for (let x = -radius; x <= radius; x += 1) {
      sum += luma[row + clampIndex(x, width)];
    }
    for (let x = 0; x < width; x += 1) {
      scratch[row + x] = sum / window;
      sum +=
        luma[row + clampIndex(x + radius + 1, width)] -
        luma[row + clampIndex(x - radius, width)];
    }
  }

  for (let x = 0; x < width; x += 1) {
    let sum = 0;
    for (let y = -radius; y <= radius; y += 1) {
      sum += scratch[clampIndex(y, height) * width + x];
    }
    for (let y = 0; y < height; y += 1) {
      target[y * width + x] = sum / window;
      sum +=
        scratch[clampIndex(y + radius + 1, height) * width + x] -
        scratch[clampIndex(y - radius, height) * width + x];
    }
  }
};

const accumulateDetail = (
  luma: Float32Array,
  blurred: Float32Array,
  target: Float32Array,
  gain: number,
  midtoneWeighted: boolean,
) => {
  for (let p = 0; p < luma.length; p += 1) {
    let weight = gain;
    if (midtoneWeighted) {
      const normalized = luma[p] / MAX_CHANNEL;
      const midtone = 1 - Math.abs(normalized * 2 - 1);
      weight *= 0.25 + 0.75 * midtone;
    }
    target[p] += (luma[p] - blurred[p]) * weight;
  }
};

interface LocalContrastBuffers {
  pixels: number;
  luma: Float32Array;
  blurred: Float32Array;
  detail: Float32Array;
  scratch: Float32Array;
}

let localContrastCache: LocalContrastBuffers | null = null;

const localContrastBuffers = (pixels: number) => {
  if (!localContrastCache || localContrastCache.pixels !== pixels) {
    localContrastCache = {
      pixels,
      luma: new Float32Array(pixels),
      blurred: new Float32Array(pixels),
      detail: new Float32Array(pixels),
      scratch: new Float32Array(pixels),
    };
  }
  return localContrastCache;
};

const buildLocalContrast = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  texture: number,
  clarity: number,
) => {
  const pixels = width * height;
  const { luma, blurred, detail, scratch } = localContrastBuffers(pixels);

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    luma[p] = LUMA_R * data[i] + LUMA_G * data[i + 1] + LUMA_B * data[i + 2];
  }
  detail.fill(0);

  const minDimension = Math.min(width, height);

  if (texture !== 0) {
    const radius = Math.max(1, Math.round(minDimension * TEXTURE_RADIUS));
    boxBlurLuma(luma, blurred, width, height, radius, scratch);
    accumulateDetail(luma, blurred, detail, (texture / 100) * TEXTURE_GAIN, false);
  }

  if (clarity !== 0) {
    const radius = Math.max(2, Math.round(minDimension * CLARITY_RADIUS));
    boxBlurLuma(luma, blurred, width, height, radius, scratch);
    accumulateDetail(luma, blurred, detail, (clarity / 100) * CLARITY_GAIN, true);
  }

  return detail;
};

const buildGrainField = (width: number, height: number) => {
  const field = new Int8Array(width * height);
  const step = GRAIN_REFERENCE / Math.min(width, height);
  const columns = new Int32Array(width);
  const columnFractions = new Float32Array(width);
  const rows = new Int32Array(height);
  const rowFractions = new Float32Array(height);

  for (let x = 0; x < width; x += 1) {
    const position = x * step;
    const base = Math.floor(position);
    columns[x] = base;
    columnFractions[x] = position - base;
  }
  for (let y = 0; y < height; y += 1) {
    const position = y * step;
    const base = Math.floor(position);
    rows[y] = base;
    rowFractions[y] = position - base;
  }

  let index = 0;
  for (let y = 0; y < height; y += 1) {
    const rowBase = rows[y];
    const nextRow = rowBase + 1;
    const rowFraction = rowFractions[y];

    for (let x = 0; x < width; x += 1, index += 1) {
      const columnBase = columns[x];
      const nextColumn = columnBase + 1;
      const columnFraction = columnFractions[x];

      const topLeft = hashNoise(columnBase, rowBase);
      const topRight = hashNoise(nextColumn, rowBase);
      const bottomLeft = hashNoise(columnBase, nextRow);
      const bottomRight = hashNoise(nextColumn, nextRow);

      const top = topLeft + (topRight - topLeft) * columnFraction;
      const bottom = bottomLeft + (bottomRight - bottomLeft) * columnFraction;
      field[index] = Math.round(
        (top + (bottom - top) * rowFraction) * 2 * 127 - 127,
      );
    }
  }

  return field;
};

let grainFieldKey = "";
let grainFieldCache: Int8Array | null = null;

const grainField = (width: number, height: number) => {
  const key = `${width}x${height}`;
  if (grainFieldCache && grainFieldKey === key) return grainFieldCache;
  const field = buildGrainField(width, height);
  grainFieldKey = key;
  grainFieldCache = field;
  return field;
};

export function processImageData(
  source: ImageData,
  edits: ProcessorEditState,
): ImageData {
  const output = new ImageData(
    new Uint8ClampedArray(source.data),
    source.width,
    source.height,
  );

  if (isNeutral(edits)) return output;

  const width = source.width;
  const height = source.height;
  const data = output.data;

  const exposureFactor = Math.pow(2, edits.exposure);
  const contrastFactor = 1 + edits.contrast / 100;
  const dehaze = edits.dehaze / 100;
  const saturationFactor =
    (1 + edits.saturation / 100) *
    (1 + DEHAZE_SATURATION * Math.max(0, dehaze));
  const vibranceAmount = edits.vibrance / 100;
  const temperatureShift = (edits.temperature / 100) * TEMPERATURE_STRENGTH;
  const tintShift = (edits.tint / 100) * TINT_STRENGTH;

  const redCurve = buildChannelCurve(
    (1 + temperatureShift) * (1 + tintShift),
    exposureFactor,
    contrastFactor,
    dehaze,
    edits,
  );
  const greenCurve = buildChannelCurve(
    1 - tintShift,
    exposureFactor,
    contrastFactor,
    dehaze,
    edits,
  );
  const blueCurve = buildChannelCurve(
    (1 - temperatureShift) * (1 + tintShift),
    exposureFactor,
    contrastFactor,
    dehaze,
    edits,
  );

  const detail =
    edits.texture !== 0 || edits.clarity !== 0
      ? buildLocalContrast(
          source.data,
          width,
          height,
          edits.texture,
          edits.clarity,
        )
      : null;

  const vignetteAmount = edits.vignette / 100;
  const grainAmount = edits.grain / 100;
  const centreX = width / 2;
  const centreY = height / 2;
  const inverseHalfWidth = 2 / width;
  const inverseHalfHeight = 2 / height;
  const vignetteScale = VIGNETTE_BUCKETS / VIGNETTE_MAX_RADIUS_SQUARED;

  let vignetteLut: Float32Array | null = null;
  if (vignetteAmount !== 0) {
    const strength = vignetteAmount > 0 ? VIGNETTE_LIGHTEN : VIGNETTE_DARKEN;
    vignetteLut = new Float32Array(VIGNETTE_BUCKETS + 1);
    for (let bucket = 0; bucket <= VIGNETTE_BUCKETS; bucket += 1) {
      const radius = Math.sqrt(bucket / vignetteScale);
      const falloff = smoothstep(VIGNETTE_UNIFORM, VIGNETTE_EDGE, radius);
      vignetteLut[bucket] = 1 + vignetteAmount * falloff * strength;
    }
  }

  const noiseField = grainAmount !== 0 ? grainField(width, height) : null;

  let index = 0;
  let pixel = 0;

  for (let y = 0; y < height; y += 1) {
    const normalizedY = (y + 0.5 - centreY) * inverseHalfHeight;
    const normalizedYSquared = normalizedY * normalizedY;

    for (let x = 0; x < width; x += 1, index += 4, pixel += 1) {
      let r = redCurve[data[index]];
      let g = greenCurve[data[index + 1]];
      let b = blueCurve[data[index + 2]];

      const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b;

      let amount = saturationFactor;
      if (vibranceAmount !== 0) {
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        amount *= 1 + vibranceAmount * (1 - saturation);
      }

      r = luma + (r - luma) * amount;
      g = luma + (g - luma) * amount;
      b = luma + (b - luma) * amount;

      const localDetail = detail ? detail[pixel] : 0;
      if (localDetail !== 0) {
        r += localDetail;
        g += localDetail;
        b += localDetail;
      }

      if (vignetteLut) {
        const normalizedX = (x + 0.5 - centreX) * inverseHalfWidth;
        const radiusSquared =
          normalizedX * normalizedX + normalizedYSquared;
        const bucket =
          radiusSquared >= VIGNETTE_MAX_RADIUS_SQUARED
            ? VIGNETTE_BUCKETS
            : (radiusSquared * vignetteScale) | 0;
        const factor = vignetteLut[bucket];
        r *= factor;
        g *= factor;
        b *= factor;
      }

      if (noiseField) {
        const noise = noiseField[pixel] * GRAIN_QUANTUM;
        const grainLuma = LUMA_R * r + LUMA_G * g + LUMA_B * b;
        const midtone = 1 - Math.abs((grainLuma / MAX_CHANNEL) * 2 - 1);
        const delta =
          noise *
          grainAmount *
          GRAIN_AMPLITUDE *
          (1 - GRAIN_MIDTONE + GRAIN_MIDTONE * midtone);
        r += delta;
        g += delta;
        b += delta;
      }

      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
    }
  }

  return output;
}
