import type { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon;
}

export function Icon({ icon: Component, size = 20, strokeWidth = 1.75, className, ...rest }: Props) {
  return <Component size={size} strokeWidth={strokeWidth} className={cn('shrink-0', className)} {...rest} />;
}
