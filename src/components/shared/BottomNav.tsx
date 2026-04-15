'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScanLine, MapPin, Users, UserRound, type LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

const TABS: Array<{ page: string; label: string; icon: LucideIcon }> = [
  { page: 'home', label: 'Início', icon: Home },
  { page: 'scanner', label: 'Scanner', icon: ScanLine },
  { page: 'map', label: 'Mapa', icon: MapPin },
  { page: 'community', label: 'Rede', icon: Users },
  { page: 'profile', label: 'Perfil', icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]">
      <nav
        id="bottom-nav"
        className="pointer-events-auto mx-auto max-w-[var(--shell-width)]"
        role="tablist"
      >
        <div
          className="flex items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--line-soft)] bg-[rgba(15,23,19,0.9)] px-2 py-1.5 shadow-[var(--shadow-lifted)]"
          style={{ backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' }}
        >
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
                  'group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-1 py-2 transition-colors duration-200',
                  active ? 'text-accent-green' : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                    active ? 'bg-[rgba(141,219,152,0.14)]' : 'bg-transparent'
                  )}
                >
                  <Icon
                    icon={t.icon}
                    size={20}
                    strokeWidth={active ? 2.1 : 1.6}
                    className={active ? 'text-accent-green' : 'text-current'}
                  />
                </span>
                <span className={cn('text-[0.68rem] font-semibold leading-none', active ? 'text-text-primary' : '')}>
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
