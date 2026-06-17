import type {
  ArenaOpponent,
  AvatarLoadout,
  BattleAction,
  BattleEffect,
  BattleEvent,
  BattleFighter,
  BattleResult,
  BattleSession,
  BattleStats,
  GearItem,
  GearSet,
  OpponentArchetype,
} from '@/types';
import { deriveStatsFromLoadout } from '@/lib/gear/rules';

const MAX_ROUNDS = 8;
const MAX_ENERGY = 60;
const SPECIAL_COST = 30;

export const BATTLE_STAT_LABELS: Record<keyof BattleStats, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  speed: 'Veloc.',
  focus: 'Foco',
};

export const BATTLE_ACTION_LABELS: Record<BattleAction, string> = {
  attack: 'Atacar',
  defend: 'Defender',
  focus: 'Focar',
};

export function battleStatEntries(stats: Partial<BattleStats> | undefined) {
  if (!stats) return [];
  return (Object.keys(BATTLE_STAT_LABELS) as Array<keyof BattleStats>)
    .map((key) => ({ key, label: BATTLE_STAT_LABELS[key], value: stats[key] ?? 0 }))
    .filter((entry) => entry.value !== 0);
}

export function baseStatsForLevel(level: number): BattleStats {
  const safeLevel = Math.max(1, Math.floor(level));
  return {
    hp: 80 + safeLevel * 5,
    attack: 12 + safeLevel * 2,
    defense: 8 + safeLevel,
    speed: 8 + Math.floor(safeLevel / 2),
    focus: 8 + Math.floor(safeLevel / 2),
  };
}

export function addBattleStats(base: BattleStats, bonus?: Partial<BattleStats>): BattleStats {
  if (!bonus) return base;
  return {
    hp: base.hp + (bonus.hp ?? 0),
    attack: base.attack + (bonus.attack ?? 0),
    defense: base.defense + (bonus.defense ?? 0),
    speed: base.speed + (bonus.speed ?? 0),
    focus: base.focus + (bonus.focus ?? 0),
  };
}

export interface PlayerStatsInput {
  level: number;
  loadout: AvatarLoadout;
  gearItems: GearItem[];
  gearSets: GearSet[];
}

export function derivePlayerStats(input: PlayerStatsInput): BattleStats {
  return deriveStatsFromLoadout({
    baseStats: baseStatsForLevel(input.level),
    loadout: input.loadout,
    gearItems: input.gearItems,
    gearSets: input.gearSets,
  });
}

export interface PlayerFighterInput extends PlayerStatsInput {
  id?: string;
  name: string;
  title: string;
}

export function createPlayerFighter(input: PlayerFighterInput): BattleFighter {
  return {
    id: input.id ?? 'player',
    name: input.name,
    title: input.title,
    level: Math.max(1, Math.floor(input.level)),
    stats: derivePlayerStats(input),
    energy: 0,
    loadout: input.loadout,
    avatarBase: input.loadout.baseId,
    avatarOutfits: {},
    skinPackId: null,
  };
}

export function opponentToFighter(opponent: ArenaOpponent): BattleFighter {
  return {
    id: opponent.id,
    name: opponent.name,
    title: opponent.title,
    level: opponent.level,
    stats: opponent.stats,
    energy: 0,
    loadout: opponent.loadout,
    archetype: opponent.archetype,
    arenaXpReward: opponent.arenaXpReward,
    skinPackId: opponent.skinPackId ?? null,
    avatarBase: opponent.loadout.baseId,
    avatarOutfits: {},
  };
}

export interface StartBattleSessionInput {
  player: BattleFighter;
  opponent: BattleFighter;
  opponentId: string;
  seed: string;
  startedAt?: string;
  maxRounds?: number;
}

