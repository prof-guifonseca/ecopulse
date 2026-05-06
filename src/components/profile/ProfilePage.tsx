'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { GEAR_SETS } from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
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
  const activeSet = GEAR_SETS.find((item) => item.id === avatarLoadout.activeSetId);
  const loadoutLabel = activeSet?.name ?? 'Modo livre';

  return (
    <PageShell spacing={5} className="max-w-full overflow-hidden">
      <Card as="header" tone="solid" padded={false} className="px-4 py-4">
        <div className="grid grid-cols-[8.75rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
          <button
            onClick={openAvatarBuilder}
            className="relative flex h-40 w-full items-end justify-center overflow-hidden rounded-[var(--radius-lg)] border-soft bg-[radial-gradient(circle_at_50%_12%,rgba(126,230,178,0.16),transparent_48%),var(--tint-1)]"
            aria-label="Editar avatar"
          >
            <Avatar loadout={avatarLoadout} size="stage" alt={name} pose="builder" />
            <span className="gradient-gold absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--on-reward)]">
              <Icon icon={Pencil} size={12} strokeWidth={2.4} />
            </span>
          </button>

          <div className="min-w-0">
            <h1 className="t-display truncate">{name}</h1>
            <p className="mt-1 t-caption">
              Nv {level} · {loadoutLabel}
            </p>
            <p className="mt-1 t-caption">{tribe === 'guardioes' ? 'Guardiões' : 'EcoWarriors'}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat label="Tokens" value={tokens} className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-2 py-3" />
          <Stat label="Seq." value={`${streak}d`} className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-2 py-3" />
          <Stat label="Badges" value={badges.length} className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-2 py-3" />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-baseline justify-between t-caption">
            <span>{GARDEN_LABEL[stage]}</span>
            <span className="font-semibold text-[var(--text-secondary)]">
              {xp}/{xpToNext} XP
            </span>
          </div>
          <ProgressBar value={pct} size="sm" />
        </div>
      </Card>

      <Tabs items={PROFILE_TABS} value={tab} onChange={setTab} />

      {tab === 'impact' && <ImpactPanel scannedCount={scannedCount} />}
      {tab === 'shop' && <ShopPanel tokens={tokens} />}
      {tab === 'badges' && <BadgesPanel owned={badges} />}
    </PageShell>
  );
}
