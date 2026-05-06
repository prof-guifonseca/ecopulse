'use client';

import { CheckCircle2, LockKeyhole } from 'lucide-react';
import type { ArenaOpponent, ArenaRivalMastery } from '@/types';
import { Avatar } from '@/components/shared/Avatar';
import { BattleStatChips } from '@/components/shared/BattleStatChips';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface Props {
  opponent: ArenaOpponent;
  selected: boolean;
  defeated: boolean;
  locked?: boolean;
  mastery?: ArenaRivalMastery;
  className?: string;
  onSelect: () => void;
}

export function OpponentCard({ opponent, selected, defeated, locked, mastery, className, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      aria-pressed={selected}
      className={cn('w-full text-left disabled:cursor-not-allowed', className)}
    >
      <Card
        tone="solid"
        padded={false}
        className={cn(
          'flex h-full gap-3 px-4 py-4 transition-colors',
          selected ? 'border-active bg-tint-green-1' : 'border-soft hover:bg-tint-2',
          locked && 'opacity-55'
        )}
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-tint-2">
          <Avatar loadout={opponent.loadout} size="md" alt={opponent.name} pose="battleReady" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="t-title truncate">{opponent.name}</h3>
              <p className="mt-0.5 truncate t-caption">{opponent.title}</p>
            </div>
            {locked ? (
              <Icon icon={LockKeyhole} size={16} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
            ) : defeated ? (
              <Icon icon={CheckCircle2} size={16} className="mt-0.5 shrink-0 text-[var(--accent-green)]" />
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-tint-2 px-2 py-1 t-caption">#{opponent.order}</span>
            <span className="rounded-full bg-tint-2 px-2 py-1 t-caption">{ARCHETYPE_LABELS[opponent.archetype]}</span>
            {mastery?.wins ? (
              <span className="rounded-full bg-tint-green-2 px-2 py-1 t-caption text-[var(--accent-green)]">
                {mastery.wins} vitória{mastery.wins === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex items-center gap-1" aria-label={`Dificuldade ${opponent.difficulty} de 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-1.5 flex-1 rounded-full',
                  index < opponent.difficulty ? 'bg-[var(--accent-gold)]' : 'bg-tint-3'
                )}
              />
            ))}
          </div>

          <BattleStatChips stats={opponent.stats} compact className="mt-2 max-w-[calc(100vw-132px)]" />
        </div>
      </Card>
    </button>
  );
}

const ARCHETYPE_LABELS: Record<ArenaOpponent['archetype'], string> = {
  balanced: 'Equilibrada',
  aggressive: 'Agressiva',
  defensive: 'Defensiva',
  focus: 'Foco',
  trickster: 'Truque',
};