export function startBattleSession({
  player,
  opponent,
  opponentId,
  seed,
  startedAt,
  maxRounds = MAX_ROUNDS,
}: StartBattleSessionInput): BattleSession {
  const playerHp = player.stats.hp;
  const opponentHp = opponent.stats.hp;
  const playerEnergy = clampEnergy(player.energy ?? 0);
  const opponentEnergy = clampEnergy(opponent.energy ?? 0);
  const startEvent = makeBattleEvent({
    seed,
    index: 1,
    round: 0,
    type: 'start',
    actorId: null,
    targetId: null,
    damage: 0,
    playerHp,
    opponentHp,
    playerEnergy,
    opponentEnergy,
    effects: [],
    message: `${player.name} testa o loadout contra ${opponent.name}.`,
  });

  return {
    id: `session-${hashString(`${seed}:${opponentId}`).toString(36)}`,
    opponentId,
    seed,
    startedAt: startedAt ?? new Date().toISOString(),
    status: 'active',
    player,
    opponent,
    round: 1,
    maxRounds,
    rngCursor: 1,
    playerHp,
    opponentHp,
    playerEnergy,
    opponentEnergy,
    playerGuard: 0,
    opponentGuard: 0,
    playerFocus: 0,
    opponentFocus: 0,
    winnerId: null,
    outcome: null,
    events: [startEvent],
    rounds: [],
  };
}

export function resolveBattleRound(
  session: BattleSession,
  playerAction: BattleAction,
  opponentActionOverride?: BattleAction,
): BattleSession {
  if (session.status === 'finished') return session;

  let rngCursor = session.rngCursor;
  const rng = () => {
    const value = randomUnit(session.seed, rngCursor);
    rngCursor += 1;
    return value;
  };

  const round = session.round;
  let playerHp = session.playerHp;
  let opponentHp = session.opponentHp;
  let playerEnergy = session.playerEnergy;
  let opponentEnergy = session.opponentEnergy;
  let playerGuard = session.playerGuard;
  let opponentGuard = session.opponentGuard;
  let playerFocus = session.playerFocus;
  let opponentFocus = session.opponentFocus;
  const events = [...session.events];
  const roundEvents: BattleEvent[] = [];

  const pushEvent = (
    event: Omit<BattleEvent, 'id' | 'playerHp' | 'opponentHp' | 'playerEnergy' | 'opponentEnergy'>,
  ) => {
    const nextEvent = makeBattleEvent({
      seed: session.seed,
      index: events.length + 1,
      ...event,
      playerHp,
      opponentHp,
      playerEnergy,
      opponentEnergy,
    });
    events.push(nextEvent);
    roundEvents.push(nextEvent);
  };

  const opponentAction =
    opponentActionOverride ??
    chooseOpponentAction({
      session,
      rng,
      playerAction,
    });
  const firstSide =
    initiativeScore(session.player, rng, playerAction) >=
    initiativeScore(session.opponent, rng, opponentAction)
      ? 'player'
      : 'opponent';
  const secondSide = firstSide === 'player' ? 'opponent' : 'player';

  pushEvent({
    round,
    type: 'initiative',
    actorId: firstSide === 'player' ? session.player.id : session.opponent.id,
    targetId: secondSide === 'player' ? session.player.id : session.opponent.id,
    damage: 0,
    effects: [],
    message: `${firstSide === 'player' ? session.player.name : session.opponent.name} age primeiro no round ${round}.`,
  });

  for (const side of [firstSide, secondSide] as const) {
    if (playerHp <= 0 || opponentHp <= 0) break;
    const action = side === 'player' ? playerAction : opponentAction;

    if (side === 'player') {
      const result = resolveAction({
        action,
        attacker: session.player,
        defender: session.opponent,
        rng,
        attackerEnergy: playerEnergy,
        defenderGuard: opponentGuard,
        attackerFocus: playerFocus,
        defenderHp: opponentHp,
      });
      playerEnergy = result.attackerEnergy;
      playerGuard = result.attackerGuard;
      playerFocus = result.attackerFocus;
      opponentGuard = result.defenderGuard;
      opponentHp = result.defenderHp;
      pushEvent({
        round,
        type: result.type,
        actorId: session.player.id,
        targetId: result.targeted ? session.opponent.id : null,
        action,
        damage: result.damage,
        effects: result.effects,
        message: result.message,
      });
    } else {
      const result = resolveAction({
        action,
        attacker: session.opponent,
        defender: session.player,
        rng,
        attackerEnergy: opponentEnergy,
        defenderGuard: playerGuard,
        attackerFocus: opponentFocus,
        defenderHp: playerHp,
      });
      opponentEnergy = result.attackerEnergy;
      opponentGuard = result.attackerGuard;
      opponentFocus = result.attackerFocus;
      playerGuard = result.defenderGuard;
      playerHp = result.defenderHp;
      pushEvent({
        round,
        type: result.type,
        actorId: session.opponent.id,
        targetId: result.targeted ? session.player.id : null,
        action,
        damage: result.damage,
        effects: result.effects,
        message: result.message,
      });
    }
  }

  const roundFinished = playerHp <= 0 || opponentHp <= 0 || round >= session.maxRounds;
  const nextSession: BattleSession = {
    ...session,
    rngCursor,
    round: round + 1,
    playerHp,
    opponentHp,
    playerEnergy,
    opponentEnergy,
    playerGuard,
    opponentGuard,
    playerFocus,
    opponentFocus,
    events,
    rounds: [
      ...session.rounds,
      {
        round,
        playerAction,
        opponentAction,
        playerHp,
        opponentHp,
        playerEnergy,
        opponentEnergy,
        playerGuard,
        opponentGuard,
        playerFocus,
        opponentFocus,
        events: roundEvents,
        finished: roundFinished,
        winnerId: roundFinished
          ? decideWinner(session.player, session.opponent, playerHp, opponentHp)
          : null,
      },
    ],
  };

  return roundFinished ? finishBattleSession(nextSession) : nextSession;
}

