import { cn } from '@/lib/cn';

interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div aria-hidden className={cn('shimmer-bg bg-tint-2 rounded-[var(--radius-md)]', className)} />
  );
}
