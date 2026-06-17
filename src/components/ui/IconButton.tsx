import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
      },
      variant: {
        /** No chrome until hover. Used in modal headers, where the surface itself
            should carry the visual weight. */
        ghost: 'text-[var(--text-secondary)] hover:bg-tint-2 hover:text-[var(--foreground)]',
        /** Subtle filled circle. Used inside content blocks (onboarding back-arrow,
            list rows) where the button needs to read as a target before hover. */
        soft: 'border-soft bg-tint-1 text-[var(--text-secondary)] hover:border-[var(--input)] hover:text-[var(--foreground)]',
      },
    },
    defaultVariants: { size: 'md', variant: 'ghost' },
  },
);

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  /** Lucide icon (or any node). The label belongs to aria-label. */
  icon: ReactNode;
}

/**
 * IconButton — circular icon-only button. Always set `aria-label` — the icon
 * is decorative.
 */
export function IconButton({ icon, size, variant, className, type = 'button', ...props }: Props) {
  return (
    <button type={type} className={cn(iconButtonVariants({ size, variant }), className)} {...props}>
      {icon}
    </button>
  );
}
