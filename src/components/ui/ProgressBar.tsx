import { cn } from '@/lib/cn';

interface Props {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

export function ProgressBar({ value, max = 100, size = 'md', className, ariaLabel }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(
        'overflow-hidden rounded-full bg-tint-3',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className
      )}
    >
      <div
        className="gradient-primary h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
