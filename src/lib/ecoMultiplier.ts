import type { Score } from '@/types';
import type { ScanRecord } from '@/store/scanHistoryStore';

/**
 * Eco-quality multiplier on Eco-Tokens earned per scan. Higher grades reward
 * more; lower grades reward less but never zero — the copy in the UI frames
 * D/E as "alternativa A no mapa?" rather than punishment.
 */
export const ECO_MULTIPLIER: Record<Score, number> = {
  A: 1.5,
  B: 1.2,
  C: 1.0,
  D: 0.6,
  E: 0.6,
} as const;

const SCORE_NUMERIC: Record<Score, number> = { A: 90, B: 75, C: 60, D: 45, E: 30 };
const NUMERIC_TO_LETTER = (n: number): Score => {
  if (n >= 80) return 'A';
  if (n >= 65) return 'B';
  if (n >= 50) return 'C';
  if (n >= 35) return 'D';
  return 'E';
};

/**
 * Returns the multiplier for a given score, plus an additive bonus from
 * adopted doctrines that affect token base.
 */
export function multiplierForScore(score: Score): number {
  return ECO_MULTIPLIER[score] ?? 1.0;
}

/**
 * Pure function: how many tokens to award for a scan of `score`, given a
 * `base` (typically 10) and the user's currently adopted doctrines. Doctrines
 * add a small flat bonus to the base before the multiplier is applied.
 *
 *   - 'nami-solar:sol-firme' → +1 base when local hour is 8-16 (caller passes `hour`)
 *   - 'mestra-ginga:ritmo'   → +1 base when streak > 7 (caller passes `streak`)
 *
 * Other doctrines apply elsewhere (cooperative challenges, real-impact
 * counters, virtual scans) and don't touch this function.
 */
export interface TokensFromScanContext {
  doctrines?: string[];
  /** Local hour (0-23). Defaults to current hour when omitted. */
  hour?: number;
  /** Current streak length. Used by 'ritmo' doctrine. */
  streak?: number;
}

export function tokensFromScan(
  base: number,
  score: Score,
  ctx: TokensFromScanContext = {},
): number {
  const { doctrines = [], hour = new Date().getHours(), streak = 0 } = ctx;
  let effectiveBase = base;
  if (doctrines.includes('nami-solar:sol-firme') && hour >= 8 && hour < 16) {
    effectiveBase += 1;
  }
  if (doctrines.includes('mestra-ginga:ritmo') && streak > 7) {
    effectiveBase += 1;
  }
  return Math.round(effectiveBase * multiplierForScore(score));
}

export interface EcoQualityIndex {
  letter: Score;
  numeric: number;
  samples: number;
}

/**
 * Rolling average of the last `n` scans. Letter and numeric value reflect
 * eco-quality across the player's recent activity. With fewer than 5 samples
 * we return a neutral 'C' so early-game players aren't penalized in chapter
 * gates; the underlying numeric still reflects whatever data exists.
 */
export function selectEcoQualityIndex(history: ScanRecord[], n = 10): EcoQualityIndex {
  const recent = history.slice(0, n);
  const samples = recent.length;
  if (samples === 0) {
    return { letter: 'C', numeric: 60, samples: 0 };
  }
  const avg = recent.reduce((sum, r) => sum + (SCORE_NUMERIC[r.score] ?? 60), 0) / samples;
  const letter = samples < 5 ? 'C' : NUMERIC_TO_LETTER(avg);
  return { letter, numeric: Math.round(avg), samples };
}
