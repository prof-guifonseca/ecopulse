import { cn } from '@/lib/cn';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type Tone = 'solid' | 'soft' | 'glass' | 'hero';
type Accent = 'brand' | 'reward' | 'alert' | 'none';

interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: Tone;
  accent?: Accent;
  padded?: boolean;
  children?: ReactNode;
}

const TONE: Record<Tone, string> = {
  solid: 'card',
  soft: 'card-soft',
  glass: 'card-glass',
  hero: 'card-hero',
};

const ACCENT: Record<Accent, string> = {
  brand: 'card-accent-brand',
  reward: 'card-accent-reward',
  alert: 'card-accent-alert',
  none: '',
};

export function Card({
  as: As = 'div',
  tone = 'solid',
  accent = 'none',
  padded = true,
  className,
  children,
  ...rest
}: Props) {
  return (
    <As className={cn(TONE[tone], ACCENT[accent], padded && 'p-5', 'overflow-hidden', className)} {...rest}>
      {children}
    </As>
  );
}
