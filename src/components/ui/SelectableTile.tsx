'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  selected: boolean;
  children: ReactNode;
  align?: 'row' | 'column';
}

/**
 * SelectableTile — large tappable surface with a selected/unselected state.
 * Replaces the avatar / tribe / large-filter pickers that each reimplemented
 * the same border-active green-tint recipe.
 */
export function SelectableTile({
  selected,
  children,
  align = 'row',
  className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'rounded-[var(--radius-md)] border px-4 py-4 text-left transition-all duration-150 active:scale-[0.99]',
        align === 'column' ? 'flex flex-col items-center gap-2 text-center' : 'flex w-full items-center gap-4',
        selected
          ? 'border-[var(--line-active)] bg-[var(--tint-green-2)] shadow-[var(--shadow-glow)]'
          : 'border-[var(--line-soft)] bg-[var(--tint-1)] hover:border-[var(--line-strong)]',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
