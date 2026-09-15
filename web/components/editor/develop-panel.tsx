"use client";

import { parameterGroups } from "@/lib/edit-state";
import { hasEdits, useActiveEdits, useEditorStore } from "@/lib/editor-store";
import { ParameterSlider } from "./parameter-slider";
import { RotateIcon } from "./icons";

const BUTTON =
  "rounded border border-line-strong bg-raised px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-[#2a2a2a] disabled:cursor-default disabled:text-ink-faint disabled:hover:border-line-strong disabled:hover:bg-raised";

export function DevelopPanel({
  hasImage,
  cropMode,
  onStartCrop,
  onApplyCrop,
  onCancelCrop,
}: {
  hasImage: boolean;
  cropMode: boolean;
  onStartCrop: () => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}) {
  const edits = useActiveEdits();
  const resetAll = useEditorStore((state) => state.resetAll);
  const rotateBy = useEditorStore((state) => state.rotateBy);
  const setCrop = useEditorStore((state) => state.setCrop);
  const modified = hasEdits(edits);
  const hasCrop = edits.crop !== null;

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden bg-panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-[13px] font-medium tracking-tight text-ink">
          Develop
        </h2>
        <button
          type="button"
          onClick={resetAll}
          disabled={!modified}
          className="text-[12px] text-ink-muted transition-colors hover:text-ink disabled:cursor-default disabled:text-ink-faint disabled:hover:text-ink-faint"
        >
          Reset all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <section>
          <h3 className="mb-4 text-[12px] font-medium tracking-tight text-ink-muted">
            Geometry
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => rotateBy(90)}
              disabled={!hasImage}
              title="Rotate 90°"
              aria-label="Rotate 90 degrees"
              className={`${BUTTON} flex items-center justify-center px-2.5`}
            >
              <RotateIcon />
            </button>
            {cropMode ? (
              <>
                <button
                  type="button"
                  onClick={onApplyCrop}
                  className={`${BUTTON} flex-1`}
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={onCancelCrop}
                  className={`${BUTTON} flex-1`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartCrop}
                disabled={!hasImage}
                className={`${BUTTON} flex-1 ${hasCrop ? "border-accent text-accent hover:border-accent" : ""}`}
              >
                Crop
              </button>
            )}
          </div>
          {cropMode ? (
            <button
              type="button"
              onClick={() => setCrop(null)}
              disabled={!hasCrop}
              className={`${BUTTON} mt-2 w-full`}
            >
              Reset crop
            </button>
          ) : null}
        </section>

        {parameterGroups.map((group) => (
          <section key={group.label} className="mt-7 border-t border-line pt-6">
            <h3 className="mb-4 text-[12px] font-medium tracking-tight text-ink-muted">
              {group.label}
            </h3>
            <div className="flex flex-col gap-5">
              {group.parameters.map((parameter) => (
                <ParameterSlider key={parameter.key} parameter={parameter} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
