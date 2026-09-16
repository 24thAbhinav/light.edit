export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ink-muted ${className}`}
    >
      <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
      {children}
    </span>
  );
}
