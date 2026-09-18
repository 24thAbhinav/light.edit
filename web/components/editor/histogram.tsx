"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { HISTOGRAM_BINS } from "@/lib/engine/histogram";

const CHANNELS = [
  { channel: "red", fill: "rgba(255, 72, 72, 0.62)" },
  { channel: "green", fill: "rgba(74, 214, 126, 0.62)" },
  { channel: "blue", fill: "rgba(86, 132, 255, 0.68)" },
] as const;

// Typical photos have a peak/median ratio around 45-64x, so a linear axis
// collapses the distribution into a few spikes. Bins stay raw; only the drawn
// height is compressed, keeping the peaks dominant while the tail stays legible.
const DISPLAY_GAMMA = 0.6;

function ClipIndicator({
  side,
  active,
  percent,
}: {
  side: "left" | "right";
  active: boolean;
  percent: number;
}) {
  const label = side === "left" ? "shadow clipping" : "highlight clipping";
  return (
    <span
      className={`absolute top-1 ${side === "left" ? "left-1" : "right-1"}`}
      title={
        active
          ? `${percent.toFixed(1)}% of pixels ${side === "left" ? "at black" : "at white"}`
          : `No ${label}`
      }
    >
      <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
        <path
          d={side === "left" ? "M0 0 L9 0 L0 9 Z" : "M9 0 L9 9 L0 0 Z"}
          fill={active ? "#ffffff" : "rgba(255, 255, 255, 0.15)"}
        />
      </svg>
    </span>
  );
}

export function Histogram() {
  const histogram = useEditorStore((state) => state.histogram);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    context.clearRect(0, 0, width, height);
    if (histogram.samples === 0) return;

    const scale = height / histogram.peak;
    context.globalCompositeOperation = "lighter";

    for (const { channel, fill } of CHANNELS) {
      const bins = histogram[channel];
      context.beginPath();
      context.moveTo(0, height);
      for (let bin = 0; bin < HISTOGRAM_BINS; bin += 1) {
        const x = (bin / (HISTOGRAM_BINS - 1)) * width;
        const normalized = Math.min(bins[bin] * scale, 1);
        const y = height - Math.pow(normalized, DISPLAY_GAMMA) * height;
        context.lineTo(x, y);
      }
      context.lineTo(width, height);
      context.closePath();
      context.fillStyle = fill;
      context.fill();
    }

    context.globalCompositeOperation = "source-over";
  }, [histogram]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [draw]);

  const shadowPercent =
    histogram.samples === 0
      ? 0
      : (histogram.clippedShadows / histogram.samples) * 100;
  const highlightPercent =
    histogram.samples === 0
      ? 0
      : (histogram.clippedHighlights / histogram.samples) * 100;

  return (
    <div className="border-b border-line px-5 py-3.5">
      <h2 className="text-[12px] font-medium tracking-tight text-ink-muted">
        Histogram
      </h2>

      <div className="relative mt-2.5 h-16 overflow-hidden rounded border border-line bg-canvas">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="RGB histogram of the edited photo"
          className="block h-full w-full"
        />
        <ClipIndicator
          side="left"
          active={histogram.samples > 0 && histogram.clippedShadows > 0}
          percent={shadowPercent}
        />
        <ClipIndicator
          side="right"
          active={histogram.samples > 0 && histogram.clippedHighlights > 0}
          percent={highlightPercent}
        />
        {histogram.samples === 0 ? (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-ink-faint">
            No photo
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-faint">
        <span>0</span>
        <span>255</span>
      </div>
    </div>
  );
}
