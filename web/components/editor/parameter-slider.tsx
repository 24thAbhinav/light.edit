"use client";

import { useId } from "react";
import type { ParameterDefinition } from "@/lib/edit-state";
import { selectParameter, useEditorStore } from "@/lib/editor-store";

export function ParameterSlider({
  parameter,
}: {
  parameter: ParameterDefinition;
}) {
  const id = useId();
  const value = useEditorStore(selectParameter(parameter.key));
  const setEdit = useEditorStore((state) => state.setEdit);
  const resetEdit = useEditorStore((state) => state.resetEdit);

  const span = parameter.max - parameter.min;
  const percent = ((value - parameter.min) / span) * 100;
  const center = ((parameter.defaultValue - parameter.min) / span) * 100;
  const fillStart = Math.min(percent, center);
  const fillWidth = Math.abs(percent - center);
  const modified = Math.abs(value - parameter.defaultValue) > parameter.step / 2;

  const reset = () => resetEdit(parameter.key);

  return (
    <div className="pe-slider" data-modified={modified}>
      <div className="pe-slider-head">
        <label
          htmlFor={id}
          className="pe-slider-label"
          title="Double-click to reset"
          onDoubleClick={reset}
        >
          {parameter.label}
        </label>
        <span
          className="pe-slider-value"
          title="Double-click to reset"
          onDoubleClick={reset}
        >
          {parameter.format(value)}
        </span>
      </div>
      <div className="pe-slider-track">
        {parameter.gradient ? (
          <div
            className="pe-slider-gradient"
            style={{
              background: `linear-gradient(90deg, ${parameter.gradient[0]}, ${parameter.gradient[1]})`,
            }}
          />
        ) : (
          <div className="pe-slider-rail" />
        )}
        <div
          className="pe-slider-fill"
          style={{ left: `${fillStart}%`, width: `${fillWidth}%` }}
        />
        <div className="pe-slider-center" style={{ left: `${center}%` }} />
        <input
          id={id}
          className="pe-range"
          type="range"
          min={parameter.min}
          max={parameter.max}
          step={parameter.step}
          value={value}
          aria-label={parameter.label}
          aria-valuetext={parameter.format(value)}
          onChange={(event) => setEdit(parameter.key, Number(event.target.value))}
          onDoubleClick={reset}
        />
      </div>
    </div>
  );
}
