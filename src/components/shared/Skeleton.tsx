import { cn } from '@/lib/cn';

interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'shimmer-bg rounded-[var(--radius-md)] bg-white/[0.04]',
        className
      )}
    />
  );
}
