import type { AvatarLoadout } from '@/types';
import { GEAR_ITEMS } from '@/data';
import { getTribe, type TribeId } from '@/data/tribes';

const ALIGNED_PIECES_THRESHOLD = 2;
const ALIGNED_MULTIPLIER = 1.25;

export interface LoadoutAffinity {
  /** XP multiplier to pass into applyArenaBattleProgress. */
  multiplier: number;
  /** Whether the loadout has reached the alignment threshold. */
  aligned: boolean;
  /** How many equipped pieces belong to one of the tribe's preferred sets. */
  alignedPieces: number;
  /** Tribe id used for the calculation (echoed for UI labels). */
  tribeId: TribeId;
}

/**
 * Computes whether the player's currently equipped gear earns the tribe
 * "loadout alinhado" XP bonus (+25%). Threshold is 2 pieces from any of the
 * tribe's preferred gear sets.
 */
export function computeLoadoutAffinity(
  loadout: AvatarLoadout | null | undefined,
  tribeId: string | null | undefined,
): LoadoutAffinity {
  const tribe = getTribe(tribeId);
  let alignedPieces = 0;
  if (loadout?.equippedGear) {
    for (const itemId of Object.values(loadout.equippedGear)) {
      if (!itemId) continue;
      const item = GEAR_ITEMS.find((g) => g.id === itemId);
      if (!item || !item.setId) continue;
      if (tribe.gearSetIds.includes(item.setId)) alignedPieces += 1;
    }
  }
  const aligned = alignedPieces >= ALIGNED_PIECES_THRESHOLD;
  return {
    multiplier: aligned ? ALIGNED_MULTIPLIER : 1,
    aligned,
    alignedPieces,
    tribeId: tribe.id,
  };
}
