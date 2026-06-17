import { cva, type VariantProps } from 'class-variance-authority';
import type { Score } from '@/types';
import { cn } from '@/lib/cn';

export const scoreBadgeVariants = cva(
  'score-badge flex items-center justify-center rounded-[var(--radius-md)] font-extrabold text-[var(--on-primary)] shadow-[var(--shadow-card)]',
  {
    variants: {
      size: {
        sm: 'h-9 w-9 text-xs',
        md: 'h-11 w-11 text-sm',
        lg: 'h-14 w-14 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

interface Props extends VariantProps<typeof scoreBadgeVariants> {
  score: Score;
  className?: string;
}

export function ScoreBadge({ score, size, className }: Props) {
  return (
    <span data-score={score} className={cn(scoreBadgeVariants({ size }), className)}>
      {score}
    </span>
  );
}
