import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  align?: 'center' | 'start';
  className?: string;
}

export function Stat({ label, value, hint, icon, align = 'center', className }: Props) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-3 py-3',
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      <div className={cn('flex items-center gap-1.5', align === 'center' ? 'justify-center' : '')}>
        {icon ? <span className="text-accent-green">{icon}</span> : null}
        <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">{label}</span>
      </div>
      <div className="mt-1.5 text-lg font-semibold leading-none text-text-primary">{value}</div>
      {hint ? <div className="mt-1 text-[0.72rem] text-text-muted">{hint}</div> : null}
    </div>
  );
}
