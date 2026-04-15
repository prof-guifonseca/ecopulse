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
        'flex h-10 w-10 items-center justify-center rounded-[18px] border border-white/10 text-sm font-extrabold text-bg-primary shadow-[0_0_24px_rgba(54,215,255,0.12)]',
        className
      )}
      style={{ background: SCORE_COLORS[score] }}
    >
      {score}
    </span>
  );
}
