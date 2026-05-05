import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  children: ReactNode;
  className?: string;
  /** Vertical rhythm between sections. Default: 6 (1.5rem). */
  spacing?: 4 | 5 | 6;
}

const SPACING: Record<NonNullable<Props['spacing']>, string> = {
  4: 'space-y-4',
  5: 'space-y-5',
  6: 'space-y-6',
};

/**
 * PageShell — page-level wrapper that owns vertical rhythm and the
 * fade-in entrance, replacing the inline style={{animation:'fadeIn ...'}}
 * + space-y-6 repeated in every page component.
 */
export function PageShell({ children, className, spacing = 6 }: Props) {
  return (
    <div className={cn('animate-fade-in', SPACING[spacing], className)}>
      {children}
    </div>
  );
}
