import { Card } from '@/components/ui/Card';
import { PageShell } from '@/components/ui/PageShell';
import { Skeleton } from '@/components/shared/Skeleton';

export function CommunitySkeleton() {
  return (
    <PageShell spacing={5}>
      <header className="flex items-start justify-between gap-3 pt-2" aria-busy="true" aria-live="polite">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-56" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </header>
      <section aria-label="Carregando stories">
        <div className="-mx-3 flex gap-3 overflow-hidden px-3 pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex w-[78px] shrink-0 flex-col items-center gap-1.5">
              <Skeleton className="h-[78px] w-[78px] rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </section>
      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} tone="solid" padded={false} className="overflow-hidden">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="space-y-2 px-4 py-4">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="h-8 w-12 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
