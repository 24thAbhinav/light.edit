"use client";

import type { ParameterDefinition } from "@/lib/edit-state";
import { selectParameter, useEditorStore } from "@/lib/editor-store";
import { Slider } from "./slider";

export function ParameterSlider({
  parameter,
}: {
  parameter: ParameterDefinition;
}) {
  const value = useEditorStore(selectParameter(parameter.key));
  const setEdit = useEditorStore((state) => state.setEdit);
  const resetEdit = useEditorStore((state) => state.resetEdit);

  return (
    <Slider
      label={parameter.label}
      value={value}
      min={parameter.min}
      max={parameter.max}
      step={parameter.step}
      defaultValue={parameter.defaultValue}
      format={parameter.format}
      gradient={parameter.gradient}
      onChange={(next) => setEdit(parameter.key, next)}
      onReset={() => resetEdit(parameter.key)}
    />
  );
}
