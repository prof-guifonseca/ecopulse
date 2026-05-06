'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { Avatar } from '@/components/shared/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { PageShell } from '@/components/ui/PageShell';
import { gardenStage, GARDEN_LABEL } from '@/lib/garden';
import { Stat } from '@/components/ui/Stat';
import { ImpactPanel } from './ImpactPanel';
import { ShopPanel } from './ShopPanel';
import { BadgesPanel } from './BadgesPanel';

const PROFILE_TABS = [
  { value: 'impact' as const, label: 'Impacto' },
  { value: 'shop' as const, label: 'Loja' },
  { value: 'badges' as const, label: 'Badges' },
];

type TabValue = (typeof PROFILE_TABS)[number]['value'];

export function ProfilePage() {
  const [tab, setTab] = useState<TabValue>('impact');
  const name = useUserStore((s) => s.name);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const xpToNext = useUserStore((s) => s.xpToNext);
  const tokens = useUserStore((s) => s.tokens);
  const streak = useUserStore((s) => s.streak);
  const tribe = useUserStore((s) => s.tribe);
  const badges = useGameStore((s) => s.badges);
  const scannedCount = useGameStore((s) => s.scannedProducts.length);
  const openAvatarBuilder = useUIStore((s) => s.openAvatarBuilder);

  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));
  const stage = gardenStage(level);

  return (
    <PageShell spacing={5} className="w-[min(100%,calc(100vw-40px))] max-w-full overflow-hidden">
      {/* Editorial portrait */}
      <header className="flex flex-col items-center pt-2 text-center">
        <button
          onClick={openAvatarBuilder}
          className="relative h-28 w-28 rounded-full p-2"
          aria-label="Editar avatar"
        >
          <span
            aria-hidden
            className="absolute inset-[-4px] rounded-full opacity-70"
            style={{
              background:
                'conic-gradient(from 130deg, color-mix(in srgb, var(--accent-green) 35%, transparent), transparent 35%, color-mix(in srgb, var(--accent-gold) 30%, transparent), transparent 70%)',
            }}
          />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[var(--bg-secondary)]">
            <Avatar loadout={avatarLoadout} size="md" alt={name} />
          </span>
          <span className="gradient-gold absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[var(--on-reward)]">
            <Icon icon={Pencil} size={12} strokeWidth={2.4} />
          </span>
        </button>

        <h1 className="t-display mt-4 leading-[0.95]">{name}</h1>
        <p className="mt-1.5 t-caption">
          Nível {level} · {tribe === 'guardioes' ? 'Guardiões' : 'EcoWarriors'} · {GARDEN_LABEL[stage]}
        </p>

        <div className="mt-4 grid w-full grid-cols-3 gap-3 text-center">
          <Stat label="Tokens" value={tokens} />
          <Stat label="Streak" value={`${streak}d`} />
          <Stat label="Badges" value={badges.length} />
        </div>

        <div className="mt-4 w-full">
          <div className="mb-1.5 flex items-baseline justify-between t-caption">
            <span>Próximo nível</span>
            <span className="font-semibold text-[var(--text-secondary)]">
              {xp}/{xpToNext} XP
            </span>
          </div>
          <ProgressBar value={pct} size="sm" />
        </div>
      </header>

      <Tabs items={PROFILE_TABS} value={tab} onChange={setTab} />

      {tab === 'impact' && <ImpactPanel scannedCount={scannedCount} />}
      {tab === 'shop' && <ShopPanel tokens={tokens} />}
      {tab === 'badges' && <BadgesPanel owned={badges} />}
    </PageShell>
  );
}
