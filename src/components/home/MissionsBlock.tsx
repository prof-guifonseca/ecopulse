'use client';

import { Check, Sparkles } from 'lucide-react';
import { DAILY_MISSIONS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/iconRegistry';
import { missionChecks, tryClaimDailyBonus } from '@/lib/missions';
import { cn } from '@/lib/cn';

const DAILY_MISSION_TARGET = 3;

export function MissionsBlock() {
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  const bonusClaimed = useGameStore((s) => s.dailyMissions.bonusClaimed);

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="t-title">Missões de hoje</h2>
        <span className="t-caption">{done}/{DAILY_MISSION_TARGET}</span>
      </div>

      <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
        {DAILY_MISSIONS.map((mission) => {
          const isDone = checks[mission.id as keyof typeof checks];
          const MissionIcon = resolveIcon(mission.iconName);

          return (
            <li
              key={mission.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isDone && 'bg-[var(--tint-green-2)]'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  isDone
                    ? 'bg-[var(--accent-green)] text-[var(--on-primary)]'
                    : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
                )}
              >
                {isDone ? (
                  <Icon icon={Check} size={14} strokeWidth={2.6} />
                ) : MissionIcon ? (
                  <Icon icon={MissionIcon} size={15} />
                ) : (
                  <span className="text-sm">{mission.emoji}</span>
                )}
              </span>
              <span className={cn('flex-1 t-body', isDone && 'text-[var(--accent-green)]')}>
                {mission.title}
              </span>
              <span className="t-caption font-semibold text-[var(--accent-gold)]">+{mission.reward}</span>
            </li>
          );
        })}
      </ul>

      {done === DAILY_MISSION_TARGET && !bonusClaimed ? (
        <Button
          variant="reward"
          size="md"
          fullWidth
          className="mt-3"
          onClick={tryClaimDailyBonus}
          leftIcon={<Icon icon={Sparkles} size={16} />}
        >
          Coletar bônus diário
        </Button>
      ) : (
        <p className="mt-2 t-caption text-center">
          {bonusClaimed ? 'Bônus de hoje coletado.' : `Complete os 3 e ganhe +25.`}
        </p>
      )}
    </section>
  );
}
