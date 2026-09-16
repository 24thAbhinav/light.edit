import Link from "next/link";
import { ArrowRight } from "./icons";

export function SiteNav() {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link
        href="/"
        className="flex items-baseline text-[15px] font-medium tracking-tight text-ink"
      >
        light
        <span className="pe-wordmark-ext text-ink-faint">.edit</span>
      </Link>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-[12px] tracking-tight text-ink-muted sm:flex">
        <a href="#how" className="transition-colors duration-200 hover:text-ink">
          How it works
        </a>
        <Link
          href="/editor"
          className="transition-colors duration-200 hover:text-ink"
        >
          Editor
        </Link>
      </nav>
      <Link
        href="/editor"
        className="group inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-[12px] font-medium text-ink transition-colors duration-200 hover:border-ink-faint hover:bg-white/[0.03]"
      >
        Open editor
        <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </header>
  );
}
