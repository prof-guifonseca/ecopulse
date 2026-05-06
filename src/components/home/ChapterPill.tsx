'use client';

import { Sprout, TreePine, Trees } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useArenaStore } from '@/store/arenaStore';
import { useGameStore } from '@/store/gameStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useUserStore } from '@/store/userStore';
import { selectEcoQualityIndex } from '@/lib/ecoMultiplier';
import { chapterProgress, type ChapterId } from '@/lib/journey';
import { Icon } from '@/components/ui/Icon';

const ICON_BY_CHAPTER: Record<ChapterId, LucideIcon> = {
  semente: Sprout,
  broto: Sprout,
  arbusto: TreePine,
  arvore: TreePine,
  floresta: Trees,
};

export function ChapterPill() {
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

  const Icn = ICON_BY_CHAPTER[progress.current.id] ?? Sprout;
  const remaining = progress.missing.length;

  return (
    <div className="flex items-center gap-2 rounded-full border-soft bg-tint-1 px-3 py-1.5">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-tint-green-3 text-[var(--accent-green)]">
        <Icon icon={Icn} size={13} />
      </span>
      <span className="t-caption">
        Capítulo: <strong className="text-[var(--text-primary)]">{progress.current.label}</strong>
        {progress.next ? (
          <>
            {' '}· próximo {progress.next.label}
            {remaining > 0 ? ` (${remaining} ${remaining === 1 ? 'gate' : 'gates'} restantes)` : ''}
          </>
        ) : null}
      </span>
    </div>
  );
}
