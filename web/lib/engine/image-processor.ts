import type { ParameterKey } from "@/lib/edit-state";

export type ProcessorEditState = Record<ParameterKey, number>;

const MAX_CHANNEL = 255;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const TEMPERATURE_STRENGTH = 0.3;
const TINT_STRENGTH = 0.2;

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

const srgbToLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

const linearToSrgb = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
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
  edits.saturation === 0;

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

const buildChannelCurve = (
  channelGain: number,
  exposureFactor: number,
  contrastFactor: number,
  edits: ProcessorEditState,
) => {
  const curve = new Uint8ClampedArray(MAX_CHANNEL + 1);
  for (let i = 0; i <= MAX_CHANNEL; i += 1) {
    const linear = srgbToLinear(i / MAX_CHANNEL) * channelGain * exposureFactor;
    const toned = applyToneRegions(linearToSrgb(linear), edits);
    const contrasted = (toned - 0.5) * contrastFactor + 0.5;
    curve[i] = Math.round(clamp01(contrasted) * MAX_CHANNEL);
  }
  return curve;
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

  const exposureFactor = Math.pow(2, edits.exposure);
  const contrastFactor = 1 + edits.contrast / 100;
  const saturationFactor = 1 + edits.saturation / 100;
  const vibranceAmount = edits.vibrance / 100;
  const temperatureShift = (edits.temperature / 100) * TEMPERATURE_STRENGTH;
  const tintShift = (edits.tint / 100) * TINT_STRENGTH;

  const redCurve = buildChannelCurve(
    (1 + temperatureShift) * (1 + tintShift),
    exposureFactor,
    contrastFactor,
    edits,
  );
  const greenCurve = buildChannelCurve(
    1 - tintShift,
    exposureFactor,
    contrastFactor,
    edits,
  );
  const blueCurve = buildChannelCurve(
    (1 - temperatureShift) * (1 + tintShift),
    exposureFactor,
    contrastFactor,
    edits,
  );

  const data = output.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = redCurve[data[i]];
    const g = greenCurve[data[i + 1]];
    const b = blueCurve[data[i + 2]];

    const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b;

    let amount = saturationFactor;
    if (vibranceAmount !== 0) {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const saturation = max === 0 ? 0 : (max - min) / max;
      amount *= 1 + vibranceAmount * (1 - saturation);
    }

    data[i] = luma + (r - luma) * amount;
    data[i + 1] = luma + (g - luma) * amount;
    data[i + 2] = luma + (b - luma) * amount;
  }

  return output;
}
