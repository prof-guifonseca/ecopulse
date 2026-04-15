'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { isDemoMode } from '@/lib/demoMode';

const ROUTE_TITLES: Record<string, { title: string; summary: string }> = {
  '/home': { title: 'Sua rotina', summary: 'Fluxo do dia' },
  '/scanner': { title: 'Scanner', summary: 'Leitura em 1 toque' },
  '/map': { title: 'Mapa local', summary: 'Próxima parada' },
  '/community': { title: 'Comunidade', summary: 'Prova social' },
  '/profile': { title: 'Seu perfil', summary: 'Impacto e identidade' },
};

export function AppHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const demoMode = isDemoMode(searchParams);
  const current = ROUTE_TITLES[pathname] ?? { title: 'EcoPulse', summary: 'Demo guiada' };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)]"
    >
      <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-[rgba(9,14,12,0.72)] px-4 py-3 shadow-[0_18px_44px_rgba(1,8,5,0.22)] backdrop-blur-xl">
        <div className="min-w-0">
          <div className="text-[0.75rem] font-medium text-text-secondary">
            {demoMode ? 'EcoPulse demo' : 'EcoPulse'}
          </div>
          <div className="mt-1 text-[1.08rem] font-semibold leading-none text-text-primary">{current.title}</div>
        </div>
        <span className="shrink-0 rounded-full border border-white/8 bg-white/[0.045] px-3 py-1.5 text-[0.75rem] font-medium text-text-secondary">
          {current.summary}
        </span>
      </div>
    </header>
  );
}
