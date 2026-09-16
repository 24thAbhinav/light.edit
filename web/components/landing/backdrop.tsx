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
            "linear-gradient(180deg, #060607 0%, #08080a 46%, #0b0b0d 100%)",
        }}
      />
      <div
        className="absolute -top-48 left-1/2 h-[620px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent-brand) 20%, transparent), transparent 66%)",
          opacity: 0.5,
        }}
      />
      <div
        className="absolute -left-40 top-24 h-[460px] w-[560px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #1a1430, transparent 70%)",
          opacity: 0.55,
        }}
      />
      <div
        className="absolute -right-32 top-44 h-[460px] w-[560px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, #3a1728, transparent 70%)",
          opacity: 0.45,
        }}
      />
      <div
        className="absolute left-1/2 top-[42%] h-[560px] w-[940px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--accent-brand) 11%, transparent), transparent 72%)",
          opacity: 0.75,
        }}
      />
      <div
        className="absolute -right-40 top-[74%] h-[520px] w-[620px] rounded-full blur-[130px]"
        style={{
          background: "radial-gradient(circle, #2c1526, transparent 70%)",
          opacity: 0.5,
        }}
      />
      <div className="pe-grain absolute inset-0 opacity-[0.05]" />
      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{
          background: "linear-gradient(180deg, transparent, #0b0b0d)",
        }}
      />
    </div>
  );
}
