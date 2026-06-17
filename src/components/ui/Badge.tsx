import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-[var(--radius-sm)] font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-tint-2 text-[var(--text-secondary)]',
        brand: 'bg-tint-green-3 text-[var(--primary)]',
        reward: 'gradient-gold text-[var(--on-reward)]',
        outline: 'border-soft text-[var(--text-secondary)]',
        destructive:
          'bg-[color:color-mix(in_srgb,var(--destructive)_18%,transparent)] text-[var(--destructive)]',
      },
      size: {
        sm: 'h-5 px-1.5 text-[0.66rem]',
        md: 'h-6 px-2 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> & VariantProps<typeof badgeVariants>;

/**
 * Badge — shadcn-style status pill. The score-specific badge lives in
 * shared/ScoreBadge (it carries the data-score colour mapping).
 */
export function Badge({ variant, size, className, ...rest }: Props) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...rest} />;
}
