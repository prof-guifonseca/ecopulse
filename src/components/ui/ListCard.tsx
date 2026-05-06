import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'soft' | 'flat';

interface Props {
  children: ReactNode;
  /** Element to render — typically `ul` for lists, `div` for grouped buttons. */
  as?: ElementType;
  /**
   * `soft` (default): rounded card surface with border, tint-1 fill, and
   * dividers between rows. The de-facto pattern for sectional lists.
   *
   * `flat`: just dividers between rows, no card chrome. For lists that sit
   * directly inside an already-bordered surface (e.g. inside a Card).
   */
  tone?: Tone;
  className?: string;
}

const TONE_CLASSES: Record<Tone, string> = {
  soft: 'rounded-[var(--radius-md)] border-soft bg-tint-1',
  flat: '',
};

/**
 * ListCard — single source of truth for the recurring "stacked rows with
 * dividers" pattern. Replaces ad-hoc combinations of `divide-y
 * divide-[var(--line-soft)] rounded-[var(--radius-md)] border-soft bg-tint-1`
 * across map, missions, scanner, shop, etc.
 */
export function ListCard({
  children,
  as: Component = 'ul',
  tone = 'soft',
  className,
}: Props) {
  return (
    <Component
      className={cn(
        'divide-y divide-[var(--line-soft)]',
        TONE_CLASSES[tone],
        className
      )}
    >
      {children}
    </Component>
  );
}
