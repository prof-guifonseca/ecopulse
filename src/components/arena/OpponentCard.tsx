'use client';

import { CheckCircle2 } from 'lucide-react';
import type { ArenaOpponent } from '@/types';
import { SkinPackArt } from '@/components/skins/SkinPackArt';
import { BattleStatChips } from '@/components/shared/BattleStatChips';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface Props {
  opponent: ArenaOpponent;
  selected: boolean;
  defeated: boolean;
  onSelect: () => void;
}

export function OpponentCard({ opponent, selected, defeated, onSelect }: Props) {
  return (
    <button type="button" onClick={onSelect} className="w-full text-left">
      <Card
        tone="solid"
        padded={false}
        className={cn(
          'flex h-full gap-3 px-4 py-4 transition-colors',
          selected ? 'border-active bg-tint-green-1' : 'border-soft hover:bg-tint-2'
        )}
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-tint-2">
          <SkinPackArt id={opponent.skinPackId} size="md" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="t-title truncate">{opponent.name}</h3>
              <p className="mt-0.5 truncate t-caption">{opponent.title}</p>
            </div>
            {defeated ? (
              <Icon icon={CheckCircle2} size={16} className="mt-0.5 shrink-0 text-[var(--accent-green)]" />
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

          <BattleStatChips stats={opponent.stats} compact className="mt-2" />
        </div>
      </Card>
    </button>
  );
}
