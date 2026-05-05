import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Size = 'sm' | 'md' | 'lg';
type Tone = 'default' | 'brand' | 'reward';

interface Props {
  icon: ReactNode;
  size?: Size;
  tone?: Tone;
  className?: string;
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 w-9 text-base rounded-[var(--radius-xs)]',
  md: 'h-11 w-11 text-xl rounded-[var(--radius-sm)]',
  lg: 'h-14 w-14 text-2xl rounded-[var(--radius-md)]',
};

const TONE_CLASSES: Record<Tone, string> = {
  default: 'border-soft bg-tint-2 text-[var(--text-primary)]',
  brand: 'border-active bg-tint-green-3 text-[var(--accent-green)]',
  reward: 'border border-[color:color-mix(in_srgb,var(--accent-gold)_36%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-gold)_12%,transparent)] text-[var(--accent-gold)]',
};

/**
 * IconTile — rounded-square container for an icon or emoji. Replaces the
 * dozens of ad-hoc "h-N w-N rounded-[Mpx] bg-white/[0.04] flex items-center
 * justify-center" recipes across scanner, map, badges, missions, etc.
 */
export function IconTile({ icon, size = 'md', tone = 'default', className }: Props) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        SIZE_CLASSES[size],
        TONE_CLASSES[tone],
        className
      )}
      aria-hidden
    >
      {icon}
    </div>
  );
}
