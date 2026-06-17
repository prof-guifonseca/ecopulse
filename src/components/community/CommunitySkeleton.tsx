import { Card } from '@/components/ui/Card';
import { PageShell } from '@/components/ui/PageShell';
import { Skeleton } from '@/components/shared/Skeleton';

export function CommunitySkeleton() {
  return (
    <PageShell spacing={5}>
      <header className="space-y-2 pt-2" aria-busy="true" aria-live="polite">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-3 w-20" />
      </header>
      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} tone="solid" padded={false} className="overflow-hidden">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="space-y-2 px-4 py-4">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-14 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-8 w-12 rounded-[var(--radius-sm)]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
