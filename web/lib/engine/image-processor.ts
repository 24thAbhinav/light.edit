import type { EditState } from "@/lib/edit-state";

export type ProcessorEditState = Pick<
  EditState,
  "exposure" | "contrast" | "saturation" | "temperature"
>;

const MAX_CHANNEL = 255;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;
const TEMPERATURE_STRENGTH = 0.3;

const clamp01 = (value: number) =>
  value < 0 ? 0 : value > 1 ? 1 : value;

const srgbToLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);

const linearToSrgb = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;

export const isNeutral = (edits: ProcessorEditState) =>
  edits.exposure === 0 &&
  edits.contrast === 0 &&
  edits.saturation === 0 &&
  edits.temperature === 0;

const buildChannelCurve = (
  channelGain: number,
  exposureFactor: number,
  contrastFactor: number,
) => {
  const curve = new Uint8ClampedArray(MAX_CHANNEL + 1);
  for (let i = 0; i <= MAX_CHANNEL; i += 1) {
    const linear = srgbToLinear(i / MAX_CHANNEL) * channelGain * exposureFactor;
    const srgb = linearToSrgb(linear);
    const contrasted = (srgb - 0.5) * contrastFactor + 0.5;
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
  const temperatureShift =
    (edits.temperature / 100) * TEMPERATURE_STRENGTH;

  const redCurve = buildChannelCurve(
    1 + temperatureShift,
    exposureFactor,
    contrastFactor,
  );
  const greenCurve = buildChannelCurve(1, exposureFactor, contrastFactor);
  const blueCurve = buildChannelCurve(
    1 - temperatureShift,
    exposureFactor,
    contrastFactor,
  );

  const data = output.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = redCurve[data[i]];
    const g = greenCurve[data[i + 1]];
    const b = blueCurve[data[i + 2]];

    const luma = LUMA_R * r + LUMA_G * g + LUMA_B * b;

    data[i] = luma + (r - luma) * saturationFactor;
    data[i + 1] = luma + (g - luma) * saturationFactor;
    data[i + 2] = luma + (b - luma) * saturationFactor;
  }

  return output;
}
