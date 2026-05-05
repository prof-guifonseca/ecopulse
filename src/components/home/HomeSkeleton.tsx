import { Skeleton } from '@/components/shared/Skeleton';

export function HomeSkeleton() {
  return (
    <div className="space-y-5 pt-2" aria-busy="true" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-44" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
      <div className="card-hero px-5 py-5 space-y-3">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-2 h-12 w-full rounded-full" />
      </div>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
