'use client';

import { Flame, Medal, Trophy, Zap, type LucideIcon } from 'lucide-react';
import type { ArenaProgress } from '@/types';
import { arenaLevelProgress } from '@/lib/arena/progress';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ListCard } from '@/components/ui/ListCard';
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
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="t-title">Rank da Arena</h2>
        <span className="t-caption">{progress.defeatedOpponents.length}/{totalOpponents} rivais dominados</span>
      </div>

      <Card tone="hero" padded={false} className="px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="t-eyebrow">Arena nível {level.arenaLevel}</p>
            <h3 className="t-headline mt-1">{rank}</h3>
            <p className="mt-1 t-caption">{progress.arenaXp} Arena XP total</p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tint-green-3 text-[var(--accent-green)]">
            <Icon icon={Trophy} size={22} />
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between gap-2 t-caption">
            <span>Próximo nível</span>
            <span>{level.current}/{level.next} XP</span>
          </div>
          <ProgressBar value={level.current} max={level.next} ariaLabel="Progresso do rank da Arena" />
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard icon={Medal} label="Vitórias" value={progress.wins} tone="green" />
        <MetricCard icon={Zap} label="Sequência" value={progress.winStreak} tone="gold" />
        <MetricCard icon={Flame} label="Melhor" value={progress.bestStreak} tone="cyan" />
      </div>

      {progress.history.length > 0 ? (
        <ListCard>
          {progress.history.slice(0, 4).map((battle) => (
            <li key={battle.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="t-title truncate">{battle.opponent.name}</p>
                <p className="t-caption">
                  {formatDate(battle.playedAt)} · {battle.rounds} round{battle.rounds === 1 ? '' : 's'}
                </p>
              </div>
              <span className={outcomeClass(battle.outcome)}>
                {battle.outcome === 'win' ? 'Vitória' : battle.outcome === 'loss' ? 'Derrota' : 'Empate'}
              </span>
            </li>
          ))}
        </ListCard>
      ) : (
        <p className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-4 py-4 text-center t-body-sm">
          Nenhuma sessão tática registrada ainda.
        </p>
      )}
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone: 'green' | 'gold' | 'cyan';
}) {
  return (
    <Card tone="soft" padded={false} className="px-3 py-3 text-center">
      <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-tint-2">
        <Icon icon={icon} size={16} className={ICON_TONE[tone]} />
      </span>
      <p className="mt-2 t-caption">{label}</p>
      <p className="t-headline mt-1">{value}</p>
    </Card>
  );
}

function rankName(level: number) {
  if (level >= 6) return 'Lenda Regenerativa';
  if (level >= 5) return 'Guardião Mestre';
  if (level >= 4) return 'Copa Tática';
  if (level >= 3) return 'Raiz Forte';
  if (level >= 2) return 'Broto Valente';
  return 'Aprendiz de Arena';
}

function outcomeClass(outcome: 'win' | 'loss' | 'draw') {
  if (outcome === 'win') return 't-caption font-semibold text-[var(--accent-green)]';
  if (outcome === 'loss') return 't-caption font-semibold text-[var(--accent-red)]';
  return 't-caption font-semibold text-[var(--accent-gold)]';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(value));
}

const ICON_TONE = {
  green: 'text-[var(--accent-green)]',
  gold: 'text-[var(--accent-gold)]',
  cyan: 'text-[var(--accent-cyan)]',
};
