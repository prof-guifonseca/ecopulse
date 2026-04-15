'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'reward';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.82rem]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[0.95rem]',
};

const VARIANT: Record<Variant, string> = {
  primary:
    'text-[#0a140e] shadow-[0_10px_22px_rgba(141,219,152,0.22)] hover:shadow-[0_14px_28px_rgba(141,219,152,0.3)] active:scale-[0.97]',
  reward:
    'text-[#1a130a] shadow-[0_10px_22px_rgba(224,194,122,0.22)] hover:shadow-[0_14px_28px_rgba(224,194,122,0.3)] active:scale-[0.97]',
  secondary:
    'border border-[var(--line-strong)] bg-white/3 text-text-primary hover:bg-white/6 active:scale-[0.98]',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/4 active:scale-[0.98]',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', leftIcon, rightIcon, fullWidth, loading, className, children, style, disabled, ...rest },
  ref
) {
  const isGradient = variant === 'primary' || variant === 'reward';
  const mergedStyle = isGradient
    ? {
        background:
          variant === 'reward' ? 'var(--gradient-gold)' : 'var(--gradient-primary)',
        ...style,
      }
    : style;

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-55',
        SIZE[size],
        VARIANT[variant],
        fullWidth && 'w-full',
        className
      )}
      style={mergedStyle}
      {...rest}
    >
      {loading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      ) : leftIcon ? (
        <span className="inline-flex">{leftIcon}</span>
      ) : null}
      <span className="truncate">{children}</span>
      {rightIcon && !loading ? <span className="inline-flex">{rightIcon}</span> : null}
    </button>
  );
});
