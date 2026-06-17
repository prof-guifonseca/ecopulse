import { cn } from '@/lib/cn';

interface Props {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
  fillClassName?: string;
  ariaLabel?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  className,
  fillClassName,
  ariaLabel,
}: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn(
        'bg-tint-3 overflow-hidden rounded-full',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
    >
      <div
        className={cn(
          'gradient-primary h-full rounded-full transition-[width] duration-500 ease-out',
          fillClassName,
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
