import Link from "next/link";
import { Fragment } from "react";
import { Eyebrow } from "./eyebrow";
import { ArrowRight, CheckGlyph } from "./icons";

const PIPELINE = ["Preset", "EditState", "Image engine", "Rendered image"];
const PIPELINE_ACTIVE = 1;

const BULLETS = [
  "Non-destructive from the first adjustment",
  "Presets and lessons share one editing model",
  "Undo any step, or compare before and after",
];

const ROWS = [
  { label: "Exposure", value: "+0.40 EV", fill: 0.58 },
  { label: "Contrast", value: "+15", fill: 0.58 },
  { label: "Temperature", value: "+7", fill: 0.54 },
  { label: "Saturation", value: "-10", fill: 0.45 },
];

const SERIALIZED: [string, string][] = [
  ["exposure", "0.4"],
  ["contrast", "15"],
  ["temperature", "7"],
  ["saturation", "-10"],
];

function EditStateCard() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-3xl blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 14%, transparent), transparent)",
          opacity: 0.6,
        }}
      />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_50px_130px_-40px_rgba(0,0,0,0.95)]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
        />

        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h3 className="text-[13px] font-medium tracking-tight text-ink">
            EditState
          </h3>
          <span className="flex items-center gap-2 font-mono text-[11px] text-ink-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            sunset.jpg
          </span>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          {ROWS.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-[12px]">
                <span className="text-ink-muted">{row.label}</span>
                <span className="font-mono text-[11px] text-ink">
                  {row.value}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.round(row.fill * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line bg-[#0f1011] px-5 py-4">
          <pre className="overflow-x-auto font-mono text-[11px] leading-5">
            {"{\n"}
            {SERIALIZED.map(([key, value], index) => (
              <span key={key}>
                {"  "}
                <span className="text-ink-faint">&quot;{key}&quot;</span>
                {": "}
                <span className="text-ink">{value}</span>
                {index < SERIALIZED.length - 1 ? ",\n" : "\n"}
              </span>
            ))}
            {"}"}
          </pre>
        </div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:py-32"
    >
      <div className="flex flex-col items-center text-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-7 max-w-2xl text-balance text-[clamp(2rem,4.2vw,3.1rem)] font-medium leading-[1.08] tracking-[-0.04em] text-ink">
          Every edit is data,{" "}
          <span className="font-serif font-normal italic tracking-[-0.01em]">
            always re-editable.
          </span>
        </h2>
        <p className="mt-6 max-w-xl text-[15px] leading-7 text-ink-muted">
          Your original stays untouched. Adjustments are stored as parameters
          and re-applied from the source every time, so nothing compounds and
          any step can be undone.
        </p>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {PIPELINE.map((step, index) => (
          <Fragment key={step}>
            {index > 0 ? (
              <ArrowRight
                width={13}
                height={13}
                className="rotate-90 text-ink-faint sm:rotate-0"
              />
            ) : null}
            <span
              className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                index === PIPELINE_ACTIVE
                  ? "border-ink bg-ink text-canvas"
                  : "border-line text-ink-faint"
              }`}
            >
              {step}
            </span>
          </Fragment>
        ))}
      </div>

      <div className="mt-20 grid gap-14 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <h3 className="max-w-md text-balance text-[clamp(1.35rem,2.1vw,1.75rem)] font-medium leading-tight tracking-[-0.03em] text-ink">
            See how a look is built,{" "}
            <span className="font-serif font-normal italic tracking-[-0.01em]">
              slider by slider.
            </span>
          </h3>
          <p className="mt-5 max-w-md text-[14px] leading-7 text-ink-muted">
            Presets and guided lessons drive the exact same edit state as the
            sliders, so you can watch a look come together and take over at any
            point.
          </p>
          <ul className="mt-8 space-y-3.5 text-[13px] text-ink-muted">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckGlyph className="mt-0.5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
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
        <EditStateCard />
      </div>
    </section>
  );
}
