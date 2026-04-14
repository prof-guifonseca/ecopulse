export type GardenStage = 'sprout' | 'shrub' | 'tree';

export function gardenStage(level: number): GardenStage {
  if (level >= 8) return 'tree';
  if (level >= 4) return 'shrub';
  return 'sprout';
}

export const GARDEN_EMOJI: Record<GardenStage, string> = {
  sprout: '🌱',
  shrub: '🌿',
  tree: '🌳',
};

export const GARDEN_LABEL: Record<GardenStage, string> = {
  sprout: 'Broto',
  shrub: 'Arbusto',
  tree: 'Árvore',
};
