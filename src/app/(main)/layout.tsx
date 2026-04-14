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
      <div className="flex h-[100dvh] items-center justify-center bg-bg-primary">
        <div className="animate-pulse text-5xl">🌿</div>
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
          paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 24px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="mx-auto max-w-3xl px-4 py-4">{children}</div>
      </main>
      <BottomNav />
      <Overlays />
    </div>
  );
}
