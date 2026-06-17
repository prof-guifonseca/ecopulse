'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { ensureDailyReset, ensureTodaysMissionsPopulated } from '@/lib/dailyReset';
import { bootstrapSimulationIfNeeded } from '@/simulation/bootstrap';
import { AppHeader } from '@/components/shared/AppHeader';
import { BottomNav } from '@/components/shared/BottomNav';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { Overlays } from '@/components/overlays/Overlays';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const showToast = useUIStore((s) => s.showToast);
  const bootstrapRan = useRef(false);
  const resetRan = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!bootstrapRan.current) {
      bootstrapRan.current = true;
      bootstrapSimulationIfNeeded();
    }
    const currentOnboarded = useUserStore.getState().onboarded;
    if (!currentOnboarded) {
      router.replace('/onboarding');
      return;
    }
    if (resetRan.current) return;
    resetRan.current = true;
    const outcome = ensureDailyReset();
    ensureTodaysMissionsPopulated();
    if (outcome.streakChanged === 'continued') {
      showToast(`🔥 ${outcome.newStreak} dias seguidos`, 'reward');
    } else if (outcome.streakChanged === 'started') {
      showToast('🔥 Sequência iniciada', 'reward');
    } else if (outcome.streakChanged === 'broken') {
      showToast('Sequência reiniciada. Bora de novo?', 'info');
    }
  }, [hydrated, onboarded, router, showToast]);

  return (
    <div className="mx-auto flex h-[100dvh] w-[min(100vw,var(--canvas-width))] max-w-full min-w-0 flex-col overflow-hidden">
      <AppHeader />
      <main
        className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-3 pb-10 sm:px-8"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="mx-auto w-full max-w-[var(--content-width)] min-w-0 overflow-x-hidden">
          {children}
        </div>
      </main>
      <InstallPrompt />
      <BottomNav />
      <Overlays />
    </div>
  );
}
