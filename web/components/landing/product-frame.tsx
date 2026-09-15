import { PlayGlyph } from "./icons";

export function ProductFrame() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-x-10 -top-10 h-44 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 16%, transparent), transparent)",
          opacity: 0.8,
        }}
      />
      <div className="relative overflow-hidden rounded-xl border border-line bg-[#0f1011] shadow-[0_50px_140px_-30px_rgba(0,0,0,0.95)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="ml-3 text-[11px] text-ink-faint">
            light.edit — product demo
          </span>
        </div>
        <div className="relative aspect-[16/10] w-full">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line-strong text-ink-muted">
              <PlayGlyph width={18} height={18} />
            </span>
            <span className="text-[13px] font-medium text-ink-muted">
              Product video
            </span>
            <span className="text-[12px] text-ink-faint">Coming soon</span>
          </div>
          <div className="pe-grain absolute inset-0 opacity-[0.03]" />
        </div>
      </div>
    </div>
  );
}
