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
  { page: 'community', label: 'Comunidade', icon: Users },
  { page: 'profile', label: 'Perfil', icon: UserRound },
];

/**
 * BottomNav now flows as the last child of the device-shell flex column,
 * so it stays anchored to the shell bottom at any viewport size — instead
 * of escaping to the viewport bottom via `position: fixed` (which broke
 * the centered desktop framing).
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      id="bottom-nav"
      role="tablist"
      className="shrink-0 border-t border-[var(--line-soft)] bg-[var(--glass-bg)] px-3 pb-[calc(env(safe-area-inset-bottom,0px)+8px)] pt-2 backdrop-blur-md"
    >
      <div className="flex items-center gap-1">
        {TABS.map((t) => {
          const active = pathname === `/${t.page}`;
          return (
            <Link
              key={t.page}
              href={`/${t.page}`}
              role="tab"
              aria-current={active ? 'page' : undefined}
              aria-selected={active}
              aria-label={t.label}
              className={cn(
                'group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-1 py-2 transition-colors duration-200',
                active ? 'text-[var(--accent-green)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-200',
                  active ? 'bg-[var(--tint-green-3)]' : 'bg-transparent'
                )}
              >
                <Icon
                  icon={t.icon}
                  size={20}
                  strokeWidth={active ? 2.1 : 1.6}
                />
              </span>
              <span
                className={cn(
                  't-micro font-medium',
                  active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                )}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
