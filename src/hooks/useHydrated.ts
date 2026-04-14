'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';

/**
 * Returns true once all persisted stores have finished rehydrating from
 * localStorage. Use to gate reads that would otherwise mismatch SSR output.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const flags = [false, false, false];
    const mark = (idx: number) => {
      flags[idx] = true;
      if (flags.every(Boolean)) setHydrated(true);
    };

    const u = useUserStore.persist?.hasHydrated?.();
    const g = useGameStore.persist?.hasHydrated?.();
    const s = useSocialStore.persist?.hasHydrated?.();

    if (u) mark(0);
    if (g) mark(1);
    if (s) mark(2);

    const uu = useUserStore.persist?.onFinishHydration?.(() => mark(0));
    const gg = useGameStore.persist?.onFinishHydration?.(() => mark(1));
    const ss = useSocialStore.persist?.onFinishHydration?.(() => mark(2));

    return () => {
      uu?.();
      gg?.();
      ss?.();
    };
  }, []);

  return hydrated;
}
