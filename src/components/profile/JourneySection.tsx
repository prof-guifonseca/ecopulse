'use client';

import { Sprout, TreePine, Trees, Circle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useArenaStore } from '@/store/arenaStore';
import { useGameStore } from '@/store/gameStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useUserStore } from '@/store/userStore';
import { selectEcoQualityIndex } from '@/lib/ecoMultiplier';
import { CHAPTERS, chapterProgress, type ChapterId } from '@/lib/journey';
import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

const ICON_BY_CHAPTER: Record<ChapterId, LucideIcon> = {
  semente: Sprout,
  broto: Sprout,
  arbusto: TreePine,
  arvore: TreePine,
  floresta: Trees,
};

export function JourneySection() {
  const level = useUserStore((s) => s.level);
  const scannedProducts = useGameStore((s) => s.scannedProducts);
  const visitedPoints = useGameStore((s) => s.visitedPoints);
  const defeated = useArenaStore((s) => s.defeatedOpponents);
  const history = useScanHistoryStore((s) => s.history);

  const eco = selectEcoQualityIndex(history);
  const progress = chapterProgress({
    level,
    scans: scannedProducts.length,
    ecoIndex: eco.letter,
    visitedPointIds: visitedPoints,
    defeatedRivals: defeated.length,
  });

  return (
    <Card className="p-4">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="t-title">Jornada</h2>
        <span className="t-caption">Capítulo: {progress.current.label}</span>
      </header>

      <ol className="mb-3 flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CHAPTERS.map((c) => {
          const isCurrent = c.id === progress.current.id;
          const isPast =
            CHAPTERS.findIndex((x) => x.id === c.id) <
            CHAPTERS.findIndex((x) => x.id === progress.current.id);
          const I = ICON_BY_CHAPTER[c.id];
          return (
            <li
              key={c.id}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full border-soft px-2.5 py-1',
                isCurrent
                  ? 'bg-tint-green-3 text-[var(--accent-green)] border-active'
                  : isPast
                    ? 'bg-tint-1 text-[var(--text-secondary)]'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
              )}
            >
              <Icon icon={I} size={12} />
              <span className="t-micro">{c.label}</span>
            </li>
          );
        })}
      </ol>

      {progress.next ? (
        <div className="rounded-[var(--radius-sm)] border-soft bg-tint-1 p-3">
          <p className="t-eyebrow mb-2">Para virar {progress.next.label}</p>
          {progress.missing.length === 0 ? (
            <p className="t-caption text-[var(--accent-green)]">
              Tudo pronto. Próxima ação destrava o capítulo.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {progress.missing.map((m) => (
                <li key={m.key} className="flex items-center gap-2 t-caption">
                  <Icon icon={Circle} size={12} className="text-[var(--text-muted)]" />
                  <span>{m.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="t-caption">Você fechou todos os capítulos da jornada local.</p>
      )}
    </Card>
  );
}
