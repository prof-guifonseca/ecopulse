import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: ReactNode;
}

export function SectionHeader({ title, subtitle, eyebrow, right }: Props) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="section-mark min-w-0">
        {eyebrow ? <div className="display-eyebrow mb-1.5">{eyebrow}</div> : null}
        <h2 className="text-[1.02rem] font-semibold leading-tight tracking-[-0.01em] text-text-primary">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 max-w-[38ch] text-[0.85rem] leading-5 text-text-muted">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
