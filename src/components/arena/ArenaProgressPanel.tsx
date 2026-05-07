'use client';

import { Flame, Medal, Trophy, Zap, type LucideIcon } from 'lucide-react';
import type { ArenaProgress } from '@/types';
import { arenaLevelProgress } from '@/lib/arena/progress';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Props {
  progress: ArenaProgress;
  totalOpponents: number;
}

export function ArenaProgressPanel({ progress, totalOpponents }: Props) {
  const level = arenaLevelProgress(progress.arenaXp);
  const rank = rankName(level.arenaLevel);

  return (
    <section className="space-y-3">
      <Card tone="solid" padded={false} className="border-soft px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tint-green-3 text-[var(--accent-green)]">
            <Icon icon={Trophy} size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="t-eyebrow">Evolução de teste</p>
                <h2 className="t-title mt-1 truncate">{rank}</h2>
              </div>
              <span className="shrink-0 rounded-full border-soft bg-tint-1 px-2.5 py-1 t-caption">
                Nv {level.arenaLevel}
              </span>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between gap-2 t-caption">
                <span>{progress.arenaXp} XP de teste</span>
                <span>{level.current}/{level.next}</span>
              </div>
              <ProgressBar value={level.current} max={level.next} ariaLabel="Progresso do teste de loadout" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <Metric icon={Medal} label="Vitórias" value={progress.wins} />
          <Metric icon={Zap} label="Seq." value={progress.winStreak} />
          <Metric icon={Flame} label="Melhor" value={progress.bestStreak} />
          <Metric icon={Trophy} label="Rivais" value={`${progress.defeatedOpponents.length}/${totalOpponents}`} />
        </div>
      </Card>

      {progress.history.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {progress.history.slice(0, 4).map((battle) => (
            <div
              key={battle.id}
              className="min-w-[148px] rounded-[var(--radius-md)] border-soft bg-tint-1 px-3 py-3"
            >
              <p className="truncate text-sm font-bold">{battle.opponent.name}</p>
              <p className="mt-1 t-caption">
                {battle.outcome === 'win' ? 'Vitória' : battle.outcome === 'loss' ? 'Derrota' : 'Empate'} · {battle.rounds}r
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Metric({ icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="min-w-0 rounded-[var(--radius-md)] bg-tint-1 px-2 py-2 text-center">
      <Icon icon={icon} size={14} className="mx-auto text-[var(--accent-green)]" />
      <p className="mt-1 truncate text-[0.62rem] font-semibold uppercase tracking-normal text-[var(--text-muted)]">
        {label}
      </p>
      <p className="t-title mt-0.5">{value}</p>
    </div>
  );
}

function rankName(level: number) {
  if (level >= 6) return 'Lenda Regenerativa';
  if (level >= 5) return 'Guardião Mestre';
  if (level >= 4) return 'Copa Tática';
  if (level >= 3) return 'Raiz Forte';
  if (level >= 2) return 'Broto Valente';
  return 'Aprendiz de Loadout';
}
