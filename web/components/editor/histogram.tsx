"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { HISTOGRAM_BINS } from "@/lib/engine/histogram";

type HistogramMode = "rgb" | "luma" | "red" | "green" | "blue";

const TONE_ZONES = [
  { name: "Blacks", min: 0, max: 50 },
  { name: "Shadows", min: 51, max: 101 },
  { name: "Exposure", min: 102, max: 153 },
  { name: "Highlights", min: 154, max: 204 },
  { name: "Whites", min: 205, max: 255 },
] as const;

// Slight gamma compression keeps tails legible without crushing prominent peaks
const DISPLAY_GAMMA = 0.65;

// 5-tap Gaussian-weighted smoothing removes high-frequency sampling jitter
function smoothBins(bins: Uint32Array): Float32Array {
  const smoothed = new Float32Array(HISTOGRAM_BINS);
  for (let i = 0; i < HISTOGRAM_BINS; i += 1) {
    const i0 = Math.max(0, i - 2);
    const i1 = Math.max(0, i - 1);
    const i2 = i;
    const i3 = Math.min(HISTOGRAM_BINS - 1, i + 1);
    const i4 = Math.min(HISTOGRAM_BINS - 1, i + 2);
    smoothed[i] =
      bins[i0] * 0.08 +
      bins[i1] * 0.24 +
      bins[i2] * 0.36 +
      bins[i3] * 0.24 +
      bins[i4] * 0.08;
  }
  return smoothed;
}

