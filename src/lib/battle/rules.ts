import type {
  ArenaOpponent,
  AvatarOutfit,
  AvatarOutfits,
  BattleEvent,
  BattleFighter,
  BattleResult,
  BattleStats,
  SkinPack,
} from '@/types';

const MAX_ROUNDS = 8;

export const BATTLE_STAT_LABELS: Record<keyof BattleStats, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  speed: 'Veloc.',
  focus: 'Foco',
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
  skinPackId: string | null;
  avatarOutfits: AvatarOutfits;
  skinPacks: SkinPack[];
  outfits: AvatarOutfit[];
}

export function derivePlayerStats(input: PlayerStatsInput): BattleStats {
  let stats = baseStatsForLevel(input.level);

  if (input.skinPackId) {
    const skin = input.skinPacks.find((item) => item.id === input.skinPackId);
    return clampStats(addBattleStats(stats, skin?.battleStats));
  }

  const outfitById = new Map(input.outfits.map((item) => [item.id, item]));
  for (const id of Object.values(input.avatarOutfits)) {
    if (!id) continue;
    stats = addBattleStats(stats, outfitById.get(id)?.battleStats);
  }

  return clampStats(stats);
}

export interface PlayerFighterInput extends PlayerStatsInput {
  id?: string;
  name: string;
  title: string;
  avatarBase: string | null;
}

export function createPlayerFighter(input: PlayerFighterInput): BattleFighter {
  return {
    id: input.id ?? 'player',
    name: input.name,
    title: input.title,
    level: Math.max(1, Math.floor(input.level)),
    stats: derivePlayerStats(input),
    skinPackId: input.skinPackId,
    avatarBase: input.avatarBase,
    avatarOutfits: input.avatarOutfits,
  };
}

export function opponentToFighter(opponent: ArenaOpponent): BattleFighter {
  return {
    id: opponent.id,
    name: opponent.name,
    title: opponent.title,
    level: opponent.difficulty,
    stats: opponent.stats,
    skinPackId: opponent.skinPackId,
    avatarBase: null,
    avatarOutfits: {},
  };
}

export interface SimulateBattleInput {
  player: BattleFighter;
  opponent: BattleFighter;
  opponentId: string;
  seed: string;
  playedAt?: string;
}

export function simulateBattle({
  player,
  opponent,
  opponentId,
  seed,
  playedAt,
}: SimulateBattleInput): BattleResult {
  const rng = createSeededRandom(seed);
  const events: BattleEvent[] = [];
  let playerHp = player.stats.hp;
  let opponentHp = opponent.stats.hp;
  let eventCount = 0;
  let rounds = 0;

  const pushEvent = (event: Omit<BattleEvent, 'id' | 'playerHp' | 'opponentHp'>) => {
    eventCount += 1;
    events.push({
      ...event,
      id: `${event.round}-${event.type}-${eventCount}`,
      playerHp,
      opponentHp,
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

    const playerInitiative = initiativeScore(player, rng);
    const opponentInitiative = initiativeScore(opponent, rng);
    const first = playerInitiative >= opponentInitiative ? player : opponent;
    const second = first.id === player.id ? opponent : player;

    pushEvent({
      round,
      type: 'initiative',
      actorId: first.id,
      targetId: second.id,
      damage: 0,
      message: `${first.name} toma a iniciativa no round ${round}.`,
    });

    for (const attacker of [first, second]) {
      if (playerHp <= 0 || opponentHp <= 0) break;
      const defender = attacker.id === player.id ? opponent : player;
      const outcome = attackOutcome(attacker, defender, rng);

      if (defender.id === player.id) {
        playerHp = Math.max(0, playerHp - outcome.damage);
      } else {
        opponentHp = Math.max(0, opponentHp - outcome.damage);
      }

      pushEvent({
        round,
        type: outcome.type,
        actorId: attacker.id,
        targetId: defender.id,
        damage: outcome.damage,
        message: outcome.message,
      });
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
  };
}

interface AttackOutcome {
  type: BattleEvent['type'];
  damage: number;
  message: string;
}

function attackOutcome(
  attacker: BattleFighter,
  defender: BattleFighter,
  rng: () => number
): AttackOutcome {
  const variance = 0.82 + rng() * 0.36;
  let damage = Math.max(3, attacker.stats.attack * variance - defender.stats.defense * 0.5);
  const special = rng() < Math.min(0.24, 0.07 + attacker.stats.focus / 180);
  const critical = !special && rng() < Math.min(0.26, 0.06 + attacker.stats.focus / 210);
  const block = !special && rng() < Math.min(0.28, 0.05 + defender.stats.defense / 150);

  if (special) {
    damage = damage * 1.35 + attacker.stats.focus * 0.35;
  } else if (critical) {
    damage *= 1.55;
  }

  if (block) {
    damage *= 0.58;
  }

  const roundedDamage = Math.max(1, Math.round(damage));

  if (special) {
    return {
      type: 'special',
      damage: roundedDamage,
      message: `${attacker.name} usa um golpe especial e causa ${roundedDamage} de dano.`,
    };
  }

  if (critical) {
    return {
      type: 'critical',
      damage: roundedDamage,
      message: `${attacker.name} acerta um crítico de ${roundedDamage} de dano.`,
    };
  }

  if (block) {
    return {
      type: 'block',
      damage: roundedDamage,
      message: `${defender.name} defende parte do impacto e recebe ${roundedDamage} de dano.`,
    };
  }

  return {
    type: 'attack',
    damage: roundedDamage,
    message: `${attacker.name} ataca e causa ${roundedDamage} de dano.`,
  };
}

function initiativeScore(fighter: BattleFighter, rng: () => number) {
  return fighter.stats.speed + fighter.stats.focus * 0.15 + rng() * 8;
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

function clampStats(stats: BattleStats): BattleStats {
  return {
    hp: clampInt(stats.hp, 1, 999),
    attack: clampInt(stats.attack, 1, 99),
    defense: clampInt(stats.defense, 0, 99),
    speed: clampInt(stats.speed, 1, 99),
    focus: clampInt(stats.focus, 1, 99),
  };
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
