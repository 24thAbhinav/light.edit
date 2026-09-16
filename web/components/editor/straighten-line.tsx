"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

interface Point {
  x: number;
  y: number;
}

const MIN_LENGTH = 12;

export function StraightenLine({
  onAngle,
}: {
  onAngle: (degrees: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);

  const toLocal = (event: ReactPointerEvent<HTMLDivElement>): Point => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    rootRef.current?.setPointerCapture(event.pointerId);
    const point = toLocal(event);
    setStart(point);
    setEnd(point);
  };

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!start) return;
    setEnd(toLocal(event));
  };

  const up = (event: ReactPointerEvent<HTMLDivElement>) => {
    rootRef.current?.releasePointerCapture(event.pointerId);
    if (start && end) {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      if (Math.hypot(dx, dy) >= MIN_LENGTH) {
        let degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (degrees > 90) degrees -= 180;
        if (degrees < -90) degrees += 180;
        onAngle(degrees);
      }
    }
    setStart(null);
    setEnd(null);
  };

  const live =
    start && end
      ? (() => {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          let degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
          if (degrees > 90) degrees -= 180;
          if (degrees < -90) degrees += 180;
          return {
            degrees,
            midX: (start.x + end.x) / 2,
            midY: (start.y + end.y) / 2,
          };
        })()
      : null;

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-10 cursor-crosshair touch-none select-none"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {start && end ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <line
            x1={0}
            y1={start.y}
            x2="100%"
            y2={start.y}
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth={1}
            strokeDasharray="5 5"
          />
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <circle cx={start.x} cy={start.y} r={3.5} fill="#ffffff" />
          <circle cx={end.x} cy={end.y} r={3.5} fill="#ffffff" />
        </svg>
      ) : null}
      {live ? (
        <span
          className="pointer-events-none absolute rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-white"
          style={{ left: `${live.midX}px`, top: `${live.midY + 14}px` }}
        >
          {live.degrees > 0 ? "+" : ""}
          {live.degrees.toFixed(1)}°
        </span>
      ) : null}
    </div>
  );
}
