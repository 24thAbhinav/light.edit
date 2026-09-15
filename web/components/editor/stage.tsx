"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import type { EditState } from "@/lib/edit-state";
import { useEditorStore } from "@/lib/editor-store";
import { processImageData } from "@/lib/engine/image-processor";

export function Stage({
  image,
  isDragging,
  children,
}: {
  image: HTMLImageElement | null;
  isDragging: boolean;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<ImageData | null>(null);

  const edits = useEditorStore((state) => state.edits);

  const paint = useCallback((state: EditState) => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.putImageData(processImageData(source, state), 0, 0);
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

      const gutter = 64;
      const scale = Math.min(
        Math.max(width - gutter, 1) / image.naturalWidth,
        Math.max(height - gutter, 1) / image.naturalHeight,
      );

      const displayWidth = Math.max(Math.round(image.naturalWidth * scale), 1);
      const displayHeight = Math.max(Math.round(image.naturalHeight * scale), 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      const context = canvas.getContext("2d");
      if (!context) return;
      context.imageSmoothingQuality = "high";
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      sourceRef.current = context.getImageData(0, 0, canvas.width, canvas.height);
      paint(useEditorStore.getState().edits);
    };

    capture();
    const observer = new ResizeObserver(capture);
    observer.observe(container);
    return () => observer.disconnect();
  }, [image, paint]);

  useEffect(() => {
    paint(edits);
  }, [edits, paint]);

  return (
    <div
      ref={containerRef}
      data-dragging={isDragging}
      className="pe-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-8"
    >
      {image ? (
        <canvas
          key={image.src}
          ref={canvasRef}
          className="pe-photo max-h-full max-w-full"
          role="img"
          aria-label="Current photo preview"
        />
      ) : (
        children
      )}
    </div>
  );
}
