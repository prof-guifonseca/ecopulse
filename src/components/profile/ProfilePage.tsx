'use client';

import { useState } from 'react';
import { MapPin, Pencil } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useArenaStore } from '@/store/arenaStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useCurrentRegion } from '@/lib/region';
import { GEAR_SETS } from '@/data';
import { Avatar } from '@/components/shared/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Tabs } from '@/components/ui/Tabs';
import { PageShell } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { gardenStage, GARDEN_LABEL } from '@/lib/garden';
import { selectEcoQualityIndex } from '@/lib/ecoMultiplier';
import { chapterProgress } from '@/lib/journey';
import { TRIBES, type TribeId } from '@/data/tribes';
import { Stat } from '@/components/ui/Stat';
import { ImpactPanel } from './ImpactPanel';
import { ShopPanel } from './ShopPanel';
import { BadgesPanel } from './BadgesPanel';
import { JourneySection } from './JourneySection';
import { FlorestaSection } from './FlorestaSection';

const PROFILE_TABS = [
  { value: 'impact' as const, label: 'Impacto' },
  { value: 'shop' as const, label: 'Vestiário' },
  { value: 'badges' as const, label: 'Badges' },
];

type TabValue = (typeof PROFILE_TABS)[number]['value'];

interface ProfilePageProps {
  initialTab?: TabValue;
}

export function ProfilePage({ initialTab = 'impact' }: ProfilePageProps) {
  const [tab, setTab] = useState<TabValue>(initialTab);
  const name = useUserStore((s) => s.name);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const xpToNext = useUserStore((s) => s.xpToNext);
  const tokens = useUserStore((s) => s.tokens);
  const streak = useUserStore((s) => s.streak);
  const tribe = useUserStore((s) => s.tribe);
  const badges = useGameStore((s) => s.badges);
  const openAvatarBuilder = useUIStore((s) => s.openAvatarBuilder);

  const scannedProducts = useGameStore((s) => s.scannedProducts);
  const visitedPoints = useGameStore((s) => s.visitedPoints);
  const defeated = useArenaStore((s) => s.defeatedOpponents);
  const history = useScanHistoryStore((s) => s.history);
  const region = useCurrentRegion();
  const tribeId = (tribe ?? 'guardioes') as TribeId;
  const tribeLabel = TRIBES[tribeId]?.label ?? 'Guardiões';
  const activeSet = GEAR_SETS.find((item) => item.id === avatarLoadout.activeSetId);
  const loadoutLabel = activeSet?.name ?? 'Modo livre';

  const eco = selectEcoQualityIndex(history);
  const journey = chapterProgress({
    level,
    scans: scannedProducts.length,
    ecoIndex: eco.letter,
    visitedPointIds: visitedPoints,
    defeatedRivals: defeated.length,
  });
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));
  const stage = gardenStage(level, journey.current);

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
              Nv {level} · {tribeLabel}
            </p>
            <p className="mt-1 t-caption text-[var(--text-secondary)]">{loadoutLabel}</p>
            <p className="mt-1 inline-flex items-center gap-1 t-caption text-[var(--text-muted)]">
              <Icon icon={MapPin} size={11} />
              {region.blurb}
            </p>
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
          <ProgressBar value={pct} size="sm" ariaLabel="Progresso de XP do perfil" />
        </div>
      </Card>

      <JourneySection />
      <FlorestaSection />

      <Tabs items={PROFILE_TABS} value={tab} onChange={setTab} />

      {tab === 'impact' && <ImpactPanel history={history} />}
      {tab === 'shop' && <ShopPanel tokens={tokens} />}
      {tab === 'badges' && <BadgesPanel owned={badges} />}
    </PageShell>
  );
}
