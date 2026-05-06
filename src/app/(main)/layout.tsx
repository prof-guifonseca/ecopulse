'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { ensureDailyReset } from '@/lib/dailyReset';
import { seedDemoStateIfEmpty } from '@/lib/demoSeed';
import { AppHeader } from '@/components/shared/AppHeader';
import { BottomNav } from '@/components/shared/BottomNav';
import { Overlays } from '@/components/overlays/Overlays';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const showToast = useUIStore((s) => s.showToast);
  const seedRan = useRef(false);
  const resetRan = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    // Seed first — turns a fresh device into Arthur, level 7, 23 scans.
    // The seed flips `onboarded` to true, so the redirect below is skipped
    // on the very next render.
    if (!seedRan.current) {
      seedRan.current = true;
      seedDemoStateIfEmpty();
    }
    const currentOnboarded = useUserStore.getState().onboarded;
    if (!currentOnboarded) {
      router.replace('/onboarding');
      return;
    }
    if (resetRan.current) return;
    resetRan.current = true;
    const outcome = ensureDailyReset();
    if (outcome.streakChanged === 'continued') {
      showToast(`🔥 ${outcome.newStreak} dias seguidos`, 'reward');
    } else if (outcome.streakChanged === 'started') {
      showToast('🔥 Sequência iniciada', 'reward');
    } else if (outcome.streakChanged === 'broken') {
      showToast('Sequência reiniciada. Bora de novo?', 'info');
    }
  }, [hydrated, onboarded, router, showToast]);

  return (
    <div className="mx-auto flex h-[100dvh] min-w-0 w-[min(100vw,var(--canvas-width))] max-w-full flex-col overflow-hidden">
      <AppHeader />
      <main
        className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-10 pt-3 sm:px-8"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="mx-auto min-w-0 w-full max-w-[var(--content-width)] overflow-x-hidden">
          {children}
        </div>
      </main>
      <BottomNav />
      <Overlays />
    </div>
  );
}
