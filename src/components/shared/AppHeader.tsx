'use client';

import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';

const ROUTE_TITLES: Record<string, string> = {
  '/home': 'Sua rotina verde',
  '/scanner': 'Scanner',
  '/map': 'Mapa',
  '/community': 'Comunidade',
  '/profile': 'Perfil',
};

export function AppHeader() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const xpToNext = useUserStore((s) => s.xpToNext);
  const tokens = useUserStore((s) => s.tokens);

  const pct = hydrated ? Math.min(100, (xp / xpToNext) * 100) : 0;
  const title = ROUTE_TITLES[pathname] ?? 'EcoPulse';

  return (
    <header
      id="app-header"
      className="sticky top-0 z-50 px-3 pt-[calc(env(safe-area-inset-top,0px)+10px)]"
    >
      <div className="surface surface-hud surface-accent-mint rounded-[28px] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/6 text-xl shadow-[0_18px_36px_rgba(145,216,159,0.12)]">
            🌿
          </div>
          <div className="min-w-0 flex-1">
            <div className="hud-label">EcoPulse</div>
            <div className="text-sm font-semibold text-text-primary">{title}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Nível {hydrated ? level : '—'}
            </div>
            <div className="text-sm font-semibold text-text-primary">
              {hydrated ? tokens : '—'} tokens
            </div>
          </div>
          <button
            type="button"
            aria-label="Notificações"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/6 text-text-secondary transition-colors hover:text-text-primary"
          >
            <span className="text-lg" aria-hidden>
              🔔
            </span>
            <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-accent-red" />
          </button>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-secondary">
            <span>{hydrated ? `${xp}/${xpToNext} XP` : 'Sincronizando progresso'}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/6">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
