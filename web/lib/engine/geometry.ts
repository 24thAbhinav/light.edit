import type { CropRegion } from "@/lib/edit-state";

export interface Dimensions {
  width: number;
  height: number;
}

export type CropHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const FULL_CROP: CropRegion = { x: 0, y: 0, width: 1, height: 1 };

const MIN_CROP = 0.05;

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

const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value;

export function resizeCrop(
  start: CropRegion,
  handle: CropHandle | "move",
  dx: number,
  dy: number,
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

  return { x: left, y: top, width: right - left, height: bottom - top };
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
  rotation: number,
  crop: CropRegion | null,
  targetWidth: number,
  targetHeight: number,
) {
  const dimensions = rotatedDimensions(image, rotation);
  const region = cropToPixels(crop, dimensions.width, dimensions.height);
  const placement = rotationPlacement(
    rotation,
    image.naturalWidth,
    image.naturalHeight,
  );

  const scaleX = targetWidth / region.width;
  const scaleY = targetHeight / region.height;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.translate(
    scaleX * (placement.x - region.x),
    scaleY * (placement.y - region.y),
  );
  context.scale(scaleX, scaleY);
  context.rotate(placement.radians);
  context.drawImage(image, 0, 0);
  context.restore();
}
