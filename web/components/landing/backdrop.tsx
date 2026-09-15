export function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #070808 0%, #0a0b0c 42%, var(--canvas) 100%)",
        }}
      />
      <div
        className="absolute -top-48 left-1/2 h-[620px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 18%, transparent), transparent 66%)",
          opacity: 0.55,
        }}
      />
      <div
        className="absolute -left-40 top-24 h-[460px] w-[560px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #17313d, transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div
        className="absolute -right-32 top-44 h-[460px] w-[560px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #3a2a17, transparent 70%)",
          opacity: 0.4,
        }}
      />
      <div className="pe-grain absolute inset-0 opacity-[0.05]" />
      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{
          background: "linear-gradient(180deg, transparent, var(--canvas))",
        }}
      />
    </div>
  );
}
