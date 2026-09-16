import type { CropRegion, EditState } from "@/lib/edit-state";

export interface Dimensions {
  width: number;
  height: number;
}

export type CropHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const FULL_CROP: CropRegion = { x: 0, y: 0, width: 1, height: 1 };

const MIN_CROP = 0.05;
const LUMA_R = 0.2126;
const LUMA_G = 0.7152;
const LUMA_B = 0.0722;

export type GeometryEdits = Pick<
  EditState,
  "rotation" | "straighten" | "flipHorizontal" | "flipVertical" | "crop"
>;

export interface CropConstraint {
  ratio: number;
  frameWidth: number;
  frameHeight: number;
}

export const normalizeRotation = (rotation: number) =>
  (((Math.round(rotation / 90) * 90) % 360) + 360) % 360;

export const rotatedDimensions = (
  image: HTMLImageElement,
  rotation: number,
): Dimensions => {
  const normalized = normalizeRotation(rotation);
  const swapped = normalized % 180 !== 0;
  return {
    width: swapped ? image.naturalHeight : image.naturalWidth,
    height: swapped ? image.naturalWidth : image.naturalHeight,
  };
};

export const cropToPixels = (
  crop: CropRegion | null,
  width: number,
  height: number,
): CropRegion => {
  const region = crop ?? FULL_CROP;
  return {
    x: region.x * width,
    y: region.y * height,
    width: region.width * width,
    height: region.height * height,
  };
};

export const cropPixelRatio = (
  crop: CropRegion | null,
  frameWidth: number,
  frameHeight: number,
) => {
  const region = cropToPixels(crop, frameWidth, frameHeight);
  return region.width / Math.max(region.height, 1);
};

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

const constrainCrop = (
  rect: CropRegion,
  handle: CropHandle,
  ratio: number,
): CropRegion => {
  const right = rect.x + rect.width;
  const bottom = rect.y + rect.height;

  if (handle === "e" || handle === "w") {
    const anchorX = handle === "e" ? rect.x : right;
    const centreY = rect.y + rect.height / 2;
    const maxHeight = 2 * Math.min(centreY, 1 - centreY);
    const maxWidth = handle === "e" ? 1 - anchorX : anchorX;
    let width = rect.width;
    let height = width / ratio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
    if (width > maxWidth) {
      width = maxWidth;
      height = width / ratio;
    }
    width = Math.max(width, MIN_CROP);
    height = Math.max(height, MIN_CROP);
    return {
      x: handle === "e" ? anchorX : anchorX - width,
      y: centreY - height / 2,
      width,
      height,
    };
  }

  if (handle === "n" || handle === "s") {
    const anchorY = handle === "s" ? rect.y : bottom;
    const centreX = rect.x + rect.width / 2;
    const maxWidth = 2 * Math.min(centreX, 1 - centreX);
    const maxHeight = handle === "s" ? 1 - anchorY : anchorY;
    let height = rect.height;
    let width = height * ratio;
    if (width > maxWidth) {
      width = maxWidth;
      height = width / ratio;
    }
    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
    width = Math.max(width, MIN_CROP);
    height = Math.max(height, MIN_CROP);
    return {
      x: centreX - width / 2,
      y: handle === "s" ? anchorY : anchorY - height,
      width,
      height,
    };
  }

  const anchorX = handle.includes("w") ? right : rect.x;
  const anchorY = handle.includes("n") ? bottom : rect.y;
  const maxWidth = handle.includes("w") ? anchorX : 1 - anchorX;
  const maxHeight = handle.includes("n") ? anchorY : 1 - anchorY;
  let width = rect.width;
  let height = rect.height;
  if (width / ratio >= height) height = width / ratio;
  else width = height * ratio;
  if (width > maxWidth) {
    width = maxWidth;
    height = width / ratio;
  }
  if (height > maxHeight) {
    height = maxHeight;
    width = height * ratio;
  }
  width = Math.max(width, MIN_CROP);
  height = Math.max(height, MIN_CROP);
  return {
    x: handle.includes("w") ? anchorX - width : anchorX,
    y: handle.includes("n") ? anchorY - height : anchorY,
    width,
    height,
  };
};

