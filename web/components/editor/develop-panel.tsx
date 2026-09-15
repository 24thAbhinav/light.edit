"use client";

import { parameterGroups } from "@/lib/edit-state";
import { hasEdits, useEditorStore } from "@/lib/editor-store";
import { ParameterSlider } from "./parameter-slider";

export function DevelopPanel() {
  const edits = useEditorStore((state) => state.edits);
  const resetAll = useEditorStore((state) => state.resetAll);
  const modified = hasEdits(edits);

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
        {parameterGroups.map((group, index) => (
          <section
            key={group.label}
            className={index === 0 ? "" : "mt-7 border-t border-line pt-6"}
          >
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
