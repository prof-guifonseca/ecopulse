import type { Score } from '@/types';

/**
 * Pure score derivation. Takes a typed input describing a product's
 * sustainability signals and emits an A–E grade plus a breakdown,
 * a plain-language tip, and a rationale list for "Como calculamos".
 *
 * The simulator (and any future real source) shapes its data into
 * ScoreInput before calling here, so the rules stay in one place.
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
  /** Which signals drove the score; surfaced in the product detail modal. */
  rationale: string[];
}

/**
 * Generic input the rules can derive a score from. The simulator hand-fills
 * this; a future real source would adapt its payload into the same shape.
 */
export interface ScoreInput {
  /** 1–4 (1 minimally processed, 4 ultra-processed); null when unknown. */
  novaGroup: 1 | 2 | 3 | 4 | null;
  /** When the source already gives an A–E, we trust it as the headline. */
  preGradedScore?: Score | null;
  /** Free-form packaging tags ('glass', 'pet', 'multilayer', …). */
  packagingTags: string[];
  /** Country / origin hints used to tilt the origin proxy. */
  isLocal: boolean;
  hasKnownOrigin: boolean;
}

function recyclabilityFromPackaging(tags: string[]): number {
  if (tags.length === 0) return 50;
  const joined = tags.join(' ').toLowerCase();
  if (/glass|carton|paper|cardboard|metal|aluminium|aluminum/.test(joined)) return 80;
  if (/pet|recyclable/.test(joined)) return 65;
  if (/multilayer|composite|tetra|mixed/.test(joined)) return 35;
  if (/plastic/.test(joined)) return 50;
  return 50;
}

function packagingScore(tags: string[]): number {
  if (tags.some((t) => /glass|carton|paper|cardboard/i.test(t))) return 80;
  if (tags.some((t) => /multilayer|composite|tetra|mixed/i.test(t))) return 30;
  if (tags.some((t) => /plastic/i.test(t))) return 50;
  if (tags.length > 0) return 55;
  return 45;
}

function carbonScore(novaGroup: ScoreInput['novaGroup']): number {
  if (novaGroup) {
    // NOVA 1 (whole foods) → high; NOVA 4 (ultra-processed) → low.
    return [88, 70, 50, 28][novaGroup - 1];
  }
  return 50;
}

function originScore({ isLocal, hasKnownOrigin }: ScoreInput): number {
  if (isLocal) return 75;
  if (hasKnownOrigin) return 55;
  return 45;
}

function letterFromAverage(avg: number): Score {
  if (avg >= 80) return 'A';
  if (avg >= 65) return 'B';
  if (avg >= 50) return 'C';
  if (avg >= 35) return 'D';
  return 'E';
}

export function deriveScore(input: ScoreInput): ScoreResult {
  const breakdown: ScoreBreakdown = {
    carbono: Math.round(carbonScore(input.novaGroup)),
    embalagem: Math.round(packagingScore(input.packagingTags)),
    reciclabilidade: Math.round(recyclabilityFromPackaging(input.packagingTags)),
    origem: Math.round(originScore(input)),
  };
  const avg =
    (breakdown.carbono + breakdown.embalagem + breakdown.reciclabilidade + breakdown.origem) / 4;

  const score: Score = input.preGradedScore ?? letterFromAverage(avg);

  const rationale: string[] = [];
  if (input.preGradedScore) rationale.push(`Eco-Score atribuído: ${input.preGradedScore}`);
  if (input.novaGroup) rationale.push(`Grupo NOVA: ${input.novaGroup}`);
  if (input.packagingTags.length > 0) rationale.push('Embalagem identificada');
  if (input.hasKnownOrigin) rationale.push(input.isLocal ? 'Origem nacional' : 'Origem identificada');
  if (rationale.length === 0) rationale.push('Dados parciais — score estimado.');

  return { score, breakdown, tip: buildTip(score), rationale };
}

function buildTip(score: Score): string {
  if (score === 'A') return 'Boa pegada ambiental — escolha consistente.';
  if (score === 'B') return 'Sinais positivos. Pequenas trocas podem te levar para A.';
  if (score === 'C') return 'Médio. Vale verificar alternativas com embalagem mais simples.';
  if (score === 'D') return 'Pegada alta. Considere uma alternativa mais sustentável.';
  return 'Pegada muito alta. Vale buscar uma opção menos impactante.';
}
