import { Trophy } from 'lucide-react';
import { LEADERBOARD, TRIBES } from '@/data';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/iconRegistry';
import { cn } from '@/lib/cn';

export function TribesPanel({ currentTribe }: { currentTribe: string }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {TRIBES.map((tribe) => {
          const isMine =
            (tribe.name === 'Guardiões Verdes' && currentTribe === 'guardioes') ||
            (tribe.name === 'EcoWarriors' && currentTribe === 'warriors');
          const Lucide = resolveIcon(tribe.iconName);
          return (
            <div
              key={tribe.id}
              className={cn(
                'flex flex-col items-center gap-2 rounded-[var(--radius-md)] border px-3 py-4 text-center',
                isMine
                  ? 'border-[var(--line-active)] bg-[var(--tint-green-2)]'
                  : 'border-[var(--line-soft)] bg-[var(--tint-1)]'
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  isMine
                    ? 'border border-[var(--line-active)] bg-[var(--bg-primary)] text-[var(--accent-green)]'
                    : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
                )}
              >
                {Lucide ? <Icon icon={Lucide} size={18} /> : null}
              </span>
              <h3 className="t-title leading-tight">{tribe.name}</h3>
              <p className="t-caption">
                #{tribe.rank} · {tribe.members} membros
              </p>
              {isMine ? (
                <span className="mt-1 t-caption font-semibold text-[var(--accent-green)]">
                  sua tribo
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-3 t-title">Ranking da semana</h2>
        <ul className="divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[var(--tint-1)]">
          {LEADERBOARD.slice(0, 10).map((entry) => {
            const isMe = entry.name === 'Você';
            const isTopThree = entry.rank <= 3;
            return (
              <li
                key={entry.rank}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5',
                  isMe && 'bg-[var(--tint-green-2)]'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    isTopThree
                      ? 'gradient-gold text-[var(--on-reward)]'
                      : 'border border-[var(--line-soft)] text-[var(--text-secondary)]'
                  )}
                >
                  {entry.rank}
                </span>
                <span className="text-xl">{entry.avatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="t-title truncate">{entry.name}</div>
                  <div className="t-caption">{entry.tribe}</div>
                </div>
                <span className="inline-flex items-center gap-1 t-body-sm font-semibold text-[var(--accent-gold)]">
                  <Icon icon={Trophy} size={12} />
                  {entry.xp.toLocaleString('pt-BR')}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
