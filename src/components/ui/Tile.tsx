import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'brand' | 'reward';
type Size = 'sm' | 'md';
type Align = 'center' | 'start';

interface Props {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  size?: Size;
  align?: Align;
  className?: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  default: 'border-[var(--line-soft)] bg-tint-1',
  brand: 'border-[var(--line-active)] bg-tint-green-1',
  reward: 'border-[color:color-mix(in_srgb,var(--accent-gold)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-gold)_8%,transparent)]',
};

const VALUE_TONE: Record<Tone, string> = {
  default: 'text-[var(--text-primary)]',
  brand: 'text-[var(--accent-green)]',
  reward: 'text-[var(--accent-gold)]',
};

/**
 * Tile — compact inset surface for metrics, label/value, hint, optional icon.
 * Replaces the ad-hoc bg-white/[0.02] + border + rounded-md recipe repeated
 * across Stat / ImpactMetric / FundMetric / PackMetric and inline blocks.
 */
export function Tile({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  size = 'md',
  align = 'center',
  className,
}: Props) {
  const padX = size === 'sm' ? 'px-3' : 'px-4';
  const padY = size === 'sm' ? 'py-2.5' : 'py-3';

  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border',
        padX,
        padY,
        align === 'center' ? 'text-center' : 'text-left',
        TONE_CLASSES[tone],
        className
      )}
    >
      <div className={cn('flex items-center gap-1.5', align === 'center' ? 'justify-center' : '')}>
        {icon ? <span className="text-[var(--accent-green)]">{icon}</span> : null}
        <span className="t-label">{label}</span>
      </div>
      <div className={cn('mt-1.5 leading-none font-semibold', size === 'sm' ? 'text-base' : 'text-lg', VALUE_TONE[tone])}>
        {value}
      </div>
      {hint ? <div className="t-caption mt-1">{hint}</div> : null}
    </div>
  );
}
