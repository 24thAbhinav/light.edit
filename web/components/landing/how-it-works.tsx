import Link from "next/link";
import { ArrowRight, CheckGlyph } from "./icons";

const CHIPS = ["Light", "Color", "Crop", "Presets", "Guides"];

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

function EditStateCard() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-3xl blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 12%, transparent), transparent)",
          opacity: 0.6,
        }}
      />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-panel p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink">EditState</span>
          <span className="font-mono text-[11px] text-ink-faint">
            sunset.jpg
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {ROWS.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between text-[12px]">
                <span className="text-ink-muted">{row.label}</span>
                <span className="font-mono text-[11px] text-ink-faint">
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
        <pre className="mt-6 overflow-x-auto rounded-lg border border-line bg-[#0f1011] p-3 font-mono text-[11px] leading-5 text-ink-muted">
          {`{
  "exposure": 0.4,
  "contrast": 15,
  "temperature": 7,
  "saturation": -10
}`}
        </pre>
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:py-28"
    >
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[12px] text-ink-muted">
          How it works
        </span>
        <h2 className="mt-6 max-w-2xl text-balance text-[clamp(1.75rem,3.6vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.03em] text-ink">
          Every edit is data,{" "}
          <span className="font-serif font-normal italic">
            always re-editable.
          </span>
        </h2>
        <p className="mt-6 max-w-xl text-[15px] leading-7 text-ink-muted">
          Your original stays untouched. Adjustments are stored as parameters
          and re-applied from the source every time, so nothing compounds and
          any step can be undone.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {CHIPS.map((chip, index) => (
          <span
            key={chip}
            className={`rounded-full border px-3.5 py-1.5 text-[12px] ${
              index === 0
                ? "border-ink bg-ink text-canvas"
                : "border-line text-ink-muted"
            }`}
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          <h3 className="max-w-md text-balance text-[clamp(1.4rem,2.4vw,1.9rem)] font-medium leading-tight tracking-[-0.02em] text-ink">
            See how a look is built,{" "}
            <span className="font-serif font-normal italic">
              slider by slider.
            </span>
          </h3>
          <p className="mt-5 max-w-md text-[14px] leading-7 text-ink-muted">
            Presets and guided lessons drive the exact same edit state as the
            sliders, so you can watch a look come together and take over at any
            point.
          </p>
          <ul className="mt-7 space-y-3 text-[13px] text-ink-muted">
            {BULLETS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckGlyph className="mt-0.5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link
              href="/editor"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-medium text-canvas transition-opacity hover:opacity-90"
            >
              Open the editor
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <EditStateCard />
      </div>
    </section>
  );
}
