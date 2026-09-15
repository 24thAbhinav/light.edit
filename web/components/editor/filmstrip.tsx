"use client";

import { useEditorStore } from "@/lib/editor-store";
import { PlusIcon } from "./icons";

export function Filmstrip({ onAdd }: { onAdd: () => void }) {
  const photos = useEditorStore((state) => state.photos);
  const activeId = useEditorStore((state) => state.activeId);
  const selectPhoto = useEditorStore((state) => state.selectPhoto);

  return (
    <div className="flex h-[92px] shrink-0 items-center gap-2 border-t border-line bg-panel px-3">
      <button
        type="button"
        onClick={onAdd}
        title="Add photos"
        aria-label="Add photos"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-dashed border-line-strong text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
      >
        <PlusIcon />
      </button>
      <div className="flex h-full flex-1 items-center gap-2 overflow-x-auto py-3">
        {photos.map((photo) => {
          const selected = photo.id === activeId;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => selectPhoto(photo.id)}
              title={photo.name}
              aria-label={photo.name}
              aria-current={selected}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border transition-colors ${
                selected
                  ? "border-accent"
                  : "border-line hover:border-ink-faint"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
