'use client';

import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';

export function AppHeader() {
  const hydrated = useHydrated();
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const xpToNext = useUserStore((s) => s.xpToNext);

  const pct = hydrated ? Math.min(100, (xp / xpToNext) * 100) : 0;

  return (
    <header
      id="app-header"
      className="glass fixed top-0 left-0 right-0 z-50 h-14 border-b"
    >
      <div className="mx-auto flex h-full max-w-3xl items-center gap-3 px-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[22px]" aria-hidden>🌿</span>
          <span className="gradient-text font-display text-lg font-bold">EcoPulse</span>
        </div>
        <div className="flex flex-1 items-center gap-2">
          <div className="h-1.5 max-w-[120px] flex-1 overflow-hidden rounded-full bg-bg-tertiary">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${pct}%`, background: 'var(--gradient-primary)' }}
            />
          </div>
          <span className="whitespace-nowrap text-[11px] font-semibold text-text-secondary">
            Nv.{hydrated ? level : '—'}
          </span>
        </div>
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
        >
          <span className="text-lg" aria-hidden>🔔</span>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-red" />
        </button>
      </div>
    </header>
  );
}