export function resizeCrop(
  start: CropRegion,
  handle: CropHandle | "move",
  dx: number,
  dy: number,
  constraint?: CropConstraint | null,
): CropRegion {
  if (handle === "move") {
    return {
      x: clamp(start.x + dx, 0, 1 - start.width),
      y: clamp(start.y + dy, 0, 1 - start.height),
      width: start.width,
      height: start.height,
    };
  }

  let left = start.x;
  let top = start.y;
  let right = start.x + start.width;
  let bottom = start.y + start.height;

  if (handle.includes("w")) left = clamp(left + dx, 0, right - MIN_CROP);
  if (handle.includes("e")) right = clamp(right + dx, left + MIN_CROP, 1);
  if (handle.includes("n")) top = clamp(top + dy, 0, bottom - MIN_CROP);
  if (handle.includes("s")) bottom = clamp(bottom + dy, top + MIN_CROP, 1);

  const rect: CropRegion = {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };

  if (!constraint) return rect;
  return constrainCrop(
    rect,
    handle,
    (constraint.ratio * constraint.frameHeight) / constraint.frameWidth,
  );
}

export function cropForAspect(
  frameWidth: number,
  frameHeight: number,
  ratio: number,
): CropRegion {
  const frameRatio = frameWidth / frameHeight;
  let width = 1;
  let height = 1;
  if (ratio > frameRatio) height = frameRatio / ratio;
  else width = ratio / frameRatio;
  return {
    x: (1 - width) / 2,
    y: (1 - height) / 2,
    width,
    height,
  };
}

export function fitCropToAspect(
  crop: CropRegion,
  frameWidth: number,
  frameHeight: number,
  ratio: number,
): CropRegion {
  const normalizedRatio = ratio / (frameWidth / frameHeight);
  const centreX = crop.x + crop.width / 2;
  const centreY = crop.y + crop.height / 2;
  const area = crop.width * crop.height;

  let height = Math.sqrt(area / normalizedRatio);
  let width = normalizedRatio * height;

  if (width > 1) {
    width = 1;
    height = width / normalizedRatio;
  }
  if (height > 1) {
    height = 1;
    width = height * normalizedRatio;
  }
  width = Math.max(width, MIN_CROP);
  height = Math.max(height, MIN_CROP);

  return {
    x: clamp(centreX - width / 2, 0, 1 - width),
    y: clamp(centreY - height / 2, 0, 1 - height),
    width,
    height,
  };
}

export function rotateCrop(crop: CropRegion, delta: number): CropRegion {
  const { x, y, width, height } = crop;
  switch (normalizeRotation(delta)) {
    case 90:
      return { x: 1 - (y + height), y: x, width: height, height: width };
    case 180:
      return { x: 1 - (x + width), y: 1 - (y + height), width, height };
    case 270:
      return { x: y, y: 1 - (x + width), width: height, height: width };
    default:
      return crop;
  }
}

const rotationPlacement = (
  rotation: number,
  imageWidth: number,
  imageHeight: number,
) => {
  switch (normalizeRotation(rotation)) {
    case 90:
      return { radians: Math.PI / 2, x: imageHeight, y: 0 };
    case 180:
      return { radians: Math.PI, x: imageWidth, y: imageHeight };
    case 270:
      return { radians: (3 * Math.PI) / 2, x: 0, y: imageWidth };
    default:
      return { radians: 0, x: 0, y: 0 };
  }
};

