'use client';

import { Check, Coins, Info } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { cn } from '@/lib/cn';

const ICON_MAP = { success: Check, info: Info, reward: Coins } as const;
const TONE_MAP = { success: 'brand', info: 'default', reward: 'reward' } as const;
const ACCENT_MAP = {
  success: 'card-accent-brand',
  info: 'card-accent-brand',
  reward: 'card-accent-reward',
} as const;

export function Toasts() {
  const toasts = useUIStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none absolute bottom-[96px] left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === 'reward' ? 'status' : 'alert'}
          aria-live={t.type === 'reward' ? 'assertive' : 'polite'}
          className={cn(
            'card pointer-events-auto flex w-full max-w-[calc(var(--shell-width)-2rem)] items-center gap-3 px-4 py-3',
            ACCENT_MAP[t.type]
          )}
          style={{ animation: 'slideDown 0.3s ease' }}
        >
          <IconTile size="sm" tone={TONE_MAP[t.type]} icon={<Icon icon={ICON_MAP[t.type]} size={16} strokeWidth={2.4} />} />
          <span className="t-body flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
