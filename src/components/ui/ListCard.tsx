import type { ElementType, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const listCardVariants = cva('divide-y divide-[var(--line-soft)]', {
  variants: {
    tone: {
      /** rounded card surface with border + tint-1 fill and row dividers. */
      soft: 'rounded-[var(--radius-md)] border-soft bg-tint-1',
      /** just dividers, no card chrome (for lists inside an existing surface). */
      flat: '',
    },
  },
  defaultVariants: { tone: 'soft' },
});

interface Props extends VariantProps<typeof listCardVariants> {
  children: ReactNode;
  /** Element to render — typically `ul` for lists, `div` for grouped buttons. */
  as?: ElementType;
  className?: string;
}

/**
 * ListCard — the recurring "stacked rows with dividers" pattern.
 */
export function ListCard({ children, as: Component = 'ul', tone, className }: Props) {
  return <Component className={cn(listCardVariants({ tone }), className)}>{children}</Component>;
}
