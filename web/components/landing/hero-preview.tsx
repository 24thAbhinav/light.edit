import {
  PlusIcon,
  RedoIcon,
  RotateIcon,
  UndoIcon,
} from "@/components/editor/icons";
import { HeroPhoto } from "./hero-photo";

const CHROME_BUTTON =
  "flex h-7 w-7 items-center justify-center rounded border border-line-strong bg-raised text-ink-muted";

const PANEL_BUTTON =
  "rounded border border-line-strong bg-raised px-3 py-1.5 text-[12px] font-medium text-ink";

const GRADIENT = {
  temperature: ["#4a72b0", "#d29a45"] as const,
  tint: ["#3f9e6b", "#b45fb0"] as const,
};

interface PreviewParameter {
  label: string;
  value: string;
  percent: number;
  gradient?: readonly [string, string];
}

const LIGHT: PreviewParameter[] = [
  { label: "Exposure", value: "+0.40 EV", percent: 54 },
  { label: "Contrast", value: "+18", percent: 59 },
  { label: "Highlights", value: "-28", percent: 36 },
  { label: "Shadows", value: "+12", percent: 56 },
  { label: "Whites", value: "-6", percent: 47 },
  { label: "Blacks", value: "-10", percent: 45 },
];

const COLOR: PreviewParameter[] = [
  {
    label: "Temperature",
    value: "-8",
    percent: 46,
    gradient: GRADIENT.temperature,
  },
  { label: "Tint", value: "+14", percent: 57, gradient: GRADIENT.tint },
  { label: "Vibrance", value: "+16", percent: 58 },
  { label: "Saturation", value: "-6", percent: 47 },
];

const CENTER = 50;

function PreviewSlider({ label, value, percent, gradient }: PreviewParameter) {
  const left = Math.min(percent, CENTER);
  const width = Math.abs(percent - CENTER);

  return (
    <div className="pe-slider" data-modified="true">
      <div className="pe-slider-head">
        <span className="pe-slider-label">{label}</span>
        <span className="pe-slider-value">{value}</span>
      </div>
      <div className="pe-slider-track">
        {gradient ? (
          <div
            className="pe-slider-gradient"
            style={{
              background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
            }}
          />
        ) : (
          <div className="pe-slider-rail" />
        )}
        <div
          className="pe-slider-fill"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        <div className="pe-slider-center" style={{ left: `${CENTER}%` }} />
      </div>
    </div>
  );
}

const THUMBNAILS = [
  { seed: "t1", filter: undefined, active: true },
  { seed: "t2", filter: "hue-rotate(194deg) saturate(0.86) brightness(1.05)" },
  { seed: "t3", filter: "hue-rotate(62deg) saturate(0.84) brightness(0.94)" },
  { seed: "t4", filter: "grayscale(0.9) brightness(1.14)" },
];

export function HeroPreview() {
  return (
    <div
      role="img"
      aria-label="The light.edit editor: a sunset ridge photo on the canvas with a Develop panel of light and color adjustments, toolbar, and filmstrip."
      className="pointer-events-none relative select-none overflow-hidden rounded-2xl border border-line bg-canvas shadow-[0_60px_150px_-40px_rgba(0,0,0,0.95)]"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent"
      />

      <div className="flex aspect-[16/10] w-full min-w-[740px] flex-col">
        <header className="flex h-14 shrink-0 items-center gap-5 border-b border-line bg-panel px-5">
          <span className="flex items-baseline text-[14px] font-medium tracking-tight text-ink">
            light
            <span className="pe-wordmark-ext text-ink-faint">.edit</span>
          </span>
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="max-w-[240px] truncate text-[12px] text-ink-muted">
              sunset-ridge.jpg
            </span>
            <span className="font-mono text-[11px] text-ink-faint">
              6000 × 4000
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-ink-faint">
              Hold Y to compare
            </span>
            <span className={CHROME_BUTTON}>
              <UndoIcon />
            </span>
            <span className={`${CHROME_BUTTON} border-line text-ink-faint`}>
              <RedoIcon />
            </span>
            <span className="rounded bg-ink px-3.5 py-1.5 text-[12px] font-medium text-canvas">
              Export
            </span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="pe-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-8">
            <div className="relative aspect-[3/2] h-full max-w-full overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.06]">
              <HeroPhoto seed="stage" className="block h-full w-full" />
              <div className="pe-grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />
            </div>
          </div>

          <aside className="relative flex w-[288px] shrink-0 flex-col overflow-hidden border-l border-line bg-panel">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-[13px] font-medium tracking-tight text-ink">
                Develop
              </h2>
              <span className="text-[12px] text-ink-muted">Reset all</span>
            </div>

            <div className="flex-1 overflow-hidden px-4 py-3">
              <section>
                <h3 className="mb-3 text-[12px] font-medium tracking-tight text-ink-muted">
                  Geometry
                </h3>
                <div className="flex gap-2">
                  <span className={`${PANEL_BUTTON} flex items-center px-2.5`}>
                    <RotateIcon />
                  </span>
                  <span className={`${PANEL_BUTTON} flex-1 text-center`}>
                    Crop
                  </span>
                </div>
              </section>

              <section className="mt-5 border-t border-line pt-4">
                <h3 className="mb-3.5 text-[12px] font-medium tracking-tight text-ink-muted">
                  Light
                </h3>
                <div className="flex flex-col gap-4">
                  {LIGHT.map((parameter) => (
                    <PreviewSlider key={parameter.label} {...parameter} />
                  ))}
                </div>
              </section>

              <section className="mt-5 border-t border-line pt-4">
                <h3 className="mb-3.5 text-[12px] font-medium tracking-tight text-ink-muted">
                  Color
                </h3>
                <div className="flex flex-col gap-4">
                  {COLOR.map((parameter) => (
                    <PreviewSlider key={parameter.label} {...parameter} />
                  ))}
                </div>
              </section>
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-panel via-panel/70 to-transparent"
            />
          </aside>
        </div>

        <div className="flex h-[84px] shrink-0 items-center gap-2 border-t border-line bg-panel px-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-dashed border-line-strong text-ink-muted">
            <PlusIcon />
          </span>
          <div className="flex h-full items-center gap-2 py-3">
            {THUMBNAILS.map((thumbnail) => (
              <span
                key={thumbnail.seed}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded border ${
                  thumbnail.active ? "border-accent" : "border-line"
                }`}
              >
                <HeroPhoto
                  seed={thumbnail.seed}
                  className="block h-full w-full"
                  style={thumbnail.filter ? { filter: thumbnail.filter } : undefined}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
