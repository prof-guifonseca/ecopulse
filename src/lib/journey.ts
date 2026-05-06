import { MAP_POINTS } from '@/data';
import type { MapPointType, Score } from '@/types';
import type { GardenStage } from './garden';

export type ChapterId = 'semente' | 'broto' | 'arbusto' | 'arvore' | 'floresta';

export interface ChapterGates {
  minLevel?: number;
  minScans?: number;
  /** Letter threshold (≥ this letter on the eco-quality index). */
  minEcoIndex?: Score;
  /** Per-category visited-point requirements. */
  minVisitsByType?: Partial<Record<MapPointType, number>>;
  /** Number of distinct arena rivals defeated. */
  minDefeatedRivals?: number;
}

export interface ChapterDef {
  id: ChapterId;
  label: string;
  /** Single-line copy used in the unlock overlay and chapter pill. */
  blurb: string;
  /** Garden stage this chapter unlocks. */
  gardenStage: GardenStage;
  gates: ChapterGates;
  /** Optional opponent id to highlight as the next narrative target. */
  spotlightRivalId?: string;
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: 'semente',
    label: 'Semente',
    blurb: 'O começo. Tudo cabe num gesto.',
    gardenStage: 'sprout',
    gates: {},
  },
  {
    id: 'broto',
    label: 'Broto',
    blurb: 'Primeiros hábitos firmando raiz.',
    gardenStage: 'sprout',
    gates: { minLevel: 2, minScans: 5, minEcoIndex: 'C' },
    spotlightRivalId: 'nami-solar',
  },
  {
    id: 'arbusto',
    label: 'Arbusto',
    blurb: 'Rotina diversificada — você já sai e age.',
    gardenStage: 'shrub',
    gates: {
      minLevel: 4,
      minScans: 15,
      minEcoIndex: 'C',
      minVisitsByType: { granel: 1 },
    },
    spotlightRivalId: 'tiao-reuso',
  },
  {
    id: 'arvore',
    label: 'Árvore',
    blurb: 'Maturidade. Sua escolha vira referência.',
    gardenStage: 'tree',
    gates: {
      minLevel: 8,
      minScans: 30,
      minEcoIndex: 'B',
      minVisitsByType: { baterias: 1, reparo: 1 },
      minDefeatedRivals: 3,
    },
    spotlightRivalId: 'mestra-ginga',
  },
  {
    id: 'floresta',
    label: 'Floresta',
    blurb: 'Você é parte do todo. Plantar agora é ritual.',
    gardenStage: 'tree',
    gates: {
      minLevel: 12,
      minScans: 60,
      minEcoIndex: 'B',
      minVisitsByType: { baterias: 1, oleo: 1, reparo: 1, trocas: 1, granel: 1 },
      minDefeatedRivals: 5,
    },
    spotlightRivalId: 'raiz-antiga',
  },
];

export interface JourneySnapshot {
  level: number;
  scans: number;
  ecoIndex: Score;
  visitedPointIds: string[];
  defeatedRivals: number;
}

const SCORE_RANK: Record<Score, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

function meetsLetter(actual: Score, required: Score): boolean {
  return SCORE_RANK[actual] >= SCORE_RANK[required];
}

export interface GateMiss {
  key: string;
  /** Plain-language line: "Faltam 2 scans" / "Visite 1 ponto de Reparo". */
  message: string;
  current: number;
  target: number;
}

function visitsByType(visitedPointIds: string[]): Record<MapPointType, number> {
  const counts: Record<string, number> = {};
  for (const id of visitedPointIds) {
    const point = MAP_POINTS.find((p) => p.id === id);
    if (point) counts[point.type] = (counts[point.type] ?? 0) + 1;
  }
  return counts as Record<MapPointType, number>;
}

const TYPE_LABEL_PT: Record<MapPointType, string> = {
  baterias: 'Baterias',
  eletronicos: 'Eletrônicos',
  oleo: 'Óleo',
  trocas: 'Trocas',
  granel: 'Granel',
  reparo: 'Reparo',
};