export function finishBattleSession(session: BattleSession): BattleSession {
  if (session.status === 'finished') return session;

  const winnerId = decideWinner(
    session.player,
    session.opponent,
    session.playerHp,
    session.opponentHp,
  );
  const outcome =
    winnerId === session.player.id ? 'win' : winnerId === session.opponent.id ? 'loss' : 'draw';
  const finishRound = session.rounds.at(-1)?.round ?? Math.min(session.round, session.maxRounds);
  const finishEvent = makeBattleEvent({
    seed: session.seed,
    index: session.events.length + 1,
    round: finishRound,
    type: 'finish',
    actorId: winnerId,
    targetId: null,
    damage: 0,
    playerHp: session.playerHp,
    opponentHp: session.opponentHp,
    playerEnergy: session.playerEnergy,
    opponentEnergy: session.opponentEnergy,
    effects: [{ type: 'finish', actorId: winnerId }],
    message:
      outcome === 'draw'
        ? 'O teste encerra em empate técnico.'
        : `${winnerId === session.player.id ? session.player.name : session.opponent.name} vence o treino tático.`,
  });

  return {
    ...session,
    status: 'finished',
    winnerId,
    outcome,
    playedAt: session.playedAt ?? new Date().toISOString(),
    events: [...session.events, finishEvent],
  };
}

export function sessionToBattleResult(session: BattleSession): BattleResult {
  const finished = session.status === 'finished' ? session : finishBattleSession(session);
  return {
    id: `battle-${hashString(`${finished.seed}:${finished.opponentId}`).toString(36)}`,
    opponentId: finished.opponentId,
    seed: finished.seed,
    playedAt: finished.playedAt ?? finished.startedAt,
    player: finished.player,
    opponent: finished.opponent,
    winnerId: finished.winnerId,
    outcome: finished.outcome ?? 'draw',
    rounds: finished.rounds.length,
    events: finished.events,
    finalHp: {
      player: finished.playerHp,
      opponent: finished.opponentHp,
    },
    finalEnergy: {
      player: finished.playerEnergy,
      opponent: finished.opponentEnergy,
    },
  };
}

