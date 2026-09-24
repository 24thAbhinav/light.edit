export const HISTOGRAM_BINS = 256;

// A 256-bin histogram is visually identical whether it is built from every
// pixel or from a large sample, so dense buffers are strided. 500k samples
// keeps the shape stable while bounding the cost on large retina canvases.
const MAX_SAMPLES = 500_000;

export interface Histogram {
  red: Uint32Array;
  green: Uint32Array;
  blue: Uint32Array;
  luminance: Uint32Array;
  peak: number;
  clippedShadows: number;
  clippedHighlights: number;
  samples: number;
}

export const emptyHistogram = (): Histogram => ({
  red: new Uint32Array(HISTOGRAM_BINS),
  green: new Uint32Array(HISTOGRAM_BINS),
  blue: new Uint32Array(HISTOGRAM_BINS),
  luminance: new Uint32Array(HISTOGRAM_BINS),
  peak: 1,
  clippedShadows: 0,
  clippedHighlights: 0,
  samples: 0,
});

export function calculateHistogram(data: Uint8ClampedArray): Histogram {
  const red = new Uint32Array(HISTOGRAM_BINS);
  const green = new Uint32Array(HISTOGRAM_BINS);
  const blue = new Uint32Array(HISTOGRAM_BINS);
  const luminance = new Uint32Array(HISTOGRAM_BINS);
  let clippedShadows = 0;
  let clippedHighlights = 0;
  let samples = 0;

  const pixelCount = data.length / 4;
  const step = Math.max(1, Math.floor(pixelCount / MAX_SAMPLES)) * 4;

  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    red[r] += 1;
    green[g] += 1;
    blue[b] += 1;
    // Fast integer luminance approx: (0.299 * r + 0.587 * g + 0.114 * b)
    const lum = (r * 77 + g * 150 + b * 29) >> 8;
    luminance[lum] += 1;
    samples += 1;

    if (r === 0 || g === 0 || b === 0) clippedShadows += 1;
    if (r === 255 || g === 255 || b === 255) clippedHighlights += 1;
  }

  // Spikes at the extremes are reported through the clipping indicators, so
  // they are excluded here — otherwise a large black or white area flattens
  // the entire curve.
  let peak = 0;
  for (let bin = 1; bin < HISTOGRAM_BINS - 1; bin += 1) {
    if (red[bin] > peak) peak = red[bin];
    if (green[bin] > peak) peak = green[bin];
    if (blue[bin] > peak) peak = blue[bin];
    if (luminance[bin] > peak) peak = luminance[bin];
  }
  if (peak === 0) {
    peak = Math.max(
      red[0],
      red[HISTOGRAM_BINS - 1],
      green[0],
      green[HISTOGRAM_BINS - 1],
      blue[0],
      blue[HISTOGRAM_BINS - 1],
      luminance[0],
      luminance[HISTOGRAM_BINS - 1],
      1,
    );
  }

  return {
    red,
    green,
    blue,
    luminance,
    peak,
    clippedShadows,
    clippedHighlights,
    samples,
  };
}
