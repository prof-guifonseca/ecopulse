import type {
  ArenaOpponent,
  AvatarLoadout,
  BattleAction,
  BattleEvent,
  BattleFighter,
  BattleResult,
  BattleStats,
  GearItem,
  GearSet,
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
    skinPackId: opponent.skinPackId ?? null,
    avatarBase: opponent.loadout.baseId,
    avatarOutfits: {},
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
  const rng = createSeededRandom(seed);
  const events: BattleEvent[] = [];
  let playerHp = player.stats.hp;
  let opponentHp = opponent.stats.hp;
  let playerEnergy = clampEnergy(player.energy ?? 0);
  let opponentEnergy = clampEnergy(opponent.energy ?? 0);
  let playerGuard = 0;
  let opponentGuard = 0;
  let playerFocus = 0;
  let opponentFocus = 0;
  let eventCount = 0;
  let rounds = 0;

  const pushEvent = (event: Omit<BattleEvent, 'id' | 'playerHp' | 'opponentHp' | 'playerEnergy' | 'opponentEnergy'>) => {
    eventCount += 1;
    events.push({
      ...event,
      id: `${event.round}-${event.type}-${eventCount}`,
      playerHp,
      opponentHp,
      playerEnergy,
      opponentEnergy,
    });
  };

  pushEvent({
    round: 0,
    type: 'start',
    actorId: null,
    targetId: null,
    damage: 0,
    message: `${player.name} entra na Arena Simulada contra ${opponent.name}.`,
  });

  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    if (playerHp <= 0 || opponentHp <= 0) break;
    rounds = round;

    const playerAction = chooseAction({
      fighter: player,
      hp: playerHp,
      energy: playerEnergy,
      plan: playerPlan,
      round,
      rng,
    });
    const opponentAction = chooseAction({
      fighter: opponent,
      hp: opponentHp,
      energy: opponentEnergy,
      plan: opponentPlan,
      round,
      rng,
    });

    const playerInitiative = initiativeScore(player, rng, playerAction);
    const opponentInitiative = initiativeScore(opponent, rng, opponentAction);
    const firstSide = playerInitiative >= opponentInitiative ? 'player' : 'opponent';
    const secondSide = firstSide === 'player' ? 'opponent' : 'player';

    pushEvent({
      round,
      type: 'initiative',
      actorId: firstSide === 'player' ? player.id : opponent.id,
      targetId: secondSide === 'player' ? player.id : opponent.id,
      damage: 0,
      message: `${firstSide === 'player' ? player.name : opponent.name} toma a iniciativa no round ${round}.`,
    });

    for (const side of [firstSide, secondSide] as const) {
      if (playerHp <= 0 || opponentHp <= 0) break;
      const action = side === 'player' ? playerAction : opponentAction;

      if (side === 'player') {
        const result = resolveAction({
          action,
          attacker: player,
          defender: opponent,
          rng,
          attackerHp: playerHp,
          defenderHp: opponentHp,
          attackerEnergy: playerEnergy,
          defenderGuard: opponentGuard,
          attackerFocus: playerFocus,
        });
        playerEnergy = result.attackerEnergy;
        playerGuard = result.attackerGuard;
        playerFocus = result.attackerFocus;
        opponentGuard = result.defenderGuard;
        opponentHp = result.defenderHp;
        pushEvent({
          round,
          type: result.type,
          actorId: player.id,
          targetId: result.targeted ? opponent.id : null,
          action,
          damage: result.damage,
          message: result.message,
        });
      } else {
        const result = resolveAction({
          action,
          attacker: opponent,
          defender: player,
          rng,
          attackerHp: opponentHp,
          defenderHp: playerHp,
          attackerEnergy: opponentEnergy,
          defenderGuard: playerGuard,
          attackerFocus: opponentFocus,
        });
        opponentEnergy = result.attackerEnergy;
        opponentGuard = result.attackerGuard;
        opponentFocus = result.attackerFocus;
        playerGuard = result.defenderGuard;
        playerHp = result.defenderHp;
        pushEvent({
          round,
          type: result.type,
          actorId: opponent.id,
          targetId: result.targeted ? player.id : null,
          action,
          damage: result.damage,
          message: result.message,
        });
      }
    }
  }

  const winnerId = decideWinner(player, opponent, playerHp, opponentHp);
  const outcome = winnerId === player.id ? 'win' : winnerId === opponent.id ? 'loss' : 'draw';

  pushEvent({
    round: rounds,
    type: 'finish',
    actorId: winnerId,
    targetId: null,
    damage: 0,
    message:
      outcome === 'draw'
        ? 'A simulação termina empatada por equilíbrio total.'
        : `${winnerId === player.id ? player.name : opponent.name} vence a simulação.`,
  });

  return {
    id: `battle-${hashString(`${seed}:${opponentId}`).toString(36)}`,
    opponentId,
    seed,
    playedAt: playedAt ?? new Date().toISOString(),
    player,
    opponent,
    winnerId,
    outcome,
    rounds,
    events,
    finalHp: {
      player: playerHp,
      opponent: opponentHp,
    },
    finalEnergy: {
      player: playerEnergy,
      opponent: opponentEnergy,
    },
  };
}

