'use client';

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ElementType,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'reward';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  /** Render as a different element/component (e.g. Next Link). When provided, pass href via rest. */
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

type ButtonOnlyProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;
type AnchorOnlyProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps>;

type Props = CommonProps & ButtonOnlyProps & Partial<AnchorOnlyProps>;

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

const VARIANT: Record<Variant, string> = {
  primary:
    'gradient-primary text-[var(--on-primary)] shadow-[var(--shadow-glow)] hover:brightness-105 active:scale-[0.97]',
  reward:
    'gradient-gold text-[var(--on-reward)] shadow-[var(--shadow-glow)] hover:brightness-105 active:scale-[0.97]',
  secondary:
    'border-strong bg-tint-2 text-[var(--text-primary)] hover:bg-[var(--tint-3)] active:scale-[0.98]',
  ghost:
    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--tint-2)] active:scale-[0.98]',
};

export const Button = forwardRef<HTMLElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    fullWidth,
    loading,
    className,
    children,
    style,
    disabled,
    as,
    ...rest
  },
  ref
) {
  const Component: ElementType = as ?? 'button';
  const elementProps: Record<string, unknown> = { ...rest };
  if (Component === 'button') {
    elementProps.disabled = disabled || loading;
    elementProps.type = (rest as { type?: string }).type ?? 'button';
  } else if (disabled || loading) {
    elementProps['aria-disabled'] = true;
    elementProps.tabIndex = -1;
  }

  return (
    <Component
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200',
        Component === 'button' && 'disabled:cursor-not-allowed disabled:opacity-55',
        SIZE[size],
        VARIANT[variant],
        fullWidth && 'w-full',
        className
      )}
      style={style}
      {...elementProps}
    >
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : leftIcon ? (
        <span className="inline-flex">{leftIcon}</span>
      ) : null}
      <span className="truncate">{children}</span>
      {rightIcon && !loading ? <span className="inline-flex">{rightIcon}</span> : null}
    </Component>
  );
});