function ClipIndicator({
  side,
  active,
  percent,
}: {
  side: "left" | "right";
  active: boolean;
  percent: number;
}) {
  const isLeft = side === "left";
  const label = isLeft ? "Shadow clipping" : "Highlight clipping";

  return (
    <div
      className={`pointer-events-auto absolute top-1.5 ${
        isLeft ? "left-1.5" : "right-1.5"
      } z-10 flex items-center`}
      title={
        active
          ? `${label}: ${percent.toFixed(1)}% of pixels ${
              isLeft ? "crushed to black" : "blown to pure white"
            }`
          : `No ${label.toLowerCase()}`
      }
    >
      <div
        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
          active
            ? isLeft
              ? "border-blue-500/80 bg-blue-950/80 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              : "border-rose-500/80 bg-rose-950/80 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
            : "border-white/10 bg-black/40 hover:border-white/20"
        }`}
      >
        <svg width="7" height="7" viewBox="0 0 7 7" aria-hidden="true">
          <path
            d={isLeft ? "M0 0 L7 0 L0 7 Z" : "M7 0 L7 7 L0 0 Z"}
            fill={
              active
                ? isLeft
                  ? "#60a5fa"
                  : "#fb7185"
                : "rgba(255, 255, 255, 0.2)"
            }
          />
        </svg>
      </div>
    </div>
  );
}

export function Histogram() {
  const histogram = useEditorStore((state) => state.histogram);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<HistogramMode>("rgb");
  const [hoverBin, setHoverBin] = useState<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    // Subtle dark theme backdrop
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(0, 0, width, height);

    // Draw tone zone dividers (20%, 40%, 60%, 80%)
    ctx.save();
    ctx.setLineDash([2 * dpr, 3 * dpr]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1 * dpr;

    for (let i = 1; i <= 4; i += 1) {
      const x = Math.round((i / 5) * width);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Mid-level horizontal reference guide
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.beginPath();
    ctx.moveTo(0, Math.round(height * 0.5));
    ctx.lineTo(width, Math.round(height * 0.5));
    ctx.stroke();
    ctx.restore();

    if (histogram.samples === 0) {
      return;
    }

    // Active tone zone highlight under hover
    if (hoverBin !== null) {
      const activeZone = TONE_ZONES.find(
        (z) => hoverBin >= z.min && hoverBin <= z.max,
      );
      if (activeZone) {
        const xStart = (activeZone.min / 255) * width;
        const xEnd = (activeZone.max / 255) * width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.fillRect(xStart, 0, xEnd - xStart, height);
      }
    }

    const peak = Math.max(histogram.peak, 1);
    const topPadding = 6 * dpr;
    const bottomPadding = 2 * dpr;
    const drawHeight = height - topPadding - bottomPadding;

    const smoothR = smoothBins(histogram.red);
    const smoothG = smoothBins(histogram.green);
    const smoothB = smoothBins(histogram.blue);
    const smoothL = smoothBins(histogram.luminance ?? new Uint32Array(HISTOGRAM_BINS));

    const drawCurve = (
      smoothed: Float32Array,
      gradientStart: string,
      gradientEnd: string,
      strokeColor: string,
      strokeWidth = 1.25 * dpr,
    ) => {
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let bin = 0; bin < HISTOGRAM_BINS; bin += 1) {
        const x = (bin / (HISTOGRAM_BINS - 1)) * width;
        const norm = Math.min(smoothed[bin] / peak, 1);
        const y = height - bottomPadding - Math.pow(norm, DISPLAY_GAMMA) * drawHeight;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, topPadding, 0, height);
      gradient.addColorStop(0, gradientStart);
      gradient.addColorStop(1, gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Channel stroke edge for crisp contour definition
      ctx.beginPath();
      for (let bin = 0; bin < HISTOGRAM_BINS; bin += 1) {
        const x = (bin / (HISTOGRAM_BINS - 1)) * width;
        const norm = Math.min(smoothed[bin] / peak, 1);
        const y = height - bottomPadding - Math.pow(norm, DISPLAY_GAMMA) * drawHeight;
        if (bin === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    };

    if (mode === "rgb") {
      // Screen blending produces authentic Lightroom channel mixes (yellow, cyan, magenta)
      // without washing out to a blinding white block.
      ctx.globalCompositeOperation = "screen";

      // Red channel
      drawCurve(
        smoothR,
        "rgba(244, 63, 94, 0.42)",
        "rgba(244, 63, 94, 0.03)",
        "rgba(251, 113, 133, 0.9)",
      );

      // Green channel
      drawCurve(
        smoothG,
        "rgba(34, 197, 94, 0.40)",
        "rgba(34, 197, 94, 0.03)",
        "rgba(74, 222, 128, 0.9)",
      );

      // Blue channel
      drawCurve(
        smoothB,
        "rgba(59, 130, 246, 0.45)",
        "rgba(59, 130, 246, 0.04)",
        "rgba(96, 165, 250, 0.9)",
      );

      // Subtle luminance trace for tonal grounding
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      for (let bin = 0; bin < HISTOGRAM_BINS; bin += 1) {
        const x = (bin / (HISTOGRAM_BINS - 1)) * width;
        const norm = Math.min(smoothL[bin] / peak, 1);
        const y = height - bottomPadding - Math.pow(norm, DISPLAY_GAMMA) * drawHeight;
        if (bin === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    } else if (mode === "luma") {
      ctx.globalCompositeOperation = "source-over";
      drawCurve(
        smoothL,
        "rgba(241, 245, 249, 0.48)",
        "rgba(148, 163, 184, 0.03)",
        "rgba(255, 255, 255, 0.95)",
        1.5 * dpr,
      );
    } else if (mode === "red") {
      ctx.globalCompositeOperation = "source-over";
      drawCurve(
        smoothR,
        "rgba(244, 63, 94, 0.55)",
        "rgba(244, 63, 94, 0.04)",
        "rgba(251, 113, 133, 0.95)",
        1.5 * dpr,
      );
    } else if (mode === "green") {
      ctx.globalCompositeOperation = "source-over";
      drawCurve(
        smoothG,
        "rgba(34, 197, 94, 0.52)",
        "rgba(34, 197, 94, 0.04)",
        "rgba(74, 222, 128, 0.95)",
        1.5 * dpr,
      );
    } else if (mode === "blue") {
      ctx.globalCompositeOperation = "source-over";
      drawCurve(
        smoothB,
        "rgba(59, 130, 246, 0.58)",
        "rgba(59, 130, 246, 0.04)",
        "rgba(96, 165, 250, 0.95)",
        1.5 * dpr,
      );
    }

    // Cursor indicator line and value point
    if (hoverBin !== null) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      const hoverX = Math.round((hoverBin / (HISTOGRAM_BINS - 1)) * width);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();

      ctx.restore();
    }

    ctx.globalCompositeOperation = "source-over";
  }, [histogram, mode, hoverBin]);

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

  const activeZone =
    hoverBin !== null
      ? TONE_ZONES.find((z) => hoverBin >= z.min && hoverBin <= z.max)
      : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (histogram.samples === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const bin = Math.min(
      HISTOGRAM_BINS - 1,
      Math.max(0, Math.round((x / rect.width) * (HISTOGRAM_BINS - 1))),
    );
    setHoverBin(bin);
  };

  const handleMouseLeave = () => {
    setHoverBin(null);
  };

  const rVal = hoverBin !== null ? histogram.red[hoverBin] : null;
  const gVal = hoverBin !== null ? histogram.green[hoverBin] : null;
  const bVal = hoverBin !== null ? histogram.blue[hoverBin] : null;

  return (
    <div className="border-b border-line px-5 py-3.5">
      {/* Header with Title/Readout and Channel Selectors */}
      <div className="flex items-center justify-between gap-2 pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="text-[12px] font-medium tracking-tight text-ink">
            Histogram
          </h2>
          {activeZone ? (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-ink-muted">
              <span className="text-ink-faint">/</span>
              <span className="font-semibold text-accent">{activeZone.name}</span>
              <span className="text-ink-faint">({hoverBin})</span>
            </span>
          ) : null}
        </div>

        {/* Channel view mode pills */}
        <div className="flex items-center gap-0.5 rounded border border-line bg-raised/50 p-0.5 text-[10px] font-medium">
          {(["rgb", "luma", "red", "green", "blue"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded px-1.5 py-0.5 uppercase transition-colors ${
                mode === m
                  ? "bg-ink/15 text-ink shadow-sm"
                  : "text-ink-faint hover:text-ink-muted"
              }`}
            >
              {m === "rgb"
                ? "RGB"
                : m === "luma"
                  ? "Lum"
                  : m[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Histogram Canvas Viewport */}
      <div
        className="group relative h-28 w-full cursor-crosshair overflow-hidden rounded-md border border-line bg-[#0c0c0e] shadow-inner select-none transition-colors sm:h-32"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="RGB histogram showing pixel luminance distribution across tone zones"
          className="block h-full w-full"
        />

        {/* Shadow and Highlight Clipping Indicators */}
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

        {/* Empty state overlay */}
        {histogram.samples === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-ink-faint">
            <span className="text-[11px] font-medium">No photo active</span>
            <span className="text-[10px] opacity-70">
              Open an image to inspect tonality
            </span>
          </div>
        ) : null}

        {/* Hover info badge overlay */}
        {hoverBin !== null && rVal !== null && gVal !== null && bVal !== null ? (
          <div className="pointer-events-none absolute bottom-1.5 left-2 flex items-center gap-2 rounded bg-black/75 px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm">
            <span className="text-rose-400">R {rVal}</span>
            <span className="text-emerald-400">G {gVal}</span>
            <span className="text-blue-400">B {bVal}</span>
          </div>
        ) : null}
      </div>

      {/* Lightroom Tone Zones Axis */}
      <div className="mt-1.5 grid grid-cols-5 text-center font-mono text-[9px] uppercase tracking-wider text-ink-faint">
        {TONE_ZONES.map((zone) => {
          const isCurrent = activeZone?.name === zone.name;
          return (
            <span
              key={zone.name}
              className={`transition-colors truncate ${
                isCurrent ? "font-semibold text-accent" : "hover:text-ink-muted"
              }`}
            >
              {zone.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