export function evaluateGates(snap: JourneySnapshot, gates: ChapterGates): GateMiss[] {
  const misses: GateMiss[] = [];

  if (gates.minLevel !== undefined && snap.level < gates.minLevel) {
    misses.push({
      key: 'level',
      message: `Suba para o nível ${gates.minLevel}`,
      current: snap.level,
      target: gates.minLevel,
    });
  }

  if (gates.minScans !== undefined && snap.scans < gates.minScans) {
    misses.push({
      key: 'scans',
      message: `Faça ${gates.minScans} scans`,
      current: snap.scans,
      target: gates.minScans,
    });
  }

  if (gates.minEcoIndex !== undefined && !meetsLetter(snap.ecoIndex, gates.minEcoIndex)) {
    misses.push({
      key: 'ecoIndex',
      message: `Mantenha média ${gates.minEcoIndex} ou melhor`,
      current: SCORE_RANK[snap.ecoIndex],
      target: SCORE_RANK[gates.minEcoIndex],
    });
  }

  if (gates.minVisitsByType) {
    const counts = visitsByType(snap.visitedPointIds);
    for (const [type, target] of Object.entries(gates.minVisitsByType) as Array<
      [MapPointType, number]
    >) {
      const current = counts[type] ?? 0;
      if (current < target) {
        misses.push({
          key: `visit:${type}`,
          message: `Visite ${target - current} ponto${target - current > 1 ? 's' : ''} de ${
            TYPE_LABEL_PT[type]
          }`,
          current,
          target,
        });
      }
    }
  }

  if (gates.minDefeatedRivals !== undefined && snap.defeatedRivals < gates.minDefeatedRivals) {
    misses.push({
      key: 'rivals',
      message: `Vença ${gates.minDefeatedRivals} rivais`,
      current: snap.defeatedRivals,
      target: gates.minDefeatedRivals,
    });
  }

  return misses;
}

/**
 * Returns the most advanced chapter whose gates are satisfied. Always
 * returns at least 'semente'.
 */
export function currentChapter(snap: JourneySnapshot): ChapterDef {
  let best: ChapterDef = CHAPTERS[0];
  for (const chapter of CHAPTERS) {
    if (evaluateGates(snap, chapter.gates).length === 0) best = chapter;
  }
  return best;
}

export interface ChapterProgress {
  current: ChapterDef;
  next: ChapterDef | null;
  /** 0..1 progress toward `next`. 1 when no `next` exists. */
  pct: number;
  missing: GateMiss[];
}

export function chapterProgress(snap: JourneySnapshot): ChapterProgress {
  const current = currentChapter(snap);
  const idx = CHAPTERS.findIndex((c) => c.id === current.id);
  const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;
  if (!next) return { current, next: null, pct: 1, missing: [] };
  const missing = evaluateGates(snap, next.gates);
  const totalGates = countGates(next.gates);
  const remainingGates = missing.length;
  const pct = totalGates === 0 ? 1 : Math.max(0, Math.min(1, 1 - remainingGates / totalGates));
  return { current, next, pct, missing };
}

function countGates(gates: ChapterGates): number {
  let n = 0;
  if (gates.minLevel !== undefined) n += 1;
  if (gates.minScans !== undefined) n += 1;
  if (gates.minEcoIndex !== undefined) n += 1;
  if (gates.minDefeatedRivals !== undefined) n += 1;
  if (gates.minVisitsByType) n += Object.keys(gates.minVisitsByType).length;
  return n;
}

/**
 * Detect a forward chapter transition between two snapshots. Returns the
 * newly unlocked chapter id, or null if there was no advance.
 */
export function justUnlockedChapter(
  prev: JourneySnapshot,
  curr: JourneySnapshot
): ChapterId | null {
  const prevId = currentChapter(prev).id;
  const currId = currentChapter(curr).id;
  if (prevId === currId) return null;
  const prevIdx = CHAPTERS.findIndex((c) => c.id === prevId);
  const currIdx = CHAPTERS.findIndex((c) => c.id === currId);
  return currIdx > prevIdx ? currId : null;
}

export function getChapter(id: ChapterId): ChapterDef {
  return CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0];
}
