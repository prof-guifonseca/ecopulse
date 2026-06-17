import { cva, type VariantProps } from 'class-variance-authority';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const cardVariants = cva('overflow-hidden', {
  variants: {
    tone: {
      solid: 'card',
      soft: 'card-soft',
      hero: 'card-hero',
    },
    accent: {
      brand: 'card-accent-brand',
      reward: 'card-accent-reward',
      none: '',
    },
    padded: {
      true: 'p-5',
      false: '',
    },
  },
  defaultVariants: { tone: 'solid', accent: 'none', padded: false },
});

interface Props extends HTMLAttributes<HTMLElement>, VariantProps<typeof cardVariants> {
  as?: ElementType;
  children?: ReactNode;
}

export function Card({
  as: As = 'div',
  tone,
  accent,
  padded,
  className,
  children,
  ...rest
}: Props) {
  return (
    <As className={cn(cardVariants({ tone, accent, padded }), className)} {...rest}>
      {children}
    </As>
  );
}
