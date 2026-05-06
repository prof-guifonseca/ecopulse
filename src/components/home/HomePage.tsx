'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Gift,
  Heart,
  MapPin,
  ScanLine,
  Swords,
  type LucideIcon,
} from 'lucide-react';
import { DAILY_MISSIONS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useHydrated } from '@/hooks/useHydrated';
import {
  buildMissionChecks,
  resolveDailyAction,
  tryClaimDailyBonus,
  type DailyAction,
  type DailyActionKind,
} from '@/lib/missions';
import { resolveIcon } from '@/lib/iconRegistry';
import { cn } from '@/lib/cn';
import { HomeSkeleton } from './HomeSkeleton';

const DAILY_MISSION_TARGET = 3;

const ACTION_ICONS: Record<DailyActionKind, LucideIcon> = {
  scan: ScanLine,
  social: Heart,
  map: MapPin,
  bonus: Gift,
  complete: Swords,
};

export function HomePage() {
  const hydrated = useHydrated();
  const name = useUserStore((s) => s.name);
  const avatarLoadout = useUserStore((s) => s.avatarLoadout);
  const tokens = useUserStore((s) => s.tokens);
  const streak = useUserStore((s) => s.streak);
  const level = useUserStore((s) => s.level);
  const dailyMissions = useGameStore((s) => s.dailyMissions);

  if (!hydrated) return <HomeSkeleton />;

  const checks = buildMissionChecks(dailyMissions);
  const action = resolveDailyAction(checks, dailyMissions.bonusClaimed);
  const progressPct = (action.completedCount / DAILY_MISSION_TARGET) * 100;
  const ActionIcon = ACTION_ICONS[action.kind];

  return (
    <PageShell spacing={5} className="max-w-full overflow-hidden">
      <section className="pt-3">
        <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-4 overflow-hidden">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-soft bg-tint-1">
            <Avatar loadout={avatarLoadout} size="md" alt={name} />
          </div>
          <div className="min-w-0">
            <h1 className="t-headline truncate">
              Oi, <span className="t-italic-soft">{name}.</span>
            </h1>
            <p className="mt-1 truncate t-caption">
              Nível {level} · {streak > 0 ? `${streak}d seguidos` : 'sem sequência'} · {tokens} tokens
            </p>
          </div>
        </div>
      </section>

      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-tint-green-3 text-[var(--accent-green)]">
            <Icon icon={ActionIcon} size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-eyebrow">Próxima ação</p>
            <h2 className="t-headline mt-1">{action.title}</h2>
            <p className="mt-2 t-body-sm">{action.body}</p>
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

        <ActionButton action={action} />
      </Card>

      <section>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="t-title">Hoje</h2>
          <span className="hidden t-caption min-[420px]:inline">
            {dailyMissions.bonusClaimed ? 'Bônus coletado' : `${action.completedCount}/3 concluídas`}
          </span>
        </div>

        <ul className="divide-y divide-[var(--line-soft)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-tint-1">
          {DAILY_MISSIONS.map((mission) => {
            const isDone = checks[mission.id as keyof typeof checks];
            const MissionIcon = resolveIcon(mission.iconName);
            return (
              <li key={mission.id} className="flex items-center gap-3 px-3 py-3">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    isDone
                      ? 'bg-[var(--accent-green)] text-[var(--on-primary)]'
                      : 'border-soft text-[var(--text-secondary)]'
                  )}
                >
                  {isDone ? (
                    <Icon icon={Check} size={14} strokeWidth={2.6} />
                  ) : MissionIcon ? (
                    <Icon icon={MissionIcon} size={15} />
                  ) : null}
                </span>
                <span className={cn('min-w-0 flex-1 truncate t-body-sm', isDone && 'text-[var(--accent-green)]')}>
                  {mission.title}
                </span>
                <span className="shrink-0 t-caption font-semibold text-[var(--accent-gold)]">
                  +{mission.reward}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
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
      href={action.href ?? '/arena'}
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
