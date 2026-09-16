import Link from "next/link";
import { Eyebrow } from "./eyebrow";
import { ArrowRight } from "./icons";

export function FinalCta() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-4 sm:pb-32">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel px-6 py-20 text-center sm:py-28">
        <div
          aria-hidden
          className="absolute inset-x-0 -top-40 h-80 blur-[120px]"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 18%, transparent), transparent)",
            opacity: 0.75,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
        />

        <div className="relative flex flex-col items-center">
          <Eyebrow>Start now</Eyebrow>
          <h2 className="mt-7 max-w-2xl text-balance text-[clamp(2rem,4.2vw,3.1rem)] font-medium leading-[1.08] tracking-[-0.04em] text-ink">
            Start editing,{" "}
            <span className="font-serif font-normal italic tracking-[-0.01em]">
              keep the original.
            </span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-ink-muted">
            No account and no upload. Your photos stay on your device.
          </p>
          <div className="mt-9">
            <Link
              href="/editor"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-opacity duration-200 hover:opacity-90"
            >
              Open the editor
              <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
