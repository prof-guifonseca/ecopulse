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

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col overflow-hidden border-x border-white/5 bg-[rgba(10,17,13,0.72)] shadow-[0_30px_120px_rgba(1,8,5,0.45)]">
      <AppHeader />
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4"
        style={{
          paddingBottom: 'calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 20px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="mx-auto max-w-[var(--shell-width)] pt-3">
          {children}
        </div>
      </main>
      <BottomNav />
      <Overlays />
    </div>
  );
}
