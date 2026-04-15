'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHydrated } from '@/hooks/useHydrated';
import { useUserStore } from '@/store/userStore';
import { AppHeader } from '@/components/shared/AppHeader';
import { BottomNav } from '@/components/shared/BottomNav';
import { Overlays } from '@/components/overlays/Overlays';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);

  useEffect(() => {
    if (hydrated && !onboarded) router.replace('/onboarding');
  }, [hydrated, onboarded, router]);

  if (!hydrated) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-bg-primary px-4">
        <div className="surface surface-hud surface-accent-mint flex min-w-[280px] max-w-md flex-col items-center gap-3 px-8 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/5 text-5xl shadow-[0_0_40px_rgba(70,247,194,0.12)]">
            🌿
          </div>
          <div className="hud-label">syncing eco systems</div>
          <div className="font-display text-2xl font-bold">Inicializando Terminal</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bg-primary">
      <AppHeader />
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          paddingTop: 'var(--header-height)',
          paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-8 lg:py-6 xl:px-10">
          {children}
        </div>
      </main>
      <BottomNav />
      <Overlays />
    </div>
  );
}
