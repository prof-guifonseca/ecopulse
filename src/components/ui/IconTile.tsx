import type { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const iconTileVariants = cva('flex shrink-0 items-center justify-center', {
  variants: {
    size: {
      sm: 'h-9 w-9 rounded-[var(--radius-xs)] text-base',
      md: 'h-11 w-11 rounded-[var(--radius-sm)] text-xl',
      lg: 'h-14 w-14 rounded-[var(--radius-md)] text-2xl',
    },
    tone: {
      default: 'border-soft bg-tint-2 text-[var(--foreground)]',
      brand: 'border-active bg-tint-green-3 text-[var(--primary)]',
      reward:
        'border border-[color:color-mix(in_srgb,var(--accent-gold)_36%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-gold)_12%,transparent)] text-[var(--accent-gold)]',
    },
  },
  defaultVariants: { size: 'md', tone: 'default' },
});

interface Props
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps<typeof iconTileVariants> {
  icon: ReactNode;
}

/**
 * IconTile — rounded-square container for an icon or emoji.
 */
export function IconTile({ icon, size, tone, className, ...rest }: Props) {
  return (
    <div className={cn(iconTileVariants({ size, tone }), className)} aria-hidden {...rest}>
      {icon}
    </div>
  );
}
