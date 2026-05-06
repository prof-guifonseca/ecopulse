'use client';

import type { BattleResult } from '@/types';
import { Card } from '@/components/ui/Card';
import { ListCard } from '@/components/ui/ListCard';

interface Props {
  wins: number;
  losses: number;
  defeatedCount: number;
  totalOpponents: number;
  history: BattleResult[];
}

export function ArenaProgressPanel({
  wins,
  losses,
  defeatedCount,
  totalOpponents,
  history,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="t-title">Progresso da Arena</h2>
        <span className="t-caption">{defeatedCount}/{totalOpponents} rivais vencidos</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card tone="soft" padded={false} className="px-3 py-3 text-center">
          <p className="t-caption">Vitórias</p>
          <p className="t-headline mt-1 text-[var(--accent-green)]">{wins}</p>
        </Card>
        <Card tone="soft" padded={false} className="px-3 py-3 text-center">
          <p className="t-caption">Derrotas</p>
          <p className="t-headline mt-1 text-[var(--accent-red)]">{losses}</p>
        </Card>
        <Card tone="soft" padded={false} className="px-3 py-3 text-center">
          <p className="t-caption">Histórico</p>
          <p className="t-headline mt-1">{history.length}</p>
        </Card>
      </div>

      {history.length > 0 ? (
        <ListCard>
          {history.slice(0, 4).map((battle) => (
            <li key={battle.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="t-title truncate">{battle.opponent.name}</p>
                <p className="t-caption">
                  {formatDate(battle.playedAt)} · {battle.rounds} round{battle.rounds === 1 ? '' : 's'}
                </p>
              </div>
              <span
                className={
                  battle.outcome === 'win'
                    ? 't-caption font-semibold text-[var(--accent-green)]'
                    : battle.outcome === 'loss'
                    ? 't-caption font-semibold text-[var(--accent-red)]'
                    : 't-caption font-semibold text-[var(--accent-gold)]'
                }
              >
                {battle.outcome === 'win' ? 'Vitória' : battle.outcome === 'loss' ? 'Derrota' : 'Empate'}
              </span>
            </li>
          ))}
        </ListCard>
      ) : (
        <p className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-4 py-4 text-center t-body-sm">
          Nenhuma batalha registrada ainda.
        </p>
      )}
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(value));
}
