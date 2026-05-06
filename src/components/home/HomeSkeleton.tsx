import { Skeleton } from '@/components/shared/Skeleton';

export function HomeSkeleton() {
  return (
    <div className="w-[min(100%,calc(100vw-40px))] max-w-full space-y-5 pt-3" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-52" />
        </div>
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
      </div>

      <div className="card-hero space-y-4 px-5 py-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-36 w-full rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}
