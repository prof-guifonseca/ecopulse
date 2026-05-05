import type { Score } from '@/types';
import { SCORE_COLORS } from '@/lib/scanner';
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
      className={cn(
        'flex items-center justify-center rounded-[var(--radius-md)] border-soft font-extrabold text-[var(--on-primary)] shadow-[var(--shadow-card)]',
        SIZE_CLASSES[size],
        className
      )}
      style={{ background: SCORE_COLORS[score] }}
    >
      {score}
    </span>
  );
}
