import { cn } from '@/lib/cn';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type Tone = 'solid' | 'soft' | 'hero';
type Accent = 'brand' | 'reward' | 'none';

interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: Tone;
  accent?: Accent;
  /** Apply default p-5 padding. Defaults to false; pass true (or set
   *  className) for explicit padding control. Every call site in the
   *  codebase is explicit, so flipping the default avoids surprises. */
  padded?: boolean;
  children?: ReactNode;
}

const TONE: Record<Tone, string> = {
  solid: 'card',
  soft: 'card-soft',
  hero: 'card-hero',
};

const ACCENT: Record<Accent, string> = {
  brand: 'card-accent-brand',
  reward: 'card-accent-reward',
  none: '',
};

export function Card({
  as: As = 'div',
  tone = 'solid',
  accent = 'none',
  padded = false,
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
