import type { BattleStats } from '@/types';
import { battleStatEntries } from '@/lib/battle/rules';
import { cn } from '@/lib/cn';

interface Props {
  stats?: Partial<BattleStats>;
  className?: string;
  compact?: boolean;
}

export function BattleStatChips({ stats, className, compact }: Props) {
  const entries = battleStatEntries(stats);
  if (entries.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {entries.map((entry) => (
        <span
          key={entry.key}
          className={cn(
            'bg-tint-2 inline-flex max-w-full items-center rounded-full border border-[var(--line-soft)] font-semibold text-[var(--text-secondary)]',
            compact ? 'px-2 py-1 text-[0.64rem]' : 'px-2.5 py-1 text-[0.68rem]',
          )}
        >
          +{entry.value} {entry.label}
        </span>
      ))}
    </div>
  );
}
