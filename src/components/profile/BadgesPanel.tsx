import { BADGES } from '@/data';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/iconRegistry';
import { cn } from '@/lib/cn';

export function BadgesPanel({ owned }: { owned: string[] }) {
  return (
    <section className="space-y-4">
      <p className="t-caption">
        {owned.length}/{BADGES.length} desbloqueados
      </p>
      <div className="stagger grid grid-cols-3 gap-3">
        {BADGES.map((badge) => {
          const unlocked = owned.includes(badge.id);
          const Lucide = resolveIcon(badge.iconName);
          return (
            <div
              key={badge.id}
              className={cn(
                'border-soft bg-tint-1 flex flex-col items-center gap-2 rounded-[var(--radius-md)] px-2 py-4 text-center transition-opacity',
                !unlocked && 'opacity-35',
              )}
            >
              <span
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  unlocked
                    ? 'border-active bg-tint-green-2 text-[var(--accent-green)]'
                    : 'border-soft text-[var(--text-secondary)]',
                )}
              >
                {Lucide ? <Icon icon={Lucide} size={20} /> : null}
              </span>
              <div className="t-caption leading-tight font-semibold text-[var(--text-primary)]">
                {badge.name}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
