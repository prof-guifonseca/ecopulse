'use client';

import { useEffect, useRef, useState } from 'react';
import type { BattleFighter, BattleResult } from '@/types';
import { Avatar } from '@/components/shared/Avatar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';

interface Props {
  result: BattleResult;
  onComplete: (result: BattleResult) => void;
}

export function BattleStage({ result, onComplete }: Props) {
  const [eventIndex, setEventIndex] = useState(0);
  const completedRef = useRef(false);
  const currentEvent = result.events[eventIndex] ?? result.events[0];
  const visibleEvents = result.events.slice(Math.max(0, eventIndex - 3), eventIndex + 1);

  useEffect(() => {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (eventIndex < result.events.length - 1) {
      const delay = reducedMotion ? 120 : currentEvent.type === 'start' ? 650 : 920;
      const timer = window.setTimeout(() => {
        setEventIndex((value) => Math.min(value + 1, result.events.length - 1));
      }, delay);
      return () => window.clearTimeout(timer);
    }

    if (!completedRef.current) {
      completedRef.current = true;
      const timer = window.setTimeout(() => onComplete(result), reducedMotion ? 80 : 360);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [currentEvent.type, eventIndex, onComplete, result]);

  const playerHp = currentEvent.playerHp;
  const opponentHp = currentEvent.opponentHp;
  const playerActive = currentEvent.actorId === result.player.id && currentEvent.type !== 'finish';
  const opponentActive = currentEvent.actorId === result.opponent.id && currentEvent.type !== 'finish';

  return (
    <section className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] px-4 py-5"
        aria-label="Batalha simulada em andamento"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 22% 35%, color-mix(in srgb, var(--accent-green) 15%, transparent), transparent 30%), radial-gradient(circle at 78% 35%, color-mix(in srgb, var(--accent-gold) 15%, transparent), transparent 32%)',
          }}
        />

        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <FighterPod fighter={result.player} hp={playerHp} active={playerActive} align="left" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-soft bg-[var(--bg-primary)] t-title text-[var(--accent-gold)]">
            VS
          </div>
          <FighterPod fighter={result.opponent} hp={opponentHp} active={opponentActive} align="right" />
        </div>

        {currentEvent.damage > 0 ? (
          <div className="relative mt-5 flex justify-center">
            <span className="gradient-gold rounded-full px-4 py-2 t-title text-[var(--on-reward)] shadow-[var(--shadow-glow)]">
              -{currentEvent.damage} HP
            </span>
          </div>
        ) : null}
      </div>

      <div aria-live="polite" className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-4 py-4">
        <p className="t-eyebrow">Log da simulação</p>
        <ol className="mt-3 space-y-2">
          {visibleEvents.map((event) => (
            <li
              key={event.id}
              className={cn(
                'rounded-[var(--radius-sm)] px-3 py-2 t-body-sm',
                event.id === currentEvent.id ? 'bg-tint-green-2 text-[var(--text-primary)]' : 'bg-tint-1'
              )}
            >
              {event.message}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FighterPod({
  fighter,
  hp,
  active,
  align,
}: {
  fighter: BattleFighter;
  hp: number;
  active: boolean;
  align: 'left' | 'right';
}) {
  const hpPct = (hp / fighter.stats.hp) * 100;

  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right')}>
      <div
        className={cn(
          'mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[var(--bg-primary)] p-3 transition-transform duration-300',
          active && (align === 'left' ? 'translate-x-3 scale-105' : '-translate-x-3 scale-105')
        )}
      >
        <Avatar
          baseId={fighter.avatarBase}
          outfits={fighter.avatarOutfits}
          skinPackId={fighter.skinPackId}
          size="lg"
          alt={fighter.name}
        />
      </div>

      <div className="mt-3 min-w-0">
        <p className="t-title truncate">{fighter.name}</p>
        <p className="truncate t-caption">{fighter.title}</p>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between gap-2 t-caption">
          <span>HP</span>
          <span>{Math.max(0, hp)}/{fighter.stats.hp}</span>
        </div>
        <ProgressBar value={hpPct} size="sm" ariaLabel={`HP de ${fighter.name}`} />
      </div>
    </div>
  );
}
