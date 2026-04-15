import { cn } from '@/lib/cn';

type Tone = 'brand' | 'reward' | 'neutral';

interface Props {
  value: number;
  max?: number;
  tone?: Tone;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

const BG: Record<Tone, string> = {
  brand: 'var(--gradient-primary)',
  reward: 'var(--gradient-gold)',
  neutral: 'rgba(255,255,255,0.24)',
};

export function ProgressBar({ value, max = 100, tone = 'brand', size = 'md', className, ariaLabel }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(
        'overflow-hidden rounded-full bg-white/[0.06]',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className
      )}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, background: BG[tone] }}
      />
    </div>
  );
}
