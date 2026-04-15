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
        'flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/8 text-sm font-extrabold text-bg-primary shadow-[0_14px_30px_rgba(1,8,5,0.22)]',
        className
      )}
      style={{ background: SCORE_COLORS[score] }}
    >
      {score}
    </span>
  );
}
