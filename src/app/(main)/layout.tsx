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
import { FauxStatusBar } from '@/components/shared/FauxStatusBar';
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
    if (!onboarded) {
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
    <>
      <div className="device-shell mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col overflow-hidden sm:h-[calc(100dvh-3rem)] sm:max-h-[920px] sm:rounded-[var(--radius-shell)]">
        <FauxStatusBar />
        <AppHeader />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 pt-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="mx-auto max-w-[var(--shell-width)]">
            {children}
          </div>
        </main>
        <BottomNav />
        <Overlays />
      </div>
      <span aria-hidden className="canvas-stage-label">EcoPulse · Investor Preview</span>
    </>
  );
}
