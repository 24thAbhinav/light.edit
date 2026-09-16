"use client";

import {
  aspectRatioGroups,
  parameterGroups,
  straightenParameter,
  type AspectRatioKey,
} from "@/lib/edit-state";
import {
  hasEdits,
  selectActivePhoto,
  useActiveEdits,
  useEditorStore,
} from "@/lib/editor-store";
import { autoStraighten } from "@/lib/engine/geometry";
import { ParameterSlider } from "./parameter-slider";
import { Slider } from "./slider";
import {
  ChevronDownIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  LockIcon,
  RotateIcon,
  RotateLeftIcon,
  RulerIcon,
  UnlockIcon,
} from "./icons";

const BUTTON =
  "rounded border border-line-strong bg-raised px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-[#2a2a2a] disabled:cursor-default disabled:text-ink-faint disabled:hover:border-line-strong disabled:hover:bg-raised";

const ICON_BUTTON =
  "flex h-7 w-7 items-center justify-center rounded border border-line-strong bg-raised text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-default disabled:border-line disabled:text-ink-faint disabled:hover:border-line disabled:hover:text-ink-faint";

const ICON_BUTTON_ACTIVE =
  "flex h-7 w-7 items-center justify-center rounded border border-accent bg-raised text-accent transition-colors hover:border-accent";

const AUTO_BUTTON =
  "font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint transition-colors hover:text-ink disabled:cursor-default disabled:hover:text-ink-faint";

export function DevelopPanel({
  hasImage,
  cropMode,
  straightenMode,
  onToggleStraightenLine,
  onStartCrop,
  onApplyCrop,
  onCancelCrop,
}: {
  hasImage: boolean;
  cropMode: boolean;
  straightenMode: boolean;
  onToggleStraightenLine: () => void;
  onStartCrop: () => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
}) {
  const edits = useActiveEdits();
  const resetAll = useEditorStore((state) => state.resetAll);
  const rotateBy = useEditorStore((state) => state.rotateBy);
  const setCrop = useEditorStore((state) => state.setCrop);
  const setStraighten = useEditorStore((state) => state.setStraighten);
  const setAspectRatio = useEditorStore((state) => state.setAspectRatio);
  const toggleCropLock = useEditorStore((state) => state.toggleCropLock);
  const flipHorizontal = useEditorStore((state) => state.flipHorizontal);
  const flipVertical = useEditorStore((state) => state.flipVertical);
  const modified = hasEdits(edits);
  const hasCrop = edits.crop !== null;

  const runAutoStraighten = () => {
    const photo = selectActivePhoto(useEditorStore.getState());
    if (!photo) return;
    setStraighten(autoStraighten(photo.image, photo.edits));
  };

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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[12px] font-medium tracking-tight text-ink-muted">
              Geometry
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleStraightenLine}
                disabled={!hasImage}
                title="Draw a level line on the photo"
                aria-label="Straighten by drawing a line"
                aria-pressed={straightenMode}
                className={straightenMode ? ICON_BUTTON_ACTIVE : ICON_BUTTON}
              >
                <RulerIcon />
              </button>
              <button
                type="button"
                onClick={flipHorizontal}
                disabled={!hasImage}
                title="Flip horizontal"
                aria-label="Flip horizontal"
                aria-pressed={edits.flipHorizontal}
                className={
                  edits.flipHorizontal ? ICON_BUTTON_ACTIVE : ICON_BUTTON
                }
              >
                <FlipHorizontalIcon />
              </button>
              <button
                type="button"
                onClick={flipVertical}
                disabled={!hasImage}
                title="Flip vertical"
                aria-label="Flip vertical"
                aria-pressed={edits.flipVertical}
                className={edits.flipVertical ? ICON_BUTTON_ACTIVE : ICON_BUTTON}
              >
                <FlipVerticalIcon />
              </button>
              <button
                type="button"
                onClick={toggleCropLock}
                disabled={!hasImage}
                title={edits.cropLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                aria-label={edits.cropLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                aria-pressed={edits.cropLocked}
                className={edits.cropLocked ? ICON_BUTTON_ACTIVE : ICON_BUTTON}
              >
                {edits.cropLocked ? <LockIcon /> : <UnlockIcon />}
              </button>
            </div>
          </div>

          <div className="relative mt-3">
            <select
              value={edits.aspectRatio}
              onChange={(event) =>
                setAspectRatio(event.target.value as AspectRatioKey)
              }
              disabled={!hasImage}
              aria-label="Aspect ratio"
              className="w-full appearance-none rounded border border-line-strong bg-raised py-1.5 pl-2.5 pr-8 text-[12px] font-medium text-ink transition-colors hover:border-ink-faint disabled:cursor-default disabled:border-line disabled:text-ink-faint disabled:hover:border-line"
            >
              {aspectRatioGroups.map((group) =>
                group.label === null ? (
                  group.options.map((entry) => (
                    <option key={entry.key} value={entry.key}>
                      {entry.label}
                    </option>
                  ))
                ) : (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((entry) => (
                      <option key={entry.key} value={entry.key}>
                        {entry.hint
                          ? `${entry.label} · ${entry.hint}`
                          : entry.label}
                      </option>
                    ))}
                  </optgroup>
                ),
              )}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          </div>

          <div className="mt-5">
            <Slider
              label={straightenParameter.label}
              value={edits.straighten}
              min={straightenParameter.min}
              max={straightenParameter.max}
              step={straightenParameter.step}
              defaultValue={straightenParameter.defaultValue}
              format={straightenParameter.format}
              disabled={!hasImage}
              onChange={setStraighten}
              onReset={() => setStraighten(0)}
              action={
                <button
                  type="button"
                  onClick={runAutoStraighten}
                  disabled={!hasImage}
                  title="Detect the horizon and level it"
                  className={AUTO_BUTTON}
                >
                  Auto
                </button>
              }
            />
            {straightenMode ? (
              <p className="mt-2 text-[11px] leading-5 text-ink-faint">
                Drag across a line that should be level.
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => rotateBy(-90)}
              disabled={!hasImage}
              title="Rotate 90° left ([)"
              aria-label="Rotate 90 degrees left"
              className={`group ${ICON_BUTTON} w-auto gap-1 px-2.5`}
            >
              <RotateLeftIcon />
              <span className="font-mono text-[10px] leading-none text-ink-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                [
              </span>
            </button>
            <button
              type="button"
              onClick={() => rotateBy(90)}
              disabled={!hasImage}
              title="Rotate 90° right (])"
              aria-label="Rotate 90 degrees right"
              className={`group ${ICON_BUTTON} w-auto gap-1 px-2.5`}
            >
              <RotateIcon />
              <span className="font-mono text-[10px] leading-none text-ink-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                ]
              </span>
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
