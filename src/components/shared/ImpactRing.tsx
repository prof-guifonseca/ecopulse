interface Props {
  pct: number;
  color?: string;
  size?: number;
  label: string;
  value: string | number;
}

export function ImpactRing({ pct, color = 'var(--accent-green)', size = 72, label, value }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="impact-ring"
        style={
          {
            '--ring-pct': Math.max(0, Math.min(100, pct)),
            '--ring-color': color,
            '--ring-size': `${size}px`,
          } as React.CSSProperties
        }
      >
        <span className="text-sm font-semibold">{value}</span>
      </div>
      <span className="text-center text-[0.72rem] font-medium text-text-secondary">{label}</span>
    </div>
  );
}
