export function SiteFooter() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-[12px] text-ink-faint sm:flex-row">
        <span className="flex items-baseline font-medium tracking-tight text-ink-muted">
          light
          <span className="pe-wordmark-ext">.edit</span>
        </span>
        <span>Non-destructive photo editing</span>
      </div>
    </footer>
  );
}
