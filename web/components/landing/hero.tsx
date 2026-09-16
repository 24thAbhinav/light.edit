import Link from "next/link";
import { Eyebrow } from "./eyebrow";
import { ArrowRight } from "./icons";
import { HeroPreview } from "./hero-preview";

export function Hero() {
  return (
    <section className="relative isolate px-6 pt-6 sm:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-[6%] h-[440px] w-[820px] -translate-x-1/2 rounded-full blur-[130px]"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent-brand) 16%, transparent), transparent 72%)",
          }}
        />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Eyebrow className="pe-rise">Non-destructive photo editing</Eyebrow>

        <h1
          className="pe-rise mt-7 max-w-3xl text-[clamp(2.25rem,6.6vw,4.6rem)] font-medium leading-[1.03] tracking-[-0.045em] text-ink"
          style={{ animationDelay: "0.06s" }}
        >
          Edit every photo
          <span className="block font-serif font-normal italic tracking-[-0.01em]">
            keep the original.
          </span>
        </h1>

        <p
          className="pe-rise mt-6 max-w-[50ch] text-[15px] leading-7 text-ink-muted"
          style={{ animationDelay: "0.12s" }}
        >
          Adjust exposure, color, and crop on the canvas. Presets and guided
          lessons run on the same edits, so you can watch exactly how a look is
          made.
        </p>

        <div
          className="pe-rise mt-9 flex items-center gap-6"
          style={{ animationDelay: "0.18s" }}
        >
          <Link
            href="/editor"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-opacity duration-200 hover:opacity-90"
          >
            Open the editor
            <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how"
            className="text-[13px] font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="pe-rise-stage relative mx-auto mt-14 w-full max-w-[1180px] sm:mt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div
            className="absolute left-1/2 -top-28 h-[380px] w-[840px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--accent-brand) 30%, transparent), transparent 70%)",
            }}
          />
          <div
            className="absolute inset-x-16 -bottom-12 h-44 rounded-[50%] blur-[100px]"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in oklab, var(--accent-brand) 32%, transparent), transparent 72%)",
            }}
          />
        </div>
        <HeroPreview />
      </div>
    </section>
  );
}
