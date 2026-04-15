interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, eyebrow, right }: Props) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <div className="hud-label mb-2">{eyebrow}</div> : null}
        <h2 className="text-[1.35rem] font-semibold leading-tight text-text-primary">{title}</h2>
        {subtitle ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