export interface SimulateBattleInput {
  player: BattleFighter;
  opponent: BattleFighter;
  opponentId: string;
  seed: string;
  playedAt?: string;
  playerPlan?: BattleAction[];
  opponentPlan?: BattleAction[];
}

export function simulateBattle({
  player,
  opponent,
  opponentId,
  seed,
  playedAt,
  playerPlan,
  opponentPlan,
}: SimulateBattleInput): BattleResult {
  let session = startBattleSession({
    player,
    opponent,
    opponentId,
    seed,
    startedAt: playedAt,
  });
  if (playedAt) {
    session = { ...session, playedAt };
  }

  while (session.status === 'active') {
    const action = playerPlan?.[session.round - 1] ?? chooseAutoPlayerAction(session);
    const opponentAction = opponentPlan?.[session.round - 1];
    session = resolveBattleRound(session, action, opponentAction);
  }

  return sessionToBattleResult(session);
}

interface OpponentActionInput {
  session: BattleSession;
  rng: () => number;
  playerAction: BattleAction;
}

function chooseOpponentAction({ session, rng, playerAction }: OpponentActionInput): BattleAction {
  const archetype = session.opponent.archetype ?? 'balanced';
  return chooseActionForArchetype({
    archetype,
    selfHp: session.opponentHp,
    selfMaxHp: session.opponent.stats.hp,
    selfEnergy: session.opponentEnergy,
    selfFocus: session.opponentFocus,
    enemyEnergy: session.playerEnergy,
    enemyAction: playerAction,
    rng,
  });
}

function chooseActionForArchetype({
  archetype,
  selfHp,
  selfMaxHp,
  selfEnergy,
  selfFocus,
  enemyEnergy,
  enemyAction,
  rng,
}: {
  archetype: OpponentArchetype;
  selfHp: number;
  selfMaxHp: number;
  selfEnergy: number;
  selfFocus: number;
  enemyEnergy: number;
  enemyAction: BattleAction;
  rng: () => number;
}): BattleAction {
  const hpPct = selfHp / selfMaxHp;
  const roll = rng();

  if (hpPct < 0.28 && archetype !== 'aggressive' && roll < 0.62) return 'defend';
  if (enemyEnergy >= SPECIAL_COST && archetype !== 'aggressive' && roll < 0.44) return 'defend';

  switch (archetype) {
    case 'aggressive':
      if (selfEnergy >= SPECIAL_COST || roll < 0.72) return 'attack';
      return selfFocus < 2 ? 'focus' : 'attack';
    case 'defensive':
      if (hpPct < 0.7 && roll < 0.55) return 'defend';
      if (selfEnergy < SPECIAL_COST && roll < 0.72) return 'focus';
      return 'attack';
    case 'focus':
      if (selfFocus < 2 && selfEnergy < SPECIAL_COST && enemyAction !== 'attack') return 'focus';
      if (selfFocus < 3 && roll < 0.52) return 'focus';
      return 'attack';
    case 'trickster':
      if (enemyAction === 'focus' && roll < 0.55) return 'attack';
      if (enemyAction === 'attack' && roll < 0.42) return 'defend';
      if (selfFocus < 2 && roll < 0.68) return 'focus';
      return 'attack';
    case 'balanced':
    default:
      if (selfEnergy < SPECIAL_COST && selfFocus < 1 && roll < 0.34) return 'focus';
      if (hpPct < 0.45 && roll < 0.52) return 'defend';
      return 'attack';
  }
}

function chooseAutoPlayerAction(session: BattleSession): BattleAction {
  const hpPct = session.playerHp / session.player.stats.hp;
  if (hpPct < 0.3) return 'defend';
  if (session.playerEnergy < SPECIAL_COST && session.playerFocus < 1) return 'focus';
  return 'attack';
}

