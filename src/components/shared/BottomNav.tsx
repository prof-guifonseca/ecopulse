'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import { buildDemoHref, isDemoMode } from '@/lib/demoMode';

const TABS = [
  { page: 'home', label: 'Início', icon: '⌂' },
  { page: 'scanner', label: 'Scanner', icon: '◎' },
  { page: 'map', label: 'Mapa', icon: '⌖' },
  { page: 'community', label: 'Rede', icon: '☰' },
  { page: 'profile', label: 'Perfil', icon: '◌' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const demoMode = isDemoMode(searchParams);

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
      <nav
        id="bottom-nav"
        className="pointer-events-auto mx-auto max-w-[var(--shell-width)]"
        role="tablist"
      >
        <div className="flex min-h-[var(--nav-height)] items-center justify-between rounded-[30px] border border-white/8 bg-[rgba(9,14,12,0.82)] px-2 py-2 shadow-[0_24px_60px_rgba(1,8,5,0.28)] backdrop-blur-xl">
          {TABS.map((t) => {
            const active = pathname === `/${t.page}`;

            return (
              <Link
                key={t.page}
                href={buildDemoHref(`/${t.page}`, demoMode)}
                role="tab"
                aria-current={active ? 'page' : undefined}
                aria-selected={active}
                className={cn(
                  'group flex min-w-0 flex-1 items-center justify-center px-1 py-1.5 transition-colors duration-200',
                  active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <div className="flex min-w-0 flex-col items-center gap-1">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-[1rem] transition-all duration-200',
                      active
                        ? 'bg-accent-green/12 text-accent-green'
                        : 'bg-transparent text-text-secondary'
                    )}
                  >
                    {t.icon}
                  </span>
                  <span className="text-[0.71rem] font-medium">{t.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
