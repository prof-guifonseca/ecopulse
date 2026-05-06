import { describe, expect, it } from 'vitest';
import type { BattleEvent, BattleEventType, BattleSession } from '@/types';
import { arenaOutcomePresentation, battleEventToVisualCue } from './presentation';

const baseSession: BattleSession = {
  id: 'session',
  opponentId: 'rival',
  seed: 'visual',
  startedAt: '2026-05-06T12:00:00.000Z',
  status: 'active',
  player: {
    id: 'player',
    name: 'Aluno',
    title: 'Guardião',
    level: 5,
    stats: { hp: 100, attack: 20, defense: 10, speed: 10, focus: 10 },
  },
  opponent: {
    id: 'rival',
    name: 'Rival',
    title: 'IA',
    level: 5,
    stats: { hp: 100, attack: 20, defense: 10, speed: 10, focus: 10 },
  },
  round: 1,
  maxRounds: 8,
  rngCursor: 1,
  playerHp: 100,
  opponentHp: 88,
  playerEnergy: 10,
  opponentEnergy: 0,
  playerGuard: 0,
  opponentGuard: 0,
  playerFocus: 0,
  opponentFocus: 0,
  winnerId: null,
  outcome: null,
  events: [],
  rounds: [],
};

describe('arena presentation helpers', () => {
  it.each<BattleEventType>([
    'attack',
    'defend',
    'focus',
    'block',
    'critical',
    'special',
    'initiative',
    'finish',
  ])('maps %s events to a visual cue', (type) => {
    const session = type === 'finish' ? { ...baseSession, status: 'finished' as const, outcome: 'win' as const } : baseSession;
    const cue = battleEventToVisualCue(eventOfType(type), session);

    expect(cue.title.length).toBeGreaterThan(0);
    expect(cue.shortText.length).toBeGreaterThan(0);
    expect(cue.playerPose).toBeTruthy();
    expect(cue.opponentPose).toBeTruthy();
  });

  it('assigns finish poses from outcome', () => {
    const winCue = battleEventToVisualCue(eventOfType('finish'), {
      ...baseSession,
      status: 'finished',
      outcome: 'win',
    });
    const lossCue = battleEventToVisualCue(eventOfType('finish'), {
      ...baseSession,
      status: 'finished',
      outcome: 'loss',
    });
    const drawCue = battleEventToVisualCue(eventOfType('finish'), {
      ...baseSession,
      status: 'finished',
      outcome: 'draw',
    });

    expect(winCue.playerPose).toBe('victory');
    expect(winCue.opponentPose).toBe('defeat');
    expect(lossCue.playerPose).toBe('defeat');
    expect(lossCue.opponentPose).toBe('victory');
    expect(drawCue.playerPose).toBe('battleReady');
  });

  it('describes win, loss and draw outcomes', () => {
    expect(arenaOutcomePresentation('win').primaryCta).toBe('Revanche');
    expect(arenaOutcomePresentation('loss').body).toContain('tokens');
    expect(arenaOutcomePresentation('draw').tone).toBe('draw');
  });
});

function eventOfType(type: BattleEventType): BattleEvent {
  return {
    id: `event-${type}`,
    round: type === 'start' ? 0 : 1,
    type,
    actorId: type === 'finish' ? 'player' : 'player',
    targetId: type === 'attack' || type === 'critical' || type === 'special' ? 'rival' : null,
    action: type === 'defend' || type === 'block' ? 'defend' : type === 'focus' ? 'focus' : 'attack',
    message: `Evento ${type}`,
    effects: [],
    damage: type === 'attack' || type === 'critical' || type === 'special' ? 12 : 0,
    playerHp: 100,
    opponentHp: 88,
    playerEnergy: 10,
    opponentEnergy: 0,
  };
}
