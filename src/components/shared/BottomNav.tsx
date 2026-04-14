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
    <nav
      id="bottom-nav"
      className="glass fixed bottom-0 left-0 right-0 z-50 flex h-[68px] items-center justify-around border-t px-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      role="tablist"
    >
      {TABS.map((t) => {
        const active = pathname === `/${t.page}`;
        return (
          <Link
            key={t.page}
            href={`/${t.page}`}
            role="tab"
            aria-selected={active}
            className={cn(
              'flex min-w-16 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
              active ? 'text-accent-green' : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <span
              className={cn(
                'text-[22px] leading-none transition-transform',
                active && 'scale-110'
              )}
            >
              {t.icon}
            </span>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
