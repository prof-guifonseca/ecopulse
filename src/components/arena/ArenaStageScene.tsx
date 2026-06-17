'use client';

import type { ReactNode } from 'react';
import { Brain, Flag, ShieldCheck, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react';
import type { ArenaStageTheme, BattleFighter, BattleSession } from '@/types';
import { arenaStageVisual } from '@/data';
import type { ArenaPropKind } from '@/data/arenaVisuals';
import type { BattleVisualCue } from '@/lib/arena/presentation';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/shared/Avatar';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Props {
  session: BattleSession;
  stageTheme?: ArenaStageTheme;
  cue: BattleVisualCue;
}

export function ArenaStageScene({ session, stageTheme = 'forest', cue }: Props) {
  const visual = arenaStageVisual(stageTheme);

  return (
    <section
      className="arena-stage-scene relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] px-4 pt-3 pb-4 shadow-[var(--shadow-deep-glow)] sm:px-5"
      style={{
        background: `linear-gradient(180deg, ${visual.palette.skyTop} 0%, ${visual.palette.skyMid} 42%, ${visual.palette.skyBottom} 100%)`,
      }}
      aria-label={`Palco ${visual.name}`}
    >
      <StageBackdrop visual={visual} />

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="t-caption font-semibold text-[var(--foreground)]">{visual.name}</p>
          <p className="truncate text-[0.68rem] font-medium tracking-normal text-[var(--text-secondary)] uppercase">
            {visual.ambience}
          </p>
        </div>
        <div
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/24 px-3 py-1 text-[0.68rem] font-semibold',
            CUE_TEXT[cue.tone],
          )}
        >
          <Icon icon={CUE_ICON[cue.iconName]} size={14} />
          <span className="max-w-[104px] truncate">{cue.title}</span>
        </div>
      </div>

      <div className="relative z-10 mt-3 grid min-h-[332px] grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)] items-end gap-1.5 sm:min-h-[360px] sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] sm:gap-3">
        <ArenaFighterHud
          side="player"
          fighter={session.player}
          hp={session.playerHp}
          energy={session.playerEnergy}
          guard={session.playerGuard}
          focus={session.playerFocus}
          cue={cue}
        />

        <div className="t-title mb-[116px] flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/35 text-[var(--accent-gold)] shadow-[0_10px_32px_rgba(0,0,0,0.35)] sm:mb-[132px] sm:h-11 sm:w-11">
          VS
        </div>

        <ArenaFighterHud
          side="opponent"
          fighter={session.opponent}
          hp={session.opponentHp}
          energy={session.opponentEnergy}
          guard={session.opponentGuard}
          focus={session.opponentFocus}
          cue={cue}
        />
      </div>

      <div className="relative z-10 -mt-3 flex justify-center">
        <div className="max-w-full min-w-0 rounded-full border border-white/10 bg-black/36 px-4 py-2 text-center shadow-[0_18px_36px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <p className={cn('t-title truncate', CUE_TEXT[cue.tone])}>
            {cue.damageLabel ?? cue.title}
          </p>
          <p className="t-caption max-w-[292px] truncate">{cue.shortText}</p>
        </div>
      </div>
    </section>
  );
}

