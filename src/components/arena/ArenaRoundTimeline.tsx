'use client';

import { Brain, Flag, ShieldCheck, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react';
import type { BattleAction, BattleEvent, BattleSession } from '@/types';
import { BATTLE_ACTION_LABELS } from '@/lib/battle/rules';
import { battleEventToVisualCue } from '@/lib/arena/presentation';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

interface Props {
  session: BattleSession;
  events: BattleEvent[];
  activeEventId?: string;
  reviewingRound: boolean;
}

export function ArenaRoundTimeline({ session, events, activeEventId, reviewingRound }: Props) {
  const latestRound = session.rounds.at(-1);

  return (
    <section className="bg-tint-1 rounded-[var(--radius-lg)] border border-[var(--border)] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="t-eyebrow">Timeline</p>
          <h2 className="t-title mt-1">{timelineTitle(session, reviewingRound)}</h2>
        </div>
        {latestRound ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            <ActionChip label="Você" action={latestRound.playerAction} />
            <ActionChip label="IA" action={latestRound.opponentAction} />
          </div>
        ) : null}
      </div>

      <ol className="mt-3 space-y-2">
        {events.map((event) => {
          const cue = battleEventToVisualCue(event, session);
          return (
            <TimelineEvent
              key={event.id}
              event={event}
              cue={cue}
              active={event.id === activeEventId}
            />
          );
        })}
      </ol>
    </section>
  );
}

function TimelineEvent({
  event,
  cue,
  active,
}: {
  event: BattleEvent;
  cue: ReturnType<typeof battleEventToVisualCue>;
  active: boolean;
}) {
  return (
    <li
      className={cn(
        'grid grid-cols-[32px_minmax(0,1fr)_auto] items-start gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 transition-colors',
        active
          ? 'bg-tint-green-2 border-[var(--line-active)]'
          : 'border-[var(--border)] bg-black/10',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full bg-black/24',
          CUE_TEXT[cue.tone],
        )}
      >
        <Icon icon={CUE_ICON[cue.iconName]} size={15} />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm leading-tight font-bold',
            active ? 'text-[var(--foreground)]' : 'text-[var(--text-secondary)]',
          )}
        >
          {cue.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[var(--text-secondary)]">
          {event.message}
        </p>
      </div>
      {event.damage > 0 ? (
        <span className="rounded-full bg-black/24 px-2 py-1 text-xs font-bold text-[var(--accent-gold)]">
          {event.damage}
        </span>
      ) : null}
    </li>
  );
}

function ActionChip({ label, action }: { label: string; action: BattleAction }) {
  return (
    <span className="rounded-full border border-[var(--border)] bg-black/16 px-2 py-1 text-[0.64rem] font-semibold text-[var(--text-secondary)]">
      {label}: {BATTLE_ACTION_LABELS[action]}
    </span>
  );
}

function timelineTitle(session: BattleSession, reviewingRound: boolean) {
  if (session.status === 'finished') return 'Resultado da sessão';
  if (reviewingRound) return 'Leitura do round';
  return 'Escolha sua próxima ação';
}

const CUE_ICON: Record<ReturnType<typeof battleEventToVisualCue>['iconName'], LucideIcon> = {
  swords: Swords,
  shield: ShieldCheck,
  brain: Brain,
  sparkles: Sparkles,
  flag: Flag,
  zap: Zap,
};

const CUE_TEXT: Record<ReturnType<typeof battleEventToVisualCue>['tone'], string> = {
  neutral: 'text-[var(--text-secondary)]',
  attack: 'text-[var(--destructive)]',
  defend: 'text-[var(--accent-cyan)]',
  focus: 'text-[var(--accent-gold)]',
  critical: 'text-[var(--accent-gold)]',
  special: 'text-[var(--accent-cyan)]',
  finish: 'text-[var(--primary)]',
};
