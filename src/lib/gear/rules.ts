import type { AvatarLoadout, BattleStats, GearItem, GearSet, GearSlot } from '@/types';

export function ownedAfterGearItemPurchase(ownedGearItems: string[], itemId: string): string[] {
  return unique([...ownedGearItems, itemId]);
}

export function ownedAfterGearSetPurchase(
  ownedGearItems: string[],
  ownedGearSets: string[],
  set: GearSet,
) {
  return {
    ownedGearItems: unique([...ownedGearItems, ...set.itemIds]),
    ownedGearSets: unique([...ownedGearSets, set.id]),
  };
}

export function equipGearItem(loadout: AvatarLoadout, item: GearItem): AvatarLoadout {
  const equippedGear = { ...loadout.equippedGear, [item.slot]: item.id };
  return {
    ...loadout,
    equippedGear,
    activeSetId: null,
  };
}

export function equipGearSet(loadout: AvatarLoadout, set: GearSet): AvatarLoadout {
  return {
    baseId: loadout.baseId,
    equippedGear: { ...loadout.equippedGear, ...set.defaultLoadout },
    activeSetId: set.id,
  };
}

export function isGearSetComplete(
  set: GearSet | undefined,
  loadout: AvatarLoadout,
  itemsById: Map<string, GearItem>,
) {
  if (!set) return false;
  const equippedIds = new Set(Object.values(loadout.equippedGear).filter(Boolean));
  return set.requiredItemIds.every((id) => {
    const item = itemsById.get(id);
    return Boolean(item && equippedIds.has(id));
  });
}

export function deriveStatsFromLoadout({
  baseStats,
  loadout,
  gearItems,
  gearSets,
}: {
  baseStats: BattleStats;
  loadout: AvatarLoadout;
  gearItems: GearItem[];
  gearSets: GearSet[];
}): BattleStats {
  const itemsById = new Map(gearItems.map((item) => [item.id, item]));
  const set = gearSets.find((item) => item.id === loadout.activeSetId);
  let stats = { ...baseStats };

  for (const id of Object.values(loadout.equippedGear)) {
    const item = id ? itemsById.get(id) : undefined;
    if (!item) continue;
    stats = addStats(stats, item.battleStats);
  }

  if (isGearSetComplete(set, loadout, itemsById)) {
    stats = addStats(stats, set?.setBonusStats);
  }

  return clampStats(stats);
}

export function loadoutPowerScore(stats: BattleStats): number {
  return Math.round(
    stats.hp * 0.25 +
      stats.attack * 2 +
      stats.defense * 1.6 +
      stats.speed * 1.5 +
      stats.focus * 1.4,
  );
}

export function equippedGearIds(loadout: AvatarLoadout): string[] {
  return Object.values(loadout.equippedGear).filter(Boolean) as string[];
}

export function clearSlot(loadout: AvatarLoadout, slot: GearSlot): AvatarLoadout {
  return {
    ...loadout,
    equippedGear: { ...loadout.equippedGear, [slot]: null },
    activeSetId: null,
  };
}

function addStats(base: BattleStats, bonus?: Partial<BattleStats>): BattleStats {
  if (!bonus) return base;
  return {
    hp: base.hp + (bonus.hp ?? 0),
    attack: base.attack + (bonus.attack ?? 0),
    defense: base.defense + (bonus.defense ?? 0),
    speed: base.speed + (bonus.speed ?? 0),
    focus: base.focus + (bonus.focus ?? 0),
  };
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

function unique(ids: string[]): string[] {
  return Array.from(new Set(ids));
}
