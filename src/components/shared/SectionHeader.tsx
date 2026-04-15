interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, eyebrow, right }: Props) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-[0.78rem] font-medium text-text-secondary">{eyebrow}</div> : null}
        <h2 className="text-[1.12rem] font-semibold leading-tight tracking-[-0.02em] text-text-primary">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-[34ch] text-sm leading-5 text-text-secondary">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
