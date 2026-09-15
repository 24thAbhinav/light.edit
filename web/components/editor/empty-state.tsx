"use client";

export function EmptyState({
  onChoose,
  error,
}: {
  onChoose: () => void;
  error: string | null;
}) {
  return (
    <div className="pe-empty flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-1.5">
        <p className="text-[15px] font-medium tracking-tight text-ink">
          Drop a photo to begin
        </p>
        <p className="text-[12px] text-ink-muted">JPEG, PNG, or WebP</p>
      </div>
      <button
        type="button"
        onClick={onChoose}
        className="rounded border border-line-strong bg-raised px-4 py-2 text-[12px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-[#2a2a2a]"
      >
        Choose a photo
      </button>
      {error ? <p className="max-w-xs text-[12px] text-accent">{error}</p> : null}
    </div>
  );
}