interface ChooseActionInput {
  fighter: BattleFighter;
  hp: number;
  energy: number;
  plan?: BattleAction[];
  round: number;
  rng: () => number;
}

function chooseAction({ fighter, hp, energy, plan, round, rng }: ChooseActionInput): BattleAction {
  const planned = plan?.[round - 1];
  if (planned) return planned;

  const hpPct = hp / fighter.stats.hp;
  if (hpPct < 0.34 && rng() < 0.42) return 'defend';
  if (energy < SPECIAL_COST && rng() < 0.28 + fighter.stats.focus / 260) return 'focus';
  return 'attack';
}

interface ActionResolutionInput {
  action: BattleAction;
  attacker: BattleFighter;
  defender: BattleFighter;
  rng: () => number;
  attackerHp: number;
  defenderHp: number;
  attackerEnergy: number;
  defenderGuard: number;
  attackerFocus: number;
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
    return {
      type: 'defend',
      damage: 0,
      targeted: false,
      attackerEnergy: clampEnergy(attackerEnergy + 8),
      attackerGuard: Math.min(0.62, 0.36 + attacker.stats.defense / 260),
      defenderGuard,
      attackerFocus,
      defenderHp,
      message: `${attacker.name} assume postura defensiva e prepara o próximo impacto.`,
    };
  }

  if (action === 'focus') {
    return {
      type: 'focus',
      damage: 0,
      targeted: false,
      attackerEnergy: clampEnergy(attackerEnergy + 14),
      attackerGuard: 0,
      defenderGuard,
      attackerFocus: Math.min(3, attackerFocus + 1),
      defenderHp,
      message: `${attacker.name} foca a energia e aumenta a chance de um golpe decisivo.`,
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
  let damage = Math.max(3, attacker.stats.attack * variance * focusMultiplier - defender.stats.defense * 0.5);
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

  if (special) {
    return {
      type: 'special',
      damage: roundedDamage,
      energySpent: SPECIAL_COST,
      message: `${attacker.name} converte energia em um especial e causa ${roundedDamage} de dano.`,
    };
  }

  if (critical) {
    return {
      type: 'critical',
      damage: roundedDamage,
      energySpent: 0,
      message: `${attacker.name} acerta um crítico de ${roundedDamage} de dano.`,
    };
  }

  if (guardReduction > 0 || randomBlock) {
    return {
      type: 'block',
      damage: roundedDamage,
      energySpent: 0,
      message: `${defender.name} reduz o impacto e recebe ${roundedDamage} de dano.`,
    };
  }

  return {
    type: 'attack',
    damage: roundedDamage,
    energySpent: 0,
    message: `${attacker.name} ataca e causa ${roundedDamage} de dano.`,
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
  opponentHp: number
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

function clampEnergy(value: number) {
  return clampInt(value, 0, MAX_ENERGY);
}

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function createSeededRandom(seed: string) {
  let state = hashString(seed);
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
