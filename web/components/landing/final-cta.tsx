import Link from "next/link";
import { ArrowRight } from "./icons";

export function FinalCta() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-panel px-6 py-16 text-center sm:py-20">
        <div
          aria-hidden
          className="absolute inset-x-0 -top-24 h-56 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 16%, transparent), transparent)",
            opacity: 0.7,
          }}
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-balance text-[clamp(1.75rem,4vw,2.75rem)] font-medium leading-[1.1] tracking-[-0.03em] text-ink">
            Start editing,{" "}
            <span className="font-serif font-normal italic">
              keep the original.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[14px] leading-7 text-ink-muted">
            No account and no upload. Your photos stay on your device.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/editor"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Open the editor
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
