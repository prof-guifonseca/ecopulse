'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { ensureDailyReset } from '@/lib/dailyReset';
import { AppHeader } from '@/components/shared/AppHeader';
import { BottomNav } from '@/components/shared/BottomNav';
import { Overlays } from '@/components/overlays/Overlays';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const showToast = useUIStore((s) => s.showToast);
  const resetRan = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
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
    <div className="mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col overflow-hidden bg-[var(--bg-primary)] sm:my-4 sm:h-[calc(100dvh-2rem)] sm:rounded-[32px] sm:border sm:border-[var(--line-soft)] sm:shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
      <AppHeader />
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-1"
        style={{
          paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 22px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="mx-auto max-w-[var(--shell-width)]">
          {children}
        </div>
      </main>
      <BottomNav />
      <Overlays />
    </div>
  );
}
