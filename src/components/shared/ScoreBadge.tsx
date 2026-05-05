import type { Score } from '@/types';
import { SCORE_COLORS } from '@/lib/scanner';
import { cn } from '@/lib/cn';

interface Props {
  score: Score;
  className?: string;
}

export function ScoreBadge({ score, className }: Props) {
  return (
    <span
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line-soft)] text-sm font-extrabold text-[var(--on-primary)] shadow-[var(--shadow-card)]',
        className
      )}
      style={{ background: SCORE_COLORS[score] }}
    >
      {score}
    </span>
  );
}
