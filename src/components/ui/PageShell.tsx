import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  children: ReactNode;
  className?: string;
  /** Vertical rhythm between sections. Default: 8 (2rem). */
  spacing?: 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

const SPACING: Record<NonNullable<Props['spacing']>, string> = {
  4: 'space-y-4',
  5: 'space-y-5',
  6: 'space-y-6',
  7: 'space-y-7',
  8: 'space-y-8',
  9: 'space-y-9',
  10: 'space-y-10',
};

/**
 * PageShell — page-level wrapper that owns vertical rhythm and the
 * fade-in entrance, replacing the inline style={{animation:'fadeIn ...'}}
 * + space-y-6 repeated in every page component.
 */
export function PageShell({ children, className, spacing = 8 }: Props) {
  return (
    <div
      className={cn(SPACING[spacing], className)}
      style={{ animation: 'fadeIn 0.35s ease' }}
    >
      {children}
    </div>
  );
}
