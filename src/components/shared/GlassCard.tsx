import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
}

export function GlassCard({ className, as: As = 'div', ...rest }: Props) {
  return <As className={cn('glass-card p-4', className)} {...rest} />;
}
