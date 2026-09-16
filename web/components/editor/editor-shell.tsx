"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { defaultEditState, type CropRegion } from "@/lib/edit-state";
import {
  createPhotoId,
  getActiveEdits,
  selectActivePhoto,
  useCanRedo,
  useCanUndo,
  useEditorStore,
  type EditorPhoto,
} from "@/lib/editor-store";
import { renderEditedCanvas } from "@/lib/engine/render";
import { DevelopPanel } from "./develop-panel";
import { EmptyState } from "./empty-state";
import { Filmstrip } from "./filmstrip";
import { RedoIcon, UndoIcon } from "./icons";
import { Stage } from "./stage";

const exportName = (name: string | null) => {
  const base = name ? name.replace(/\.[^.]+$/, "") : "photo";
  return `${base}-edited.png`;
};

const HEADER_BUTTON =
  "flex h-7 w-7 items-center justify-center rounded border border-line-strong bg-raised text-ink-muted transition-colors hover:border-ink-faint hover:text-ink disabled:cursor-default disabled:border-line disabled:text-ink-faint disabled:hover:border-line disabled:hover:text-ink-faint";

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (target.tagName === "TEXTAREA") return true;
  if (target.tagName === "SELECT") return true;
  if (target.tagName === "INPUT") {
    const type = (target as HTMLInputElement).type;
    return [
      "text",
      "search",
      "email",
      "url",
      "tel",
      "password",
      "number",
    ].includes(type);
  }
  return false;
};

export function EditorShell() {
  const [isDragging, setIsDragging] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [straightenMode, setStraightenMode] = useState(false);
  const [compare, setCompare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const cropBackupRef = useRef<CropRegion | null>(null);

  const activeImage = useEditorStore(
    (state) => selectActivePhoto(state)?.image ?? null,
  );
  const activeName = useEditorStore(
    (state) => selectActivePhoto(state)?.name ?? null,
  );
  const activeWidth = useEditorStore(
    (state) => selectActivePhoto(state)?.width ?? 0,
  );
  const activeHeight = useEditorStore(
    (state) => selectActivePhoto(state)?.height ?? 0,
  );
  const hasPhotos = useEditorStore((state) => state.photos.length > 0);
  const addPhotos = useEditorStore((state) => state.addPhotos);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const loadPhoto = useCallback(
    (file: File) =>
      new Promise<EditorPhoto | null>((resolve) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
          objectUrlsRef.current.push(url);
          resolve({
            id: createPhotoId(),
            name: file.name,
            url,
            image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            edits: defaultEditState,
            past: [],
            future: [],
            lastAction: null,
          });
        };
        image.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        image.src = url;
      }),
    [],
  );

  const loadFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const accepted = files.filter(
        (file) => !file.type || file.type.startsWith("image/"),
      );
      if (accepted.length === 0) {
        setError("Those files are not images. Choose JPEG, PNG, or WebP.");
        return;
      }
      const loaded = await Promise.all(accepted.map(loadPhoto));
      const entries = loaded.filter(
        (entry): entry is EditorPhoto => entry !== null,
      );
      if (entries.length > 0) {
        addPhotos(entries);
        setError(null);
      } else {
        setError("Those images could not be opened. Try different files.");
      }
    },
    [addPhotos, loadPhoto],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) useEditorStore.getState().redo();
        else useEditorStore.getState().undo();
        return;
      }

      if (!mod && (event.code === "BracketRight" || key === "]")) {
        event.preventDefault();
        useEditorStore.getState().rotateBy(90);
        return;
      }

      if (!mod && (event.code === "BracketLeft" || key === "[")) {
        event.preventDefault();
        useEditorStore.getState().rotateBy(-90);
        return;
      }

      if (!mod && key === "y") {
        event.preventDefault();
        setCompare(true);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "y") setCompare(false);
    };

    const onBlur = () => setCompare(false);

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) loadFiles(files);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length > 0) loadFiles(files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const startCrop = () => {
    const photo = selectActivePhoto(useEditorStore.getState());
    cropBackupRef.current = photo ? photo.edits.crop : null;
    setStraightenMode(false);
    setCropMode(true);
  };

  const toggleStraightenLine = () => {
    setCropMode(false);
    setStraightenMode((active) => !active);
  };

  const applyStraightenLine = useCallback((degrees: number) => {
    const current = getActiveEdits();
    const mirrored = current.flipHorizontal !== current.flipVertical;
    const delta = mirrored ? degrees : -degrees;
    useEditorStore.getState().setStraighten(current.straighten + delta);
    setStraightenMode(false);
  }, []);

  const applyCrop = () => setCropMode(false);

  const cancelCrop = () => {
    useEditorStore.getState().setCrop(cropBackupRef.current);
    setCropMode(false);
  };

  const exportImage = async () => {
    const photo = selectActivePhoto(useEditorStore.getState());
    if (!photo) return;
    const canvas = renderEditedCanvas(photo.image, photo.edits);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportName(photo.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-dvh flex-col bg-canvas text-ink">
      <header className="pe-rise flex h-14 shrink-0 items-center gap-5 border-b border-line bg-panel px-5">
        <div className="flex items-baseline text-[14px] font-medium tracking-tight text-ink">
          light
          <span className="pe-wordmark-ext text-ink-faint">.edit</span>
        </div>
        <div className="hidden min-w-0 items-baseline gap-3 sm:flex">
          {activeName ? (
            <>
              <span
                className="max-w-[240px] truncate text-[12px] text-ink-muted"
                title={activeName}
              >
                {activeName}
              </span>
              <span className="font-mono text-[11px] text-ink-faint">
                {activeWidth} × {activeHeight}
              </span>
            </>
          ) : (
            <span className="text-[12px] text-ink-faint">No photo</span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden text-[11px] text-ink-faint lg:inline">
            Hold Y to compare
          </span>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className={HEADER_BUTTON}
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className={HEADER_BUTTON}
          >
            <RedoIcon />
          </button>
          <button
            type="button"
            onClick={exportImage}
            disabled={!activeImage}
            className="rounded bg-ink px-3.5 py-1.5 text-[12px] font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-default disabled:bg-raised disabled:text-ink-faint disabled:hover:opacity-100"
          >
            Export
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          className="flex min-h-0 flex-1 flex-col"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <Stage
            image={activeImage}
            isDragging={isDragging}
            cropMode={cropMode}
            straightenMode={straightenMode}
            compare={compare}
            onStraightenLine={applyStraightenLine}
          >
            <EmptyState onChoose={openPicker} error={error} />
          </Stage>
        </div>
        <div className="pe-rise-late flex max-h-[46vh] min-h-0 w-full shrink-0 flex-col border-t border-line bg-panel md:max-h-none md:w-[336px] md:border-t-0 md:border-l">
          <DevelopPanel
            hasImage={activeImage !== null}
            cropMode={cropMode}
            straightenMode={straightenMode}
            onToggleStraightenLine={toggleStraightenLine}
            onStartCrop={startCrop}
            onApplyCrop={applyCrop}
            onCancelCrop={cancelCrop}
          />
        </div>
      </div>

      {hasPhotos ? <Filmstrip onAdd={openPicker} /> : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
