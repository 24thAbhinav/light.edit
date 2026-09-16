"use client";

import { useId } from "react";

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  format: (value: number) => string;
  gradient?: readonly [string, string];
  onChange: (value: number) => void;
  onReset?: () => void;
  disabled?: boolean;
  action?: React.ReactNode;
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  defaultValue = 0,
  format,
  gradient,
  onChange,
  onReset,
  disabled = false,
  action,
}: SliderProps) {
  const id = useId();

  const span = max - min;
  const percent = ((value - min) / span) * 100;
  const centre = ((defaultValue - min) / span) * 100;
  const fillStart = Math.min(percent, centre);
  const fillWidth = Math.abs(percent - centre);
  const modified = Math.abs(value - defaultValue) > step / 2;

  return (
    <div className="pe-slider" data-modified={modified} data-disabled={disabled}>
      <div className="pe-slider-head">
        <label
          htmlFor={id}
          className="pe-slider-label"
          title={onReset ? "Double-click to reset" : undefined}
          onDoubleClick={onReset}
        >
          {label}
        </label>
        <span className="flex items-center gap-2">
          {action}
          <span
            className="pe-slider-value"
            title={onReset ? "Double-click to reset" : undefined}
            onDoubleClick={onReset}
          >
            {format(value)}
          </span>
        </span>
      </div>
      <div className="pe-slider-track">
        {gradient ? (
          <div
            className="pe-slider-gradient"
            style={{
              background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
            }}
          />
        ) : (
          <div className="pe-slider-rail" />
        )}
        <div
          className="pe-slider-fill"
          style={{ left: `${fillStart}%`, width: `${fillWidth}%` }}
        />
        <div className="pe-slider-center" style={{ left: `${centre}%` }} />
        <input
          id={id}
          className="pe-range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={format(value)}
          onChange={(event) => onChange(Number(event.target.value))}
          onDoubleClick={onReset}
        />
      </div>
    </div>
  );
}
