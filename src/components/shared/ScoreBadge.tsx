import type { Score } from '@/types';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg';

interface Props {
  score: Score;
  size?: Size;
  className?: string;
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
};

export function ScoreBadge({ score, size = 'md', className }: Props) {
  return (
    <span
      data-score={score}
      className={cn(
        'score-badge flex items-center justify-center rounded-[var(--radius-md)] font-extrabold text-[var(--on-primary)] shadow-[var(--shadow-card)]',
        SIZE_CLASSES[size],
        className
      )}
    >
      {score}
    </span>
  );
}