export function drawEditGeometry(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  edits: GeometryEdits,
  targetWidth: number,
  targetHeight: number,
) {
  const quarter = normalizeRotation(edits.rotation);
  const swapped = quarter % 180 !== 0;
  const frameWidth = swapped ? image.naturalHeight : image.naturalWidth;
  const frameHeight = swapped ? image.naturalWidth : image.naturalHeight;
  const region = cropToPixels(edits.crop, frameWidth, frameHeight);
  const placement = rotationPlacement(
    quarter,
    image.naturalWidth,
    image.naturalHeight,
  );

  const scaleX = targetWidth / region.width;
  const scaleY = targetHeight / region.height;

  const radians = (edits.straighten * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const coveredWidth = Math.abs(region.width * cos) + Math.abs(region.height * sin);
  const coveredHeight =
    Math.abs(region.width * sin) + Math.abs(region.height * cos);
  const cover = Math.max(
    1,
    coveredWidth / frameWidth,
    coveredHeight / frameHeight,
  );

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (edits.flipHorizontal) {
    context.translate(targetWidth, 0);
    context.scale(-1, 1);
  }
  if (edits.flipVertical) {
    context.translate(0, targetHeight);
    context.scale(1, -1);
  }

  context.translate(targetWidth / 2, targetHeight / 2);
  context.scale(scaleX, scaleY);
  context.translate(
    -(region.x + region.width / 2),
    -(region.y + region.height / 2),
  );

  if (radians !== 0) context.rotate(radians);
  if (cover !== 1) context.scale(cover, cover);

  context.translate(placement.x, placement.y);
  context.rotate(placement.radians);
  context.drawImage(image, 0, 0);
  context.restore();
}

export function autoStraighten(
  image: HTMLImageElement,
  geometry: Pick<
    GeometryEdits,
    "rotation" | "flipHorizontal" | "flipVertical"
  >,
): number {
  const target = 192;
  const quarter = normalizeRotation(geometry.rotation);
  const swapped = quarter % 180 !== 0;
  const baseWidth = swapped ? image.naturalHeight : image.naturalWidth;
  const baseHeight = swapped ? image.naturalWidth : image.naturalHeight;
  const scale = Math.min(1, target / Math.max(baseWidth, baseHeight));
  const width = Math.max(24, Math.round(baseWidth * scale));
  const height = Math.max(24, Math.round(baseHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return 0;

  drawEditGeometry(
    context,
    image,
    { ...geometry, straighten: 0, crop: null },
    width,
    height,
  );

  const { data } = context.getImageData(0, 0, width, height);

  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const at = (y * width + x) * 4;
      const left = (y * width + x - 1) * 4;
      const right = (y * width + x + 1) * 4;
      const up = ((y - 1) * width + x) * 4;
      const down = ((y + 1) * width + x) * 4;
      const gx =
        LUMA_R * (data[right] - data[left]) +
        LUMA_G * (data[right + 1] - data[left + 1]) +
        LUMA_B * (data[right + 2] - data[left + 2]);
      const gy =
        LUMA_R * (data[down] - data[up]) +
        LUMA_G * (data[down + 1] - data[up + 1]) +
        LUMA_B * (data[down + 2] - data[up + 2]);
      edges[y * width + x] = Math.abs(gx) + Math.abs(gy);
    }
  }

  const rows = new Float32Array(height);
  const varianceAt = (angle: number) => {
    rows.fill(0);
    const shear = Math.sin((angle * Math.PI) / 180);
    const centre = width / 2;
    for (let y = 0; y < height; y += 1) {
      const row = y * width;
      for (let x = 0; x < width; x += 1) {
        const value = edges[row + x];
        if (value === 0) continue;
        const index = Math.round(y + (x - centre) * shear);
        if (index >= 0 && index < height) rows[index] += value;
      }
    }
    let sum = 0;
    let sumSquares = 0;
    for (let y = 0; y < height; y += 1) {
      sum += rows[y];
      sumSquares += rows[y] * rows[y];
    }
    const mean = sum / height;
    return sumSquares / height - mean * mean;
  };

  const baseline = varianceAt(0);
  let best = 0;
  let bestScore = baseline;
  for (let angle = -20; angle <= 20; angle += 1) {
    if (angle === 0) continue;
    const score = varianceAt(angle);
    if (score > bestScore) {
      bestScore = score;
      best = angle;
    }
  }

  if (best === 0 || bestScore < baseline * 1.06) return 0;
  return best;
}
