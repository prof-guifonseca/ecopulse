'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const TABS = [
  { page: 'home', icon: '🏠', label: 'Home' },
  { page: 'scanner', icon: '🔍', label: 'Scanner' },
  { page: 'map', icon: '🗺️', label: 'Mapa' },
  { page: 'community', icon: '👥', label: 'Comunidade' },
  { page: 'profile', icon: '🌿', label: 'Perfil' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 sm:px-4 lg:px-6">
      <nav
        id="bottom-nav"
        className="pointer-events-auto mx-auto max-w-[900px]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        role="tablist"
      >
        <div className="surface surface-hud surface-accent-mint flex min-h-[var(--nav-height)] items-center gap-1 px-2 py-2 sm:px-3">
          {TABS.map((t) => {
            const active = pathname === `/${t.page}`;

            return (
              <Link
                key={t.page}
                href={`/${t.page}`}
                role="tab"
                aria-current={active ? 'page' : undefined}
                aria-selected={active}
                className={cn(
                  'group flex min-w-0 flex-1 items-center justify-center rounded-2xl px-2 py-2.5 transition-colors',
                  active ? 'bg-white/7 text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <div className="flex min-w-0 flex-col items-center gap-1 sm:flex-row sm:gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent bg-transparent text-[21px] leading-none transition-all',
                      active
                        ? 'border-accent-green/25 bg-accent-green/10 text-accent-green shadow-[0_0_24px_rgba(70,247,194,0.16)]'
                        : 'group-hover:border-white/10 group-hover:bg-white/4'
                    )}
                  >
                    {t.icon}
                  </span>
                  <div className="min-w-0 text-center sm:text-left">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted sm:text-[10px]">
                      {t.page}
                    </div>
                    <div className="text-[11px] font-semibold sm:text-xs">{t.label}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