interface ActionResolutionInput {
  action: BattleAction;
  attacker: BattleFighter;
  defender: BattleFighter;
  rng: () => number;
  attackerEnergy: number;
  defenderGuard: number;
  attackerFocus: number;
  defenderHp: number;
}

interface ActionResolution {
  type: BattleEvent['type'];
  damage: number;
  message: string;
  targeted: boolean;
  attackerEnergy: number;
  attackerGuard: number;
  defenderGuard: number;
  attackerFocus: number;
  defenderHp: number;
  effects: BattleEffect[];
}

function resolveAction({
  action,
  attacker,
  defender,
  rng,
  attackerEnergy,
  defenderGuard,
  attackerFocus,
  defenderHp,
}: ActionResolutionInput): ActionResolution {
  if (action === 'defend') {
    const guard = Math.min(0.62, 0.36 + attacker.stats.defense / 260);
    return {
      type: 'defend',
      damage: 0,
      targeted: false,
      attackerEnergy: clampEnergy(attackerEnergy + 8),
      attackerGuard: guard,
      defenderGuard,
      attackerFocus,
      defenderHp,
      effects: [
        { type: 'guard', actorId: attacker.id, amount: Math.round(guard * 100) },
        { type: 'energy', actorId: attacker.id, amount: 8 },
      ],
      message: `${attacker.name} defende e prepara o próximo impacto.`,
    };
  }

  if (action === 'focus') {
    const nextFocus = Math.min(3, attackerFocus + 1);
    return {
      type: 'focus',
      damage: 0,
      targeted: false,
      attackerEnergy: clampEnergy(attackerEnergy + 14),
      attackerGuard: 0,
      defenderGuard,
      attackerFocus: nextFocus,
      defenderHp,
      effects: [
        { type: 'focus', actorId: attacker.id, amount: nextFocus },
        { type: 'energy', actorId: attacker.id, amount: 14 },
      ],
      message: `${attacker.name} foca energia e mira um golpe decisivo.`,
    };
  }

  const outcome = attackOutcome({
    attacker,
    defender,
    rng,
    energy: attackerEnergy,
    focusStacks: attackerFocus,
    guardReduction: defenderGuard,
  });
  return {
    type: outcome.type,
    damage: outcome.damage,
    targeted: true,
    attackerEnergy: clampEnergy(attackerEnergy - outcome.energySpent + 10),
    attackerGuard: 0,
    defenderGuard: 0,
    attackerFocus: 0,
    defenderHp: Math.max(0, defenderHp - outcome.damage),
    effects: outcome.effects,
    message: outcome.message,
  };
}

interface AttackOutcomeInput {
  attacker: BattleFighter;
  defender: BattleFighter;
  rng: () => number;
  energy: number;
  focusStacks: number;
  guardReduction: number;
}

interface AttackOutcome {
  type: BattleEvent['type'];
  damage: number;
  message: string;
  energySpent: number;
  effects: BattleEffect[];
}

