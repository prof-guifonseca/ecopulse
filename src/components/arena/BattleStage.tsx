'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Brain, ChevronRight, ShieldCheck, Swords, Zap, type LucideIcon } from 'lucide-react';
import type {
  ArenaStageTheme,
  BattleAction,
  BattleEvent,
  BattleFighter,
  BattleResult,
  BattleSession,
  AvatarPose,
} from '@/types';
import { BATTLE_ACTION_LABELS, sessionToBattleResult } from '@/lib/battle/rules';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Props {
  session: BattleSession;
  stageTheme?: ArenaStageTheme;
  onAction: (action: BattleAction) => void;
  onComplete: (result: BattleResult) => void;
}

export function BattleStage({ session, stageTheme = 'forest', onAction, onComplete }: Props) {
  const [reviewingRound, setReviewingRound] = useState(false);
  const completedRef = useRef(false);
  const latestRound = session.rounds.at(-1);
  const lastEvent = session.events.at(-1) ?? session.events[0];
  const currentEvents = useMemo(() => {
    if (session.status === 'finished') {
      return session.events.slice(-5);
    }
    if (reviewingRound && latestRound) {
      return latestRound.events.slice(-5);
    }
    return session.events.slice(-3);
  }, [latestRound, reviewingRound, session.events, session.status]);

  useEffect(() => {
    if (session.status !== 'finished' || completedRef.current) return undefined;
    completedRef.current = true;
    const timer = window.setTimeout(() => onComplete(sessionToBattleResult(session)), 180);
    return () => window.clearTimeout(timer);
  }, [onComplete, session]);

  const playerActive = lastEvent?.actorId === session.player.id && lastEvent.type !== 'finish';
  const opponentActive = lastEvent?.actorId === session.opponent.id && lastEvent.type !== 'finish';
  const roundLabel =
    session.status === 'finished'
      ? 'Encerrada'
      : `Round ${Math.min(session.round, session.maxRounds)} de ${session.maxRounds}`;
  const canChooseAction = session.status === 'active' && !reviewingRound;
  const lastDamage = [...currentEvents].reverse().find((event) => event.damage > 0);

  return (
    <section className="space-y-3" aria-label="Arena tática por round">
      <div
        className={cn(
          'relative overflow-hidden rounded-[var(--radius-lg)] px-3 py-4 shadow-[var(--shadow-deep-glow)] sm:px-5',
          THEME_BG[stageTheme]
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[45%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line-strong)] bg-black/10 blur-[1px]"
        />

        <div className="relative flex items-center justify-between gap-2">
          <span className="rounded-full border-soft bg-black/20 px-3 py-1 t-caption text-[var(--text-secondary)]">
            {roundLabel}
          </span>
          <span className="rounded-full border-soft bg-black/20 px-3 py-1 t-caption text-[var(--text-secondary)]">
            Energia 60
          </span>
        </div>

        <div className="relative mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-1.5 sm:gap-2">
          <FighterPod
            fighter={session.player}
            hp={session.playerHp}
            energy={session.playerEnergy}
            guard={session.playerGuard}
            focus={session.playerFocus}
            active={playerActive}
            align="left"
            pose={playerActive ? poseForEvent(lastEvent) : 'battleReady'}
          />
          <div className="mb-24 flex h-10 w-10 items-center justify-center rounded-full border-soft bg-[var(--bg-primary)] t-title text-[var(--accent-gold)] shadow-[var(--shadow-card)] sm:mb-24 sm:h-11 sm:w-11">
            VS
          </div>
          <FighterPod
            fighter={session.opponent}
            hp={session.opponentHp}
            energy={session.opponentEnergy}
            guard={session.opponentGuard}
            focus={session.opponentFocus}
            active={opponentActive}
            align="right"
            pose={opponentActive ? poseForEvent(lastEvent) : 'battleReady'}
          />
        </div>

        {lastDamage ? (
          <div className="relative -mt-2 flex justify-center">
            <span className="gradient-gold rounded-full px-4 py-2 t-title text-[var(--on-reward)] shadow-[var(--shadow-glow)]">
              -{lastDamage.damage} HP
            </span>
          </div>
        ) : null}
      </div>

      {latestRound ? (
        <div className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="t-eyebrow">Round {latestRound.round}</p>
            <div className="flex flex-wrap gap-2">
              <ActionChip label="Você" action={latestRound.playerAction} />
              <ActionChip label="IA" action={latestRound.opponentAction} />
            </div>
          </div>
        </div>
      ) : null}

      <div aria-live="polite" className="rounded-[var(--radius-md)] border-soft bg-tint-1 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="t-eyebrow">Timeline</p>
            <h2 className="t-title mt-1">{timelineTitle(session, reviewingRound)}</h2>
          </div>
          {session.status === 'finished' ? (
            <span className={cn('rounded-full px-3 py-1 t-caption font-semibold', OUTCOME_STYLE[session.outcome ?? 'draw'])}>
              {session.outcome === 'win' ? 'Vitória' : session.outcome === 'loss' ? 'Derrota' : 'Empate'}
            </span>
          ) : null}
        </div>

        <ol className="mt-3 space-y-2">
          {currentEvents.map((event) => (
            <TimelineEvent key={event.id} event={event} active={event.id === lastEvent?.id} />
          ))}
        </ol>
      </div>

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+86px)] z-10 rounded-[var(--radius-lg)] border-soft bg-[var(--glass-bg)] p-3 shadow-[var(--shadow-lifted)] backdrop-blur-xl">
        {session.status === 'finished' ? (
          <div className="flex items-center justify-between gap-3 px-1 py-1">
            <div className="min-w-0">
              <p className="t-title">{finishTitle(session)}</p>
              <p className="mt-0.5 t-caption">Arena XP registrado. Eco-Tokens intactos.</p>
            </div>
            <Icon icon={Zap} size={22} className="shrink-0 text-[var(--accent-gold)]" />
          </div>
        ) : reviewingRound ? (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => setReviewingRound(false)}
            rightIcon={<Icon icon={ChevronRight} size={18} />}
          >
            Próximo round
          </Button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {ACTION_BUTTONS.map((item) => (
              <button
                key={item.action}
                type="button"
                disabled={!canChooseAction}
                onClick={() => {
                  setReviewingRound(true);
                  onAction(item.action);
                }}
                className="min-h-[78px] rounded-[var(--radius-md)] border-soft bg-tint-2 px-2 py-3 text-center transition-colors hover:bg-tint-green-2 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-primary)] text-[var(--accent-green)]">
                  <Icon icon={item.icon} size={18} />
                </span>
                <span className="mt-2 block t-title">{item.label}</span>
                <span className="mt-0.5 block t-caption">{item.hint}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FighterPod({
  fighter,
  hp,
  energy,
  guard,
  focus,
  active,
  align,
  pose,
}: {
  fighter: BattleFighter;
  hp: number;
  energy: number;
  guard: number;
  focus: number;
  active: boolean;
  align: 'left' | 'right';
  pose: AvatarPose;
}) {
  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right')}>
      <div
        className={cn(
          'mx-auto flex h-[124px] w-[124px] max-w-full items-end justify-center rounded-full bg-black/10 transition-transform duration-300',
          active && (align === 'left' ? 'translate-x-2 scale-[1.03]' : '-translate-x-2 scale-[1.03]')
        )}
      >
        <Avatar
          loadout={fighter.loadout}
          baseId={fighter.avatarBase}
          outfits={fighter.avatarOutfits}
          skinPackId={fighter.skinPackId}
          size="stage"
          alt={fighter.name}
          mirror={align === 'right'}
          pose={pose}
        />
      </div>

      <div className="mt-2 min-w-0">
        <p className="truncate t-title">{fighter.name}</p>
        <p className="truncate t-caption">{fighter.title}</p>
      </div>

      <div className="mt-2 space-y-1.5">
        <Meter label="HP" value={hp} max={fighter.stats.hp} />
        <Meter label="Energia" value={energy} max={60} tone="energy" />
      </div>

      <div className={cn('mt-2 flex flex-wrap gap-1', align === 'right' && 'justify-end')}>
        {guard > 0 ? <StatusPill>Defesa {Math.round(guard * 100)}%</StatusPill> : null}
        {focus > 0 ? <StatusPill>Foco {focus}/3</StatusPill> : null}
      </div>
    </div>
  );
}

function poseForEvent(event: BattleEvent | undefined) {
  if (event?.action === 'defend' || event?.type === 'block') return 'defend';
  if (event?.action === 'focus' || event?.type === 'focus') return 'focus';
  if (event?.type === 'finish') return 'battleReady';
  return 'attack';
}

function Meter({
  label,
  value,
  max,
  tone = 'hp',
}: {
  label: string;
  value: number;
  max: number;
  tone?: 'hp' | 'energy';
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 t-caption">
        <span>{label}</span>
        <span>{Math.max(0, Math.round(value))}/{max}</span>
      </div>
      <ProgressBar
        value={Math.max(0, value)}
        max={max}
        size="sm"
        ariaLabel={`${label}: ${Math.max(0, Math.round(value))} de ${max}`}
        fillClassName={tone === 'energy' ? 'gradient-gold' : undefined}
      />
    </div>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border-soft bg-black/20 px-2 py-1 text-[0.65rem] font-semibold text-[var(--text-secondary)]">
      {children}
    </span>
  );
}

function ActionChip({ label, action }: { label: string; action: BattleAction }) {
  return (
    <span className="rounded-full border-soft bg-tint-2 px-2.5 py-1 t-caption text-[var(--text-secondary)]">
      {label}: {BATTLE_ACTION_LABELS[action]}
    </span>
  );
}

function TimelineEvent({ event, active }: { event: BattleEvent; active: boolean }) {
  return (
    <li
      className={cn(
        'rounded-[var(--radius-sm)] px-3 py-2 t-body-sm',
        active ? 'bg-tint-green-2 text-[var(--text-primary)]' : 'bg-tint-1'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span>{event.message}</span>
        {event.damage > 0 ? (
          <span className="shrink-0 rounded-full bg-black/20 px-2 py-0.5 t-caption text-[var(--accent-gold)]">
            {event.damage}
          </span>
        ) : null}
      </div>
    </li>
  );
}

function timelineTitle(session: BattleSession, reviewingRound: boolean) {
  if (session.status === 'finished') return 'Resultado da sessão';
  if (reviewingRound) return 'Revisão do round';
  return 'Escolha sua próxima ação';
}

function finishTitle(session: BattleSession) {
  if (session.outcome === 'win') return 'Rival dominado';
  if (session.outcome === 'loss') return 'Derrota registrada';
  return 'Empate técnico';
}

const ACTION_BUTTONS: Array<{
  action: BattleAction;
  label: string;
  hint: string;
  icon: LucideIcon;
}> = [
  { action: 'attack', label: 'Atacar', hint: '+10 energia', icon: Swords },
  { action: 'defend', label: 'Defender', hint: '+8 energia', icon: ShieldCheck },
  { action: 'focus', label: 'Focar', hint: '+14 energia', icon: Brain },
];

const THEME_BG: Record<ArenaStageTheme, string> = {
  solar:
    'bg-[radial-gradient(circle_at_20%_15%,rgba(224,194,122,0.28),transparent_34%),linear-gradient(180deg,#263526,#111b16)]',
  workshop:
    'bg-[radial-gradient(circle_at_80%_15%,rgba(224,165,118,0.22),transparent_34%),linear-gradient(180deg,#293128,#121915)]',
  circuit:
    'bg-[radial-gradient(circle_at_50%_0%,rgba(126,197,216,0.24),transparent_38%),linear-gradient(180deg,#122d2e,#0d1916)]',
  ginga:
    'bg-[radial-gradient(circle_at_25%_20%,rgba(141,219,152,0.18),transparent_34%),linear-gradient(180deg,#263128,#111813)]',
  forest:
    'bg-[radial-gradient(circle_at_70%_10%,rgba(141,219,152,0.20),transparent_36%),linear-gradient(180deg,#1d3728,#0c140f)]',
};

const OUTCOME_STYLE = {
  win: 'bg-tint-green-3 text-[var(--accent-green)]',
  loss: 'bg-[color-mix(in_srgb,var(--accent-red)_16%,transparent)] text-[var(--accent-red)]',
  draw: 'bg-[color-mix(in_srgb,var(--accent-gold)_16%,transparent)] text-[var(--accent-gold)]',
};
