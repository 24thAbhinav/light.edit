"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { aspectRatioValue, parameterKeys } from "@/lib/edit-state";
import {
  getActiveEdits,
  useActiveEdits,
  useEditorStore,
} from "@/lib/editor-store";
import { processImageData } from "@/lib/engine/image-processor";
import {
  cropPixelRatio,
  cropToPixels,
  drawEditGeometry,
  FULL_CROP,
  rotatedDimensions,
  type CropConstraint,
} from "@/lib/engine/geometry";
import { CropOverlay } from "./crop-overlay";

export function Stage({
  image,
  isDragging,
  cropMode,
  compare,
  children,
}: {
  image: HTMLImageElement | null;
  isDragging: boolean;
  cropMode: boolean;
  compare: boolean;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<ImageData | null>(null);
  const compareRef = useRef(compare);
  compareRef.current = compare;

  const edits = useActiveEdits();
  const setCrop = useEditorStore((state) => state.setCrop);

  const rotation = edits.rotation;
  const appliedCrop = cropMode ? null : edits.crop;
  const cropKey = appliedCrop
    ? `${appliedCrop.x},${appliedCrop.y},${appliedCrop.width},${appliedCrop.height}`
    : "full";
  const colorKey = parameterKeys.map((key) => edits[key]).join(",");
  const geometryKey = [
    edits.rotation,
    edits.straighten,
    edits.flipHorizontal,
    edits.flipVertical,
    cropKey,
  ].join(",");

  const constraint: CropConstraint | null = (() => {
    if (!image || !edits.cropLocked) return null;
    const frame = rotatedDimensions(image, edits.rotation);
    const preset = aspectRatioValue(edits.aspectRatio);
    return {
      ratio:
        preset ?? cropPixelRatio(edits.crop, frame.width, frame.height),
      frameWidth: frame.width,
      frameHeight: frame.height,
    };
  })();

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const output = processImageData(source, getActiveEdits());

    if (compareRef.current) {
      const rowBytes = source.width * 4;
      const half = Math.floor(source.width / 2) * 4;
      for (let row = 0; row < source.height; row += 1) {
        const start = row * rowBytes;
        output.data.set(source.data.subarray(start, start + half), start);
      }
    }

    context.putImageData(output, 0, 0);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !image) {
      sourceRef.current = null;
      return;
    }

    const capture = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      const state = getActiveEdits();
      const activeCrop = cropMode ? null : state.crop;
      const dimensions = rotatedDimensions(image, state.rotation);
      const region = cropToPixels(activeCrop, dimensions.width, dimensions.height);

      const gutter = 64;
      const fitScale = Math.min(
        Math.max(width - gutter, 1) / region.width,
        Math.max(height - gutter, 1) / region.height,
      );

      const displayWidth = Math.max(Math.round(region.width * fitScale), 1);
      const displayHeight = Math.max(Math.round(region.height * fitScale), 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawEditGeometry(
        context,
        image,
        { ...state, crop: activeCrop },
        canvas.width,
        canvas.height,
      );

      sourceRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
      paint();
    };

    capture();
    const observer = new ResizeObserver(capture);
    observer.observe(container);
    return () => observer.disconnect();
  }, [image, geometryKey, cropMode, paint]);

  useEffect(() => {
    paint();
  }, [colorKey, compare, paint]);

  return (
    <div
      ref={containerRef}
      data-dragging={isDragging}
      className="pe-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-8"
    >
      {image ? (
        <div className="relative overflow-hidden">
          <canvas
            key={image.src}
            ref={canvasRef}
            className="pe-photo block"
            role="img"
            aria-label="Current photo preview"
          />
          {compare ? (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/70" />
              <span className="absolute left-3 top-3 rounded-sm bg-black/55 px-2 py-0.5 text-[11px] text-white/90">
                Original
              </span>
              <span className="absolute right-3 top-3 rounded-sm bg-black/55 px-2 py-0.5 text-[11px] text-white/90">
                Edited
              </span>
            </div>
          ) : null}
          {cropMode ? (
            <CropOverlay
              crop={edits.crop ?? FULL_CROP}
              constraint={constraint}
              onChange={setCrop}
            />
          ) : null}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
