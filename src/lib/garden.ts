import type { ChapterDef } from './journey';

export type GardenStage = 'sprout' | 'shrub' | 'tree';

/**
 * Resolves the garden stage for the player. The historical signature was
 * level-only; the current narrative spine ("De Broto a Floresta") prefers
 * the chapter-based stage when a chapter is provided. We take whichever is
 * more advanced, so legacy callers and chapter-aware callers never
 * accidentally regress the avatar's plant.
 */
export function gardenStage(level: number, chapter?: ChapterDef | null): GardenStage {
  const fromLevel: GardenStage = level >= 8 ? 'tree' : level >= 4 ? 'shrub' : 'sprout';
  const fromChapter = chapter?.gardenStage ?? null;
  return maxStage(fromLevel, fromChapter);
}

const ORDER: GardenStage[] = ['sprout', 'shrub', 'tree'];

function maxStage(a: GardenStage, b: GardenStage | null): GardenStage {
  if (!b) return a;
  return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
}

export const GARDEN_LABEL: Record<GardenStage, string> = {
  sprout: 'Broto',
  shrub: 'Arbusto',
  tree: 'Árvore',
};
