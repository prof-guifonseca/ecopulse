'use client';

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ElementType,
  type ReactNode,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold tracking-normal transition-all duration-200',
  {
    variants: {
      variant: {
        primary:
          'gradient-primary text-[var(--primary-foreground)] shadow-[0_12px_26px_-22px_rgba(114,211,118,0.75)] hover:brightness-105 active:scale-[0.98]',
        reward:
          'gradient-gold text-[var(--on-reward)] shadow-[0_12px_26px_-22px_rgba(216,173,77,0.8)] hover:brightness-105 active:scale-[0.98]',
        secondary:
          'border border-[var(--input)] bg-tint-2 text-[var(--foreground)] hover:bg-tint-3 active:scale-[0.99]',
        ghost:
          'text-[var(--text-secondary)] hover:bg-tint-2 hover:text-[var(--foreground)] active:scale-[0.99]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

interface CommonProps extends VariantProps<typeof buttonVariants> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  /** Render as a different element/component (e.g. Next Link). Pass href via rest. */
  as?: ElementType;
  /** shadcn-style polymorphism: merge button styling onto a single child element. */
  asChild?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonOnlyProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;
type AnchorOnlyProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps>;

type Props = CommonProps & ButtonOnlyProps & Partial<AnchorOnlyProps>;

export const Button = forwardRef<HTMLElement, Props>(function Button(
  {
    variant,
    size,
    leftIcon,
    rightIcon,
    fullWidth,
    loading,
    className,
    children,
    style,
    disabled,
    as,
    asChild,
    ...rest
  },
  ref,
) {
  const Component: ElementType = asChild ? Slot : (as ?? 'button');
  const elementProps: Record<string, unknown> = { ...rest };
  if (Component === 'button') {
    elementProps.disabled = disabled || loading;
    elementProps.type = (rest as { type?: string }).type ?? 'button';
  } else if (!asChild && (disabled || loading)) {
    elementProps['aria-disabled'] = true;
    elementProps.tabIndex = -1;
  }

  return (
    <Component
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        Component === 'button' && 'disabled:cursor-not-allowed disabled:opacity-55',
        fullWidth && 'w-full',
        className,
      )}
      style={style}
      {...elementProps}
    >
      {asChild ? (
        children
      ) : (
        <>
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
        </>
      )}
    </Component>
  );
});