function ArenaFighterHud({
  side,
  fighter,
  hp,
  energy,
  guard,
  focus,
  cue,
}: {
  side: 'player' | 'opponent';
  fighter: BattleFighter;
  hp: number;
  energy: number;
  guard: number;
  focus: number;
  cue: BattleVisualCue;
}) {
  const active = cue.actorSide === side;
  const targeted = cue.targetSide === side;
  const pose = side === 'player' ? cue.playerPose : cue.opponentPose;

  return (
    <div className={cn('min-w-0', side === 'opponent' && 'text-right')}>
      <div
        className={cn(
          'mx-auto flex h-[178px] w-[min(42vw,168px)] items-end justify-center rounded-t-full rounded-b-[44%] transition-transform duration-300',
          active &&
            cue.impact === 'strike' &&
            (side === 'player' ? 'arena-strike-left' : 'arena-strike-right'),
          active && cue.impact === 'focus' && 'arena-focus-rise',
          active && cue.impact === 'guard' && 'arena-guard-pulse',
          targeted && cue.impact === 'strike' && 'arena-hit-shake',
        )}
      >
        <div className="relative flex h-[172px] w-[172px] items-end justify-center">
          {active && cue.impact === 'focus' ? <FocusHalo /> : null}
          {active &&
          (cue.impact === 'burst' || cue.tone === 'special' || cue.tone === 'critical') ? (
            <BurstHalo tone={cue.tone} />
          ) : null}
          {active && cue.impact === 'guard' ? <GuardHalo /> : null}
          <Avatar
            loadout={fighter.loadout}
            baseId={fighter.avatarBase}
            outfits={fighter.avatarOutfits}
            skinPackId={fighter.skinPackId}
            size="duel"
            alt={fighter.name}
            mirror={side === 'opponent'}
            pose={pose}
          />
        </div>
      </div>

      <div className="mt-1.5 rounded-[var(--radius-md)] border border-white/10 bg-black/28 px-2.5 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm leading-tight font-bold text-[var(--foreground)]">
              {fighter.name}
            </p>
            <p className="truncate text-[0.67rem] leading-tight text-[var(--text-secondary)]">
              {fighter.title}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-black/28 px-2 py-0.5 text-[0.62rem] font-bold text-[var(--accent-gold)]">
            Nv {fighter.level}
          </span>
        </div>

        <div className="mt-2 space-y-1.5">
          <Meter label="HP" value={hp} max={fighter.stats.hp} />
          <Meter label="EN" value={energy} max={60} tone="energy" />
        </div>

        <div
          className={cn('mt-2 flex min-h-5 flex-wrap gap-1', side === 'opponent' && 'justify-end')}
        >
          {guard > 0 ? <StatePill tone="guard">Defesa {Math.round(guard * 100)}%</StatePill> : null}
          {focus > 0 ? <StatePill tone="focus">Foco {focus}/3</StatePill> : null}
        </div>
      </div>
    </div>
  );
}

function StageBackdrop({ visual }: { visual: ReturnType<typeof arenaStageVisual> }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-x-[-18%] top-[-22%] h-[58%] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${visual.palette.glow}55 0%, transparent 64%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 34%, rgba(255,255,255,0.10), transparent 24%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.16) 58%, rgba(0,0,0,0.46) 100%)',
        }}
      />
      <svg
        aria-hidden
        viewBox="0 0 240 360"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <ellipse cx="120" cy="305" rx="110" ry="34" fill={visual.palette.floor} opacity="0.92" />
        <ellipse
          cx="120"
          cy="296"
          rx="88"
          ry="22"
          fill="none"
          stroke={visual.palette.floorLine}
          strokeWidth="2.2"
          opacity="0.58"
        />
        <path
          d="M38 298 C72 274, 165 274, 202 298"
          fill="none"
          stroke={visual.palette.floorLine}
          strokeWidth="1.4"
          opacity="0.28"
        />
        {visual.particles.map((particle, index) => (
          <circle
            key={`${visual.id}-particle-${index}`}
            cx={particle.cx}
            cy={particle.cy}
            r={particle.r}
            fill={visual.palette[particle.color]}
            opacity={particle.opacity}
            className="arena-particle"
          />
        ))}
        {visual.props.map((prop, index) => (
          <StageProp
            key={`${visual.id}-prop-${prop.kind}-${index}`}
            kind={prop.kind}
            x={prop.x}
            y={prop.y}
            scale={prop.scale}
            mirror={prop.side === 'right'}
            accent={visual.palette.accent}
            accent2={visual.palette.accent2}
            shadow={visual.palette.shadow}
          />
        ))}
      </svg>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          boxShadow: `inset 0 0 80px ${visual.palette.shadow}, inset 0 -48px 80px rgba(0,0,0,0.42)`,
        }}
      />
    </>
  );
}

