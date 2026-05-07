import type { AvatarPose, BattleEvent, BattleOutcome, BattleSession, OpponentArchetype } from '@/types';

export type ArenaCueTone =
  | 'neutral'
  | 'attack'
  | 'defend'
  | 'focus'
  | 'critical'
  | 'special'
  | 'finish';

export type ArenaCueImpact = 'none' | 'spotlight' | 'strike' | 'guard' | 'focus' | 'burst' | 'finish';

export interface BattleVisualCue {
  tone: ArenaCueTone;
  impact: ArenaCueImpact;
  actorSide: 'player' | 'opponent' | null;
  targetSide: 'player' | 'opponent' | null;
  playerPose: AvatarPose;
  opponentPose: AvatarPose;
  iconName: 'swords' | 'shield' | 'brain' | 'sparkles' | 'flag' | 'zap';
  title: string;
  shortText: string;
  damageLabel?: string;
}

export interface ArenaOutcomePresentation {
  title: string;
  body: string;
  tone: 'win' | 'loss' | 'draw';
  primaryCta: string;
  secondaryCta: string;
}

export const ARENA_ARCHETYPE_LABELS: Record<OpponentArchetype, string> = {
  balanced: 'Equilibrada',
  aggressive: 'Agressiva',
  defensive: 'Defensiva',
  focus: 'Foco',
  trickster: 'Truque',
};

export function battleEventToVisualCue(event: BattleEvent | undefined, session: BattleSession): BattleVisualCue {
  if (!event) {
    return {
      tone: 'neutral',
      impact: 'spotlight',
      actorSide: null,
      targetSide: null,
      playerPose: 'battleReady',
      opponentPose: 'battleReady',
      iconName: 'flag',
      title: 'Teste pronto',
      shortText: 'Escolha a próxima ação.',
    };
  }

  const actorSide = sideForActor(event.actorId, session);
  const targetSide = sideForActor(event.targetId, session);
  const damageLabel = event.damage > 0 ? `-${event.damage} HP` : undefined;
  const cue = cueForEventType(event, session);

  return {
    ...cue,
    actorSide,
    targetSide,
    damageLabel,
    playerPose: poseForSide('player', actorSide, targetSide, cue, session.outcome),
    opponentPose: poseForSide('opponent', actorSide, targetSide, cue, session.outcome),
  };
}

export function arenaOutcomePresentation(outcome: BattleOutcome): ArenaOutcomePresentation {
  if (outcome === 'win') {
    return {
      title: 'Rival dominado',
      body: 'Loadout aprovado no treino.',
      tone: 'win',
      primaryCta: 'Testar de novo',
      secondaryCta: 'Trocar rival',
    };
  }
  if (outcome === 'loss') {
    return {
      title: 'Derrota',
      body: 'Sem perda de tokens. Ajuste o Vestiário e tente de novo.',
      tone: 'loss',
      primaryCta: 'Tentar de novo',
      secondaryCta: 'Trocar rival',
    };
  }
  return {
    title: 'Empate técnico',
    body: 'Teste registrado.',
    tone: 'draw',
    primaryCta: 'Novo teste',
    secondaryCta: 'Trocar rival',
  };
}

function cueForEventType(event: BattleEvent, session: BattleSession): Omit<BattleVisualCue, 'actorSide' | 'targetSide' | 'playerPose' | 'opponentPose' | 'damageLabel'> {
  if (event.type === 'attack') {
    return baseCue({
      tone: 'attack',
      impact: 'strike',
      iconName: 'swords',
      title: 'Golpe limpo',
      shortText: event.message,
    });
  }
  if (event.type === 'defend' || event.type === 'block') {
    return baseCue({
      tone: 'defend',
      impact: 'guard',
      iconName: 'shield',
      title: event.type === 'block' ? 'Dano contido' : 'Guarda ativa',
      shortText: event.message,
    });
  }
  if (event.type === 'focus') {
    return baseCue({
      tone: 'focus',
      impact: 'focus',
      iconName: 'brain',
      title: 'Foco acumulado',
      shortText: event.message,
    });
  }
  if (event.type === 'critical') {
    return baseCue({
      tone: 'critical',
      impact: 'burst',
      iconName: 'zap',
      title: 'Crítico',
      shortText: event.message,
    });
  }
  if (event.type === 'special') {
    return baseCue({
      tone: 'special',
      impact: 'burst',
      iconName: 'sparkles',
      title: 'Especial',
      shortText: event.message,
    });
  }
  if (event.type === 'finish') {
    const presentation = arenaOutcomePresentation(session.outcome ?? 'draw');
    return baseCue({
      tone: 'finish',
      impact: 'finish',
      iconName: 'flag',
      title: presentation.title,
      shortText: event.message,
    });
  }
  if (event.type === 'initiative') {
    return baseCue({
      tone: 'neutral',
      impact: 'spotlight',
      iconName: 'flag',
      title: 'Iniciativa',
      shortText: event.message,
    });
  }
  return baseCue({
    tone: 'neutral',
    impact: 'spotlight',
    iconName: 'flag',
    title: 'Entrada',
    shortText: event.message,
  });
}

function baseCue(
  cue: Omit<BattleVisualCue, 'actorSide' | 'targetSide' | 'playerPose' | 'opponentPose' | 'damageLabel'>
) {
  return cue;
}

function poseForSide(
  side: 'player' | 'opponent',
  actorSide: BattleVisualCue['actorSide'],
  targetSide: BattleVisualCue['targetSide'],
  cue: Pick<BattleVisualCue, 'tone' | 'impact'>,
  outcome: BattleSession['outcome']
): AvatarPose {
  if (cue.tone === 'finish') return finishPoseForSide(side, outcome);
  if (side === actorSide) {
    if (cue.tone === 'attack' || cue.tone === 'critical' || cue.tone === 'special') return 'attack';
    if (cue.tone === 'defend') return 'defend';
    if (cue.tone === 'focus') return 'focus';
  }
  if (side === targetSide && cue.impact === 'guard') return 'defend';
  return 'battleReady';
}

function finishPoseForSide(side: 'player' | 'opponent', outcome: BattleSession['outcome']): AvatarPose {
  if (outcome === 'draw') return 'battleReady';
  if (outcome === 'win') return side === 'player' ? 'victory' : 'defeat';
  if (outcome === 'loss') return side === 'player' ? 'defeat' : 'victory';
  return 'battleReady';
}

function sideForActor(actorId: string | null | undefined, session: BattleSession) {
  if (!actorId) return null;
  if (actorId === session.player.id) return 'player';
  if (actorId === session.opponent.id) return 'opponent';
  return null;
}
