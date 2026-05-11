'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Coins,
  Flame,
  Gift,
  Heart,
  Leaf,
  MapPin,
  ScanLine,
  Shirt,
  type LucideIcon,
} from 'lucide-react';
import { LEGACY_DAILY_MISSIONS, getDailyMissionTemplate } from '@/simulation';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useHydrated } from '@/hooks/useHydrated';
import { useJourneyTransition } from '@/hooks/useJourneyTransition';
import {
  buildMissionChecks,
  resolveDailyAction,
  tryClaimDailyBonus,
  type DailyAction,
  type DailyActionKind,
} from '@/lib/missions';
import { resolveIcon } from '@/lib/iconRegistry';
import { cn } from '@/lib/cn';
import type { TribeId } from '@/data/tribes';
import { HomeSkeleton } from './HomeSkeleton';
import { ChapterPill } from './ChapterPill';
import { FlorestaCounterStrip } from './FlorestaCounterStrip';

const DAILY_MISSION_TARGET = 3;

const ACTION_ICONS: Record<DailyActionKind, LucideIcon> = {
  scan: ScanLine,
  social: Heart,
  map: MapPin,
  bonus: Gift,
  complete: Shirt,
};

export function HomePage() {
  useJourneyTransition();
  const hydrated = useHydrated();
  const name = useUserStore((s) => s.name);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const tokens = useUserStore((s) => s.tokens);
  const streak = useUserStore((s) => s.streak);
  const level = useUserStore((s) => s.level);
  const tribe = useUserStore((s) => (s.tribe ?? 'guardioes') as TribeId);
  const dailyMissions = useGameStore((s) => s.dailyMissions);
  const todaysMissionIds = useGameStore((s) => s.todaysMissionIds);

  if (!hydrated) return <HomeSkeleton />;

  const checks = buildMissionChecks(dailyMissions);
  const action = resolveDailyAction(checks, dailyMissions.bonusClaimed);
  const progressPct = (action.completedCount / DAILY_MISSION_TARGET) * 100;
  const ActionIcon = ACTION_ICONS[action.kind];

  // Build the 3 mission rows from the active simulation plan when populated;
  // fallback to the legacy mission list otherwise.
  const rows = buildMissionRows(todaysMissionIds, dailyMissions, tribe);

  return (
    <PageShell spacing={5} className="max-w-full overflow-hidden">
      <section className="pt-3">
        <Card tone="soft" padded={false} className="px-4 py-4">
          <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border-soft bg-tint-1">
              <Avatar loadout={avatarLoadout} size="md" alt={name} />
            </div>
            <div className="min-w-0">
              <h1 className="t-headline truncate">
                Oi, <span className="t-italic-soft">{name}</span>
              </h1>
              <p className="mt-1 truncate t-caption">Hoje · rotina diária</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <HomeMetric icon={Leaf} label="Nível" value={level} />
            <HomeMetric icon={Flame} label="Seq." value={`${streak}d`} />
            <HomeMetric icon={Coins} label="Tokens" value={tokens} reward />
          </div>

          <div className="mt-4">
            <ChapterPill />
          </div>
        </Card>
      </section>

      <FlorestaCounterStrip />

      <Card tone="solid" padded={false} className="px-5 py-5">
        <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-tint-green-2 text-[var(--accent-green)]">
            <Icon icon={ActionIcon} size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Próxima ação</p>
            <h2 className="t-title mt-1">{action.title}</h2>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-baseline justify-between gap-2 t-caption">
            <span>Missões de hoje</span>
            <span className="font-semibold text-[var(--text-secondary)]">
              {action.completedCount}/{DAILY_MISSION_TARGET}
            </span>
          </div>
          <ProgressBar value={progressPct} size="sm" ariaLabel="Progresso das missões de hoje" />
        </div>

        <ul className="mt-4 divide-y divide-[var(--line-soft)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-tint-1">
          {rows.map((row) => {
            const MissionIcon = resolveIcon(row.iconName);
            return (
              <li key={row.id} className="flex items-center gap-3 px-3 py-3">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
                    row.done
                      ? 'bg-[var(--accent-green)] text-[var(--on-primary)]'
                      : 'border-soft text-[var(--text-secondary)]'
                  )}
                >
                  {row.done ? (
                    <Icon icon={Check} size={14} strokeWidth={2.6} />
                  ) : MissionIcon ? (
                    <Icon icon={MissionIcon} size={15} />
                  ) : null}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate t-body-sm',
                    row.done && 'text-[var(--accent-green)]'
                  )}
                >
                  {row.title}
                </span>
                <span className="shrink-0 t-caption font-semibold text-[var(--accent-gold)]">
                  +{row.reward}
                </span>
              </li>
            );
          })}
        </ul>

        <ActionButton action={action} />
      </Card>
    </PageShell>
  );
}

interface MissionRow {
  id: string;
  title: string;
  reward: number;
  iconName: string;
  done: boolean;
}

function buildMissionRows(
  ids: string[],
  dailyMissions: { scan: boolean; likes: number; map: boolean },
  tribe: TribeId
): MissionRow[] {
  if (!ids || ids.length === 0) {
    return LEGACY_DAILY_MISSIONS.map((m) => ({
      id: m.id,
      title: m.title,
      reward: m.reward,
      iconName: m.iconName,
      done:
        m.check === 'scan'
          ? dailyMissions.scan
          : m.check === 'likes'
            ? dailyMissions.likes >= (m.target ?? 2)
            : dailyMissions.map,
    }));
  }
  const order: Array<'scan' | 'map' | 'social'> = ['scan', 'map', 'social'];
  return order
    .map((slot) => {
      const tplId = ids.find((i) => getDailyMissionTemplate(i)?.slot === slot);
      const tpl = getDailyMissionTemplate(tplId);
      if (!tpl) return null;
      const flavor = tpl.flavorByTribe[tribe] ?? tpl.flavorByTribe.guardioes;
      const done =
        slot === 'scan'
          ? dailyMissions.scan
          : slot === 'map'
            ? dailyMissions.map
            : dailyMissions.likes >= tpl.target;
      return {
        id: tpl.id,
        title: flavor.title,
        reward: tpl.reward,
        iconName: tpl.iconName,
        done,
      } satisfies MissionRow;
    })
    .filter((x): x is MissionRow => x !== null);
}

function HomeMetric({
  icon,
  label,
  value,
  reward,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  reward?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] border-soft bg-[var(--bg-secondary)] px-3 py-3">
      <div className="flex items-center gap-2">
        <Icon icon={icon} size={15} className={reward ? 'text-[var(--accent-gold)]' : 'text-[var(--accent-green)]'} />
        <span className="truncate text-sm font-bold text-[var(--text-primary)]">{value}</span>
      </div>
      <p className="mt-1 truncate t-caption">{label}</p>
    </div>
  );
}

function ActionButton({ action }: { action: DailyAction }) {
  if (action.kind === 'bonus') {
    return (
      <Button
        variant="reward"
        size="lg"
        fullWidth
        className="mt-5"
        onClick={tryClaimDailyBonus}
        leftIcon={<Icon icon={Gift} size={16} />}
      >
        {action.ctaLabel}
      </Button>
    );
  }

  return (
    <Button
      as={Link}
      href={action.href ?? '/profile?tab=shop'}
      variant={action.kind === 'complete' ? 'secondary' : 'primary'}
      size="lg"
      fullWidth
      className="mt-5"
      rightIcon={<Icon icon={ArrowRight} size={16} />}
    >
      {action.ctaLabel}
    </Button>
  );
}