function attackOutcome({
  attacker,
  defender,
  rng,
  energy,
  focusStacks,
  guardReduction,
}: AttackOutcomeInput): AttackOutcome {
  const variance = 0.82 + rng() * 0.36;
  const focusMultiplier = 1 + focusStacks * 0.12;
  let damage = Math.max(
    3,
    attacker.stats.attack * variance * focusMultiplier - defender.stats.defense * 0.5,
  );
  const canSpecial = energy >= SPECIAL_COST;
  const special =
    canSpecial && rng() < Math.min(0.68, 0.24 + attacker.stats.focus / 170 + focusStacks * 0.1);
  const critical =
    !special && rng() < Math.min(0.34, 0.06 + attacker.stats.focus / 210 + focusStacks * 0.09);
  const randomBlock = !special && rng() < Math.min(0.28, 0.05 + defender.stats.defense / 150);

  if (special) {
    damage = damage * 1.42 + attacker.stats.focus * 0.38;
  } else if (critical) {
    damage *= 1.55;
  }

  if (guardReduction > 0) {
    damage *= 1 - guardReduction;
  } else if (randomBlock) {
    damage *= 0.58;
  }

  const roundedDamage = Math.max(1, Math.round(damage));
  const effects: BattleEffect[] = [
    { type: 'damage', actorId: attacker.id, targetId: defender.id, amount: roundedDamage },
    { type: 'energy', actorId: attacker.id, amount: 10 },
  ];

  if (special) {
    effects.push({
      type: 'special',
      actorId: attacker.id,
      targetId: defender.id,
      amount: roundedDamage,
    });
    return {
      type: 'special',
      damage: roundedDamage,
      energySpent: SPECIAL_COST,
      effects,
      message: `${attacker.name} gasta energia em um especial de ${roundedDamage} dano.`,
    };
  }

  if (critical) {
    effects.push({
      type: 'critical',
      actorId: attacker.id,
      targetId: defender.id,
      amount: roundedDamage,
    });
    return {
      type: 'critical',
      damage: roundedDamage,
      energySpent: 0,
      effects,
      message: `${attacker.name} acerta um crítico de ${roundedDamage} dano.`,
    };
  }

  if (guardReduction > 0 || randomBlock) {
    effects.push({
      type: 'guard',
      actorId: defender.id,
      amount: Math.round((guardReduction || 0.42) * 100),
    });
    return {
      type: 'block',
      damage: roundedDamage,
      energySpent: 0,
      effects,
      message: `${defender.name} reduz o impacto e recebe ${roundedDamage} dano.`,
    };
  }

  return {
    type: 'attack',
    damage: roundedDamage,
    energySpent: 0,
    effects,
    message: `${attacker.name} ataca e causa ${roundedDamage} dano.`,
  };
}

function initiativeScore(fighter: BattleFighter, rng: () => number, action: BattleAction) {
  const actionBonus = action === 'defend' ? 1.5 : action === 'focus' ? -0.5 : 0;
  return fighter.stats.speed + fighter.stats.focus * 0.15 + actionBonus + rng() * 8;
}

function decideWinner(
  player: BattleFighter,
  opponent: BattleFighter,
  playerHp: number,
  opponentHp: number,
) {
  if (playerHp <= 0 && opponentHp <= 0) return null;
  if (opponentHp <= 0) return player.id;
  if (playerHp <= 0) return opponent.id;
  if (playerHp > opponentHp) return player.id;
  if (opponentHp > playerHp) return opponent.id;

  const playerTieBreak = player.stats.speed + player.stats.focus;
  const opponentTieBreak = opponent.stats.speed + opponent.stats.focus;
  if (playerTieBreak > opponentTieBreak) return player.id;
  if (opponentTieBreak > playerTieBreak) return opponent.id;
  return null;
}

function makeBattleEvent({
  seed,
  index,
  round,
  type,
  actorId,
  targetId,
  message,
  action,
  effects,
  damage,
  playerHp,
  opponentHp,
  playerEnergy,
  opponentEnergy,
}: Omit<BattleEvent, 'id'> & { seed: string; index: number }): BattleEvent {
  return {
    id: `${round}-${type}-${hashString(`${seed}:${index}:${type}`).toString(36)}`,
    round,
    type,
    actorId,
    targetId,
    message,
    action,
    effects,
    damage,
    playerHp,
    opponentHp,
    playerEnergy,
    opponentEnergy,
  };
}

function clampEnergy(value: number) {
  return clampInt(value, 0, MAX_ENERGY);
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function randomUnit(seed: string, cursor: number) {
  return (hashString(`${seed}:${cursor}`) >>> 0) / 4294967296;
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
