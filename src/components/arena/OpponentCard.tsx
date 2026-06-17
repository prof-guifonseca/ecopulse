'use client';

import { CheckCircle2, LockKeyhole } from 'lucide-react';
import type { ArenaOpponent, ArenaRivalMastery } from '@/types';
import { arenaStageVisual } from '@/data';
import { ARENA_ARCHETYPE_LABELS } from '@/lib/arena/presentation';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/shared/Avatar';
import { Icon } from '@/components/ui/Icon';

interface Props {
  opponent: ArenaOpponent;
  selected: boolean;
  defeated: boolean;
  locked?: boolean;
  mastery?: ArenaRivalMastery;
  className?: string;
  onSelect: () => void;
  /** When true, render a "Patrono · Tribo" banner — this rival is patron of the player's tribe. */
  isPatron?: boolean;
  patronLabel?: string;
}

export function OpponentCard({
  opponent,
  selected,
  defeated,
  locked,
  mastery,
  className,
  onSelect,
  isPatron,
  patronLabel,
}: Props) {
  const stage = arenaStageVisual(opponent.stageTheme);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      aria-pressed={selected}
      className={cn('relative text-left disabled:cursor-not-allowed', className)}
    >
      <div
        className={cn(
          'relative h-full overflow-hidden rounded-[var(--radius-lg)] border px-3 py-3 transition-all duration-200',
          selected
            ? 'bg-tint-green-2 border-[var(--line-active)] shadow-[var(--shadow-glow)]'
            : 'bg-tint-1 hover:bg-tint-2 border-[var(--line-soft)]',
          locked && 'opacity-50',
        )}
      >
        {isPatron ? (
          <span
            className="absolute top-2 right-2 z-10 rounded-full bg-[var(--accent-gold)] px-2 py-0.5 text-[0.6rem] font-bold tracking-wide text-[var(--bg-primary)] uppercase"
            aria-label={`Patrono da tribo ${patronLabel ?? ''}`.trim()}
          >
            Patrono{patronLabel ? ` · ${patronLabel}` : ''}
          </span>
        ) : null}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-20 opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${stage.palette.glow}44, transparent 66%)`,
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className={cn(
              'relative flex h-16 w-16 shrink-0 items-end justify-center rounded-full border bg-black/22',
              selected ? 'border-[var(--line-active)]' : 'border-[var(--line-soft)]',
            )}
          >
            <span
              aria-hidden
              className="absolute inset-x-1 bottom-1 h-5 rounded-full"
              style={{
                background: `radial-gradient(ellipse, ${stage.palette.floor} 0%, transparent 70%)`,
              }}
            />
            <Avatar loadout={opponent.loadout} size="md" alt={opponent.name} pose="battleReady" />
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--bg-primary)] text-[0.67rem] font-bold text-[var(--accent-gold)]">
              {opponent.order}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm leading-tight font-bold text-[var(--text-primary)]">
                  {opponent.name}
                </h3>
                <p className="mt-0.5 truncate text-[0.68rem] leading-tight text-[var(--text-secondary)]">
                  {ARENA_ARCHETYPE_LABELS[opponent.archetype]}
                </p>
              </div>
              {locked ? (
                <Icon
                  icon={LockKeyhole}
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--text-muted)]"
                />
              ) : defeated ? (
                <Icon
                  icon={CheckCircle2}
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--accent-green)]"
                />
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="relative z-10 mt-3 flex items-center gap-1"
          aria-label={`Dificuldade ${opponent.difficulty} de 5`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                index < opponent.difficulty ? 'bg-[var(--accent-gold)]' : 'bg-tint-3',
              )}
            />
          ))}
        </div>

        <div className="relative z-10 mt-3 min-h-[28px]">
          {mastery?.wins ? (
            <span className="bg-tint-green-2 rounded-full px-2 py-1 text-[0.66rem] font-semibold text-[var(--accent-green)]">
              {mastery.wins} vitória{mastery.wins === 1 ? '' : 's'}
            </span>
          ) : (
            <p className="line-clamp-2 text-[0.67rem] leading-snug text-[var(--text-muted)]">
              {stage.floorLabel}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
