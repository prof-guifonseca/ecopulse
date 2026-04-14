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
        'flex h-7 w-7 items-center justify-center rounded-full text-sm font-extrabold text-bg-primary',
        className
      )}
      style={{ background: SCORE_COLORS[score] }}
    >
      {score}
    </span>
  );
}
