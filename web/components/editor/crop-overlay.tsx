"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import type { CropRegion } from "@/lib/edit-state";
import {
  resizeCrop,
  type CropConstraint,
  type CropHandle,
} from "@/lib/engine/geometry";

const HANDLES: CropHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const HANDLE_POSITION: Record<CropHandle, string> = {
  nw: "left-0 top-0 cursor-nwse-resize",
  n: "left-1/2 top-0 cursor-ns-resize",
  ne: "left-full top-0 cursor-nesw-resize",
  e: "left-full top-1/2 cursor-ew-resize",
  se: "left-full top-full cursor-nwse-resize",
  s: "left-1/2 top-full cursor-ns-resize",
  sw: "left-0 top-full cursor-nesw-resize",
  w: "left-0 top-1/2 cursor-ew-resize",
};

interface DragState {
  handle: CropHandle | "move";
  startX: number;
  startY: number;
  start: CropRegion;
  width: number;
  height: number;
}

export function CropOverlay({
  crop,
  constraint,
  onChange,
}: {
  crop: CropRegion;
  constraint: CropConstraint | null;
  onChange: (crop: CropRegion) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const constraintRef = useRef<CropConstraint | null>(constraint);
  constraintRef.current = constraint;

  const begin =
    (handle: CropHandle | "move") =>
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      event.preventDefault();
      event.stopPropagation();
      rootRef.current?.setPointerCapture(event.pointerId);
      dragRef.current = {
        handle,
        startX: event.clientX,
        startY: event.clientY,
        start: crop,
        width: rect.width,
        height: rect.height,
      };
    };

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.width === 0 || drag.height === 0) return;
    const dx = (event.clientX - drag.startX) / drag.width;
    const dy = (event.clientY - drag.startY) / drag.height;
    onChange(
      resizeCrop(drag.start, drag.handle, dx, dy, constraintRef.current),
    );
  };

  const end = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    rootRef.current?.releasePointerCapture(event.pointerId);
  };

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 touch-none select-none"
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        className="absolute border border-white/90"
        style={{
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
          height: `${crop.height * 100}%`,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
        }}
        onPointerDown={begin("move")}
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/25" />
        <div className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/25" />
        <div className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/25" />
        <div className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/25" />
        {HANDLES.map((handle) => (
          <div
            key={handle}
            onPointerDown={begin(handle)}
            className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-[1px] border border-white/90 bg-black/40 ${HANDLE_POSITION[handle]}`}
          />
        ))}
      </div>
    </div>
  );
}
