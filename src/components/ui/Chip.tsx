'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  /** When true, render as a non-interactive span instead of a button. */
  asStatic?: boolean;
}

/**
 * Chip — formalizes the .command-pill recipe as a React component.
 * Replaces hand-rolled "rounded-full border px-3 py-1.5" pills in
 * Community / Map / Profile / AppHeader.
 *
 * Renders a <button> by default; pass asStatic to render a <span>.
 */
export function Chip({
  active,
  leftIcon,
  rightIcon,
  children,
  className,
  asStatic,
  ...rest
}: Props) {
  const content = (
    <>
      {leftIcon ? <span className="inline-flex">{leftIcon}</span> : null}
      <span className="truncate">{children}</span>
      {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
    </>
  );

  if (asStatic) {
    return (
      <span className={cn('command-pill', className)} data-active={active ? 'true' : undefined}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn('command-pill', className)}
      data-active={active ? 'true' : undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
