import type { OffProduct } from './openfoodfacts';
import type { Score } from '@/types';

/**
 * Single source of truth for how an OFF product becomes an A–E EcoPulse score.
 *
 * Approach: start from OFF's own ecoscore_grade if present (it's the most
 * researched signal). When absent, fall back to a small heuristic anchored on
 * NOVA group + packaging-recyclability proxies. This intentionally avoids
 * inventing precision OFF doesn't claim — locked confidence beats false detail.
 */

export interface ScoreBreakdown {
  /** 0–100. Higher is better for sustainability. */
  carbono: number;
  embalagem: number;
  reciclabilidade: number;
  origem: number;
}

export interface ScoreResult {
  score: Score;
  breakdown: ScoreBreakdown;
  /** Plain-language sentence the UI can show to the user. */
  tip: string;
  /** Which signals actually influenced the score; useful for "Como calculamos". */
  rationale: string[];
}

const ECOSCORE_TO_LETTER: Record<NonNullable<OffProduct['ecoscoreGrade']>, Score> = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
  E: 'E',
};

/** Recyclability proxy from packaging tags: heavier on glass/cardboard, lighter on mixed plastic. */
function recyclabilityFromPackaging(tags: string[]): number {
  if (tags.length === 0) return 50;
  const joined = tags.join(' ').toLowerCase();
  if (/glass|carton|paper|cardboard|metal|aluminium|aluminum/.test(joined)) return 80;
  if (/pet|recyclable/.test(joined)) return 65;
  if (/multilayer|composite|tetra|mixed/.test(joined)) return 35;
  if (/plastic/.test(joined)) return 50;
  return 50;
}

/** Crude origin proxy: BR origin keeps emissions lower vs imported chains. */
function originScore(off: OffProduct): number {
  const isBrazil =
    off.countries.some((c) => c.endsWith(':brazil')) ||
    /brasil|brazil/i.test(off.origins ?? '') ||
    /brasil|brazil/i.test(off.manufacturingPlaces ?? '');
  if (isBrazil) return 75;
  if (off.origins) return 55;
  return 45;
}

/** Carbon proxy: NOVA + ecoscoreScore when available. */
function carbonScore(off: OffProduct): number {
  if (off.ecoscoreScore !== null) {
    return Math.max(0, Math.min(100, off.ecoscoreScore));
  }
  if (off.novaGroup) {
    // NOVA 1 (whole foods) → high; NOVA 4 (ultra-processed) → low.
    return [88, 70, 50, 28][off.novaGroup - 1];
  }
  return 50;
}

function packagingScore(off: OffProduct): number {
  const tags = off.packagingTags;
  if (tags.some((t) => /glass|carton|paper|cardboard/i.test(t))) return 80;
  if (tags.some((t) => /multilayer|composite|tetra|mixed/i.test(t))) return 30;
  if (tags.some((t) => /plastic/i.test(t))) return 50;
  if (off.packaging) return 55;
  return 45;
}

/** Map an averaged 0–100 to a letter grade. */
function letterFromAverage(avg: number): Score {
  if (avg >= 80) return 'A';
  if (avg >= 65) return 'B';
  if (avg >= 50) return 'C';
  if (avg >= 35) return 'D';
  return 'E';
}

export function scoreFromOff(off: OffProduct): ScoreResult {
  const breakdown: ScoreBreakdown = {
    carbono: Math.round(carbonScore(off)),
    embalagem: Math.round(packagingScore(off)),
    reciclabilidade: Math.round(recyclabilityFromPackaging(off.packagingTags)),
    origem: Math.round(originScore(off)),
  };
  const avg =
    (breakdown.carbono + breakdown.embalagem + breakdown.reciclabilidade + breakdown.origem) / 4;

  // If OFF has an explicit ecoscore grade, trust it as the headline letter.
  const score: Score = off.ecoscoreGrade
    ? ECOSCORE_TO_LETTER[off.ecoscoreGrade]
    : letterFromAverage(avg);

  const rationale: string[] = [];
  if (off.ecoscoreGrade) rationale.push(`Open Food Facts Eco-Score: ${off.ecoscoreGrade}`);
  if (off.novaGroup) rationale.push(`Grupo NOVA: ${off.novaGroup}`);
  if (off.packaging || off.packagingTags.length > 0) rationale.push('Embalagem identificada');
  if (off.origins || off.countries.length > 0) rationale.push('Origem identificada');
  if (rationale.length === 0) rationale.push('Dados parciais — score estimado.');

  const tip = buildTip(score, off);

  return { score, breakdown, tip, rationale };
}

function buildTip(score: Score, off: OffProduct): string {
  if (score === 'A' || score === 'B') {
    if (off.ecoscoreGrade) return 'Boa pegada ambiental segundo Open Food Facts.';
    return 'Sinais positivos: embalagem ou origem favoráveis.';
  }
  if (score === 'C') return 'Médio. Verifique alternativas com embalagem mais simples.';
  if (score === 'D') return 'Pegada alta. Considere uma alternativa mais sustentável.';
  return 'Pegada muito alta. Vale buscar uma opção menos impactante.';
}
