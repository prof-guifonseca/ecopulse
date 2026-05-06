'use client';

import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useArenaStore } from '@/store/arenaStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useUIStore } from '@/store/uiStore';
import { selectEcoQualityIndex } from '@/lib/ecoMultiplier';
import { currentChapter, type ChapterId } from '@/lib/journey';
import { unlockBadge } from '@/lib/gameActions';

/**
 * Watches for chapter transitions across the persisted stores and pops the
 * ChapterUnlockOverlay exactly once per advance. Implementation is a
 * straight subscription pattern: cheap, allocation-free in the steady state.
 */
export function useJourneyTransition() {
  const lastChapterRef = useRef<ChapterId | null>(null);

  useEffect(() => {
    const compute = (): ChapterId => {
      const user = useUserStore.getState();
      const game = useGameStore.getState();
      const arena = useArenaStore.getState();
      const eco = selectEcoQualityIndex(useScanHistoryStore.getState().history);
      return currentChapter({
        level: user.level,
        scans: game.scannedProducts.length,
        ecoIndex: eco.letter,
        visitedPointIds: game.visitedPoints,
        defeatedRivals: arena.defeatedOpponents.length,
      }).id;
    };

    // Establish baseline after hydration so we don't fire on first paint.
    lastChapterRef.current = compute();

    const onChange = () => {
      const next = compute();
      if (next !== lastChapterRef.current && lastChapterRef.current !== null) {
        const prev = lastChapterRef.current;
        lastChapterRef.current = next;
        if (advanced(prev, next)) {
          useUIStore.getState().openModal({ kind: 'chapterUnlock', chapterId: next });
          unlockBadge(`chapter-${next}`);
        }
      } else {
        lastChapterRef.current = next;
      }
    };

    const unsubA = useUserStore.subscribe(onChange);
    const unsubB = useGameStore.subscribe(onChange);
    const unsubC = useArenaStore.subscribe(onChange);
    const unsubD = useScanHistoryStore.subscribe(onChange);
    return () => {
      unsubA();
      unsubB();
      unsubC();
      unsubD();
    };
  }, []);
}

const ORDER: ChapterId[] = ['semente', 'broto', 'arbusto', 'arvore', 'floresta'];
function advanced(prev: ChapterId, next: ChapterId): boolean {
  return ORDER.indexOf(next) > ORDER.indexOf(prev);
}
