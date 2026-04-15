import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

type Variant = 'panel' | 'hud' | 'tile' | 'ghost';
type Accent = 'mint' | 'cyan' | 'amber' | 'violet' | 'none';

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
  variant?: Variant;
  accent?: Accent;
}

const VARIANT_CLASS: Record<Variant, string> = {
  panel: 'surface-panel',
  hud: 'surface-hud',
  tile: 'surface-tile',
  ghost: 'surface-ghost',
};

const ACCENT_CLASS: Record<Accent, string> = {
  mint: 'surface-accent-mint',
  cyan: 'surface-accent-cyan',
  amber: 'surface-accent-amber',
  violet: 'surface-accent-violet',
  none: 'surface-accent-none',
};

export function GlassCard({
  className,
  as: As = 'div',
  variant = 'panel',
  accent = 'none',
  ...rest
}: Props) {
  return (
    <As
      className={cn('surface p-4', VARIANT_CLASS[variant], ACCENT_CLASS[accent], className)}
      {...rest}
    />
  );
}
