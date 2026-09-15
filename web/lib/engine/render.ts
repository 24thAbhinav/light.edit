import type { EditState } from "@/lib/edit-state";
import { cropToPixels, drawEditGeometry, rotatedDimensions } from "./geometry";
import { processImageData } from "./image-processor";

export function renderEditedCanvas(
  image: HTMLImageElement,
  edits: EditState,
): HTMLCanvasElement {
  const dimensions = rotatedDimensions(image, edits.rotation);
  const region = cropToPixels(edits.crop, dimensions.width, dimensions.height);
  const width = Math.max(1, Math.round(region.width));
  const height = Math.max(1, Math.round(region.height));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return canvas;

  drawEditGeometry(context, image, edits.rotation, edits.crop, width, height);
  const source = context.getImageData(0, 0, width, height);
  context.putImageData(processImageData(source, edits), 0, 0);

  return canvas;
}