function StageProp({
  kind,
  x,
  y,
  scale,
  mirror,
  accent,
  accent2,
  shadow,
}: {
  kind: ArenaPropKind;
  x: number;
  y: number;
  scale: number;
  mirror: boolean;
  accent: string;
  accent2: string;
  shadow: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${mirror ? -scale : scale} ${scale})`} opacity="0.72">
      {renderStageProp(kind, accent, accent2, shadow)}
    </g>
  );
}

function renderStageProp(kind: ArenaPropKind, accent: string, accent2: string, shadow: string) {
  if (kind === 'solarPanels') {
    return (
      <g>
        <path d="M0 42 L52 30 L62 52 L10 64 Z" fill={shadow} />
        <path
          d="M6 10 L54 0 L62 26 L14 38 Z"
          fill={accent}
          opacity="0.42"
          stroke={accent}
          strokeWidth="2"
        />
        <path
          d="M22 6 L30 34 M40 3 L48 29 M12 22 L58 12"
          stroke={accent2}
          strokeWidth="1.2"
          opacity="0.6"
        />
      </g>
    );
  }
  if (kind === 'toolRack' || kind === 'workbench') {
    return (
      <g>
        <rect x="0" y="26" width="58" height="34" rx="8" fill={shadow} />
        <rect x="5" y="18" width="50" height="14" rx="5" fill={accent} opacity="0.55" />
        <path
          d="M14 17 L14 -12 M30 17 L38 -10 M46 17 L42 -8"
          stroke={accent2}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>
    );
  }
  if (kind === 'circuitTower' || kind === 'recycleCore') {
    return (
      <g>
        <rect
          x="10"
          y="0"
          width="34"
          height="62"
          rx="12"
          fill={shadow}
          stroke={accent}
          strokeWidth="2"
        />
        <circle cx="27" cy="18" r="9" fill={accent} opacity="0.65" />
        <path d="M18 39 H36 M22 48 H32" stroke={accent2} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === 'drumArc' || kind === 'trainingBanner') {
    return (
      <g>
        <circle cx="22" cy="40" r="20" fill={shadow} stroke={accent} strokeWidth="3" />
        <path
          d="M2 40 C11 24, 33 24, 42 40"
          fill="none"
          stroke={accent2}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M52 -8 V58" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <path d="M52 -4 C69 2, 69 19, 52 25 Z" fill={accent2} opacity="0.6" />
      </g>
    );
  }
  return (
    <g>
      <path
        d="M20 66 C12 35, 20 10, 38 -10 C42 19, 56 36, 46 66 Z"
        fill={shadow}
        stroke={accent}
        strokeWidth="2"
      />
      <path
        d="M34 -6 C26 23, 34 45, 14 66 M39 8 C50 28, 50 46, 62 64"
        stroke={accent2}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.65"
      />
      <circle cx="38" cy="3" r="5" fill={accent} opacity="0.7" />
    </g>
  );
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
      <div className="mb-0.5 flex items-center justify-between gap-2 text-[0.62rem] font-semibold tracking-normal text-[var(--text-secondary)] uppercase">
        <span>{label}</span>
        <span>
          {Math.max(0, Math.round(value))}/{max}
        </span>
      </div>
      <ProgressBar
        value={Math.max(0, value)}
        max={max}
        size="sm"
        ariaLabel={`${label}: ${Math.max(0, Math.round(value))} de ${max}`}
        fillClassName={tone === 'energy' ? 'gradient-gold' : undefined}
        className="bg-black/28"
      />
    </div>
  );
}

function StatePill({ children, tone }: { children: ReactNode; tone: 'guard' | 'focus' }) {
  return (
    <span
      className={cn(
        'rounded-full border border-white/10 bg-black/24 px-2 py-0.5 text-[0.61rem] font-bold',
        tone === 'guard' ? 'text-[var(--accent-cyan)]' : 'text-[var(--accent-gold)]',
      )}
    >
      {children}
    </span>
  );
}

function FocusHalo() {
  return (
    <span
      aria-hidden
      className="arena-focus-halo absolute bottom-10 h-32 w-32 rounded-full border border-[var(--accent-gold)]/35 bg-[radial-gradient(circle,rgba(224,194,122,0.18),transparent_62%)]"
    />
  );
}

function GuardHalo() {
  return (
    <span
      aria-hidden
      className="arena-guard-halo absolute bottom-8 h-32 w-32 rounded-full border-2 border-[var(--accent-cyan)]/45 bg-[radial-gradient(circle,rgba(126,197,216,0.14),transparent_62%)]"
    />
  );
}

function BurstHalo({ tone }: { tone: BattleVisualCue['tone'] }) {
  const color = tone === 'critical' ? 'rgba(224,194,122,0.72)' : 'rgba(126,197,216,0.68)';
  return (
    <span
      aria-hidden
      className="arena-burst-halo absolute bottom-14 h-36 w-36 rounded-full"
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 62%)` }}
    />
  );
}

const CUE_ICON: Record<BattleVisualCue['iconName'], LucideIcon> = {
  swords: Swords,
  shield: ShieldCheck,
  brain: Brain,
  sparkles: Sparkles,
  flag: Flag,
  zap: Zap,
};

const CUE_TEXT: Record<BattleVisualCue['tone'], string> = {
  neutral: 'text-[var(--text-secondary)]',
  attack: 'text-[var(--destructive)]',
  defend: 'text-[var(--accent-cyan)]',
  focus: 'text-[var(--accent-gold)]',
  critical: 'text-[var(--accent-gold)]',
  special: 'text-[var(--accent-cyan)]',
  finish: 'text-[var(--primary)]',
};
