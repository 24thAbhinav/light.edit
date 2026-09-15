"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useEditorStore } from "@/lib/editor-store";
import { processImageData } from "@/lib/engine/image-processor";
import { DevelopPanel } from "./develop-panel";
import { EmptyState } from "./empty-state";
import { Stage } from "./stage";

const exportName = (name: string | null) => {
  const base = name ? name.replace(/\.[^.]+$/, "") : "photo";
  return `${base}-edited.png`;
};

export function EditorShell() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const loadFile = useCallback((file: File) => {
    if (file.type && !file.type.startsWith("image/")) {
      setError("That file is not an image. Choose a JPEG, PNG, or WebP.");
      return;
    }

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    const next = new Image();
    next.onload = () => {
      setImage(next);
      setFileName(file.name);
      setError(null);
    };
    next.onerror = () => {
      URL.revokeObjectURL(url);
      if (objectUrlRef.current === url) objectUrlRef.current = null;
      setError("That image could not be opened. Try a different file.");
    };
    next.src = url;
  }, []);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) loadFile(file);
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

  const exportImage = async () => {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const source = context.getImageData(0, 0, canvas.width, canvas.height);
    const processed = processImageData(source, useEditorStore.getState().edits);
    context.putImageData(processed, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportName(fileName);
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
          {fileName && image ? (
            <>
              <span
                className="max-w-[240px] truncate text-[12px] text-ink-muted"
                title={fileName}
              >
                {fileName}
              </span>
              <span className="font-mono text-[11px] text-ink-faint">
                {image.naturalWidth} × {image.naturalHeight}
              </span>
            </>
          ) : (
            <span className="text-[12px] text-ink-faint">No photo</span>
          )}
        </div>
        <button
          type="button"
          onClick={exportImage}
          disabled={!image}
          className="ml-auto rounded bg-ink px-3.5 py-1.5 text-[12px] font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-default disabled:bg-raised disabled:text-ink-faint disabled:hover:opacity-100"
        >
          Export
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          className="flex min-h-0 flex-1 flex-col"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <Stage image={image} isDragging={isDragging}>
            <EmptyState onChoose={openPicker} error={error} />
          </Stage>
        </div>
        <div className="pe-rise-late flex max-h-[46vh] min-h-0 w-full shrink-0 flex-col border-t border-line bg-panel md:max-h-none md:w-[336px] md:border-t-0 md:border-l">
          <DevelopPanel />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
