'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Overlays } from '@/components/overlays/Overlays';
import { AppHeader } from '@/components/shared/AppHeader';
import { BottomNav } from '@/components/shared/BottomNav';
import { useHydrated } from '@/hooks/useHydrated';
import { isDemoMode } from '@/lib/demoMode';
import { useUserStore } from '@/store/userStore';

export function MainShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const onboarded = useUserStore((s) => s.onboarded);
  const demoMode = isDemoMode(searchParams);

  useEffect(() => {
    if (hydrated && !onboarded && !demoMode) router.replace('/onboarding');
  }, [demoMode, hydrated, onboarded, router]);

  return (
    <div className="phone-stage-shell">
      <div className="phone-stage">
        <AppHeader />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-5 pt-2"
          style={{
            paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 24px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </main>
        <BottomNav />
        <Overlays />
      </div>
    </div>
  );
}
