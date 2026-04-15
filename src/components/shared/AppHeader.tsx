'use client';

import { usePathname } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';

const ROUTE_TITLES: Record<string, { title: string; loading: string }> = {
  '/home': { title: 'Sua rotina', loading: 'Sincronizando' },
  '/scanner': { title: 'Scanner', loading: 'Sincronizando' },
  '/map': { title: 'Mapa local', loading: 'Sincronizando' },
  '/community': { title: 'Comunidade', loading: 'Sincronizando' },
  '/profile': { title: 'Seu perfil', loading: 'Sincronizando' },
};

export function AppHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const level = useUserStore((s) => s.level);
  const tokensToday = useUserStore((s) => s.tokensToday);
  const tokens = useUserStore((s) => s.tokens);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const visitedCount = useGameStore((s) => s.visitedPoints.length);
  const likedPosts = useSocialStore((s) => s.likedPosts.length);

  const current = ROUTE_TITLES[pathname] ?? { title: 'EcoPulse', loading: 'Sincronizando' };
  const summary = !hydrated
    ? current.loading
    : pathname === '/home'
    ? `+${tokensToday} hoje`
    : pathname === '/scanner'
    ? `${scannedCount} itens`
    : pathname === '/map'
    ? `${visitedCount} visitas`
    : pathname === '/community'
    ? `${likedPosts} curtidas`
    : `Nível ${level} · ${tokens} tokens`;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top,0px)+10px)]"
    >
      <div className="surface surface-panel flex items-center justify-between gap-3 rounded-[26px] px-4 py-3">
        <div className="min-w-0">
          <div className="font-display text-[0.8rem] font-semibold tracking-[0.08em] text-text-secondary">
            EcoPulse
          </div>
          <div className="mt-1 text-[1.08rem] font-semibold leading-none text-text-primary">
            {current.title}
          </div>
        </div>
        <span className="command-pill shrink-0 whitespace-nowrap">{summary}</span>
      </div>
    </header>
  );
}
