import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md';
type Variant = 'ghost' | 'soft';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon (or any node). The label belongs to aria-label. */
  icon: ReactNode;
  size?: Size;
  variant?: Variant;
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
};

const VARIANT_CLASSES: Record<Variant, string> = {
  /** No chrome until hover. Used in modal headers, where the surface itself
      should carry the visual weight. */
  ghost:
    'text-[var(--text-secondary)] hover:bg-tint-3 hover:text-[var(--text-primary)]',
  /** Subtle filled circle. Used inside content blocks (onboarding back-arrow,
      list rows) where the button needs to read as a target before hover. */
  soft:
    'border-soft bg-tint-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--line-strong)]',
};

/**
 * IconButton — circular icon-only button. Replaces the recurring
 * `inline-flex h-N w-N rounded-full ... text-[--text-secondary] hover:bg-[--tint-3]`
 * recipe in modal close affordances, onboarding nav, and inline filters.
 *
 * Always set `aria-label` — the icon is decorative.
 */
export function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
