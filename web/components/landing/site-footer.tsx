import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-line/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-6 py-10 sm:flex-row sm:justify-between sm:gap-8">
        <span className="flex items-baseline text-[14px] font-medium tracking-tight text-ink">
          light
          <span className="pe-wordmark-ext text-ink-faint">.edit</span>
        </span>
        <nav className="flex items-center gap-7 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          <a
            href="#how"
            className="transition-colors duration-200 hover:text-ink-muted"
          >
            How it works
          </a>
          <Link
            href="/editor"
            className="transition-colors duration-200 hover:text-ink-muted"
          >
            Editor
          </Link>
        </nav>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
          Runs on device
        </span>
      </div>
    </footer>
  );
}
