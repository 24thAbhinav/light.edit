import Link from "next/link";
import { ArrowRight } from "./icons";
import { ProductFrame } from "./product-frame";

export function Hero() {
  return (
    <section className="relative px-6 pt-8 sm:pt-14">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[12px] text-ink-muted backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Runs entirely in your browser
        </span>
        <h1 className="mt-7 text-balance text-[clamp(2.25rem,6.2vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.04em] text-ink">
          Edit photos
          <br />
          <span className="font-serif font-normal italic tracking-[-0.01em]">
            without losing the original.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-7 text-ink-muted">
          Adjust exposure, color, and crop on the canvas. Presets and guided
          lessons run on the same edits, so you can see exactly how a look is
          made.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/editor"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Open the editor
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink-faint hover:bg-white/[0.03]"
          >
            See how it works
          </a>
        </div>
      </div>
      <div className="mx-auto mt-14 max-w-5xl sm:mt-20">
        <ProductFrame />
      </div>
    </section>
  );
}
