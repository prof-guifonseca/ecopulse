import { describe, expect, it } from 'vitest';
import type { ScanRecord } from '@/store/scanHistoryStore';
import {
  ECO_MULTIPLIER,
  multiplierForScore,
  selectEcoQualityIndex,
  tokensFromScan,
} from './ecoMultiplier';

const rec = (score: ScanRecord['score'], i = 0): ScanRecord => ({
  id: `r${i}`,
  source: 'simulator',
  barcode: '0',
  productId: 'p',
  name: 'x',
  brand: 'y',
  category: 'z',
  emoji: '🍃',
  score,
  breakdown: { carbono: 0, embalagem: 0, reciclabilidade: 0, origem: 0 },
  tip: '',
  rationale: [],
  scannedAt: new Date(2026, 4, 6).toISOString(),
});

describe('ECO_MULTIPLIER', () => {
  it('reflects A=1.5, B=1.2, C=1.0, D=0.6, E=0.6', () => {
    expect(ECO_MULTIPLIER.A).toBe(1.5);
    expect(ECO_MULTIPLIER.B).toBe(1.2);
    expect(ECO_MULTIPLIER.C).toBe(1.0);
    expect(ECO_MULTIPLIER.D).toBe(0.6);
    expect(ECO_MULTIPLIER.E).toBe(0.6);
  });
});

describe('multiplierForScore', () => {
  it('returns the table value for known scores', () => {
    expect(multiplierForScore('A')).toBe(1.5);
    expect(multiplierForScore('E')).toBe(0.6);
  });
});

describe('tokensFromScan', () => {
  it('multiplies and rounds for A scan with no doctrines', () => {
    expect(tokensFromScan(10, 'A')).toBe(15);
    expect(tokensFromScan(10, 'B')).toBe(12);
    expect(tokensFromScan(10, 'C')).toBe(10);
    expect(tokensFromScan(10, 'D')).toBe(6);
    expect(tokensFromScan(10, 'E')).toBe(6);
  });

  it('applies sol-firme doctrine inside 8-16h window', () => {
    const tokens = tokensFromScan(10, 'A', {
      doctrines: ['nami-solar:sol-firme'],
      hour: 12,
    });
    // (10 + 1) * 1.5 = 16.5 → 17
    expect(tokens).toBe(17);
  });

  it('does not apply sol-firme outside the window', () => {
    expect(
      tokensFromScan(10, 'A', { doctrines: ['nami-solar:sol-firme'], hour: 20 })
    ).toBe(15);
  });

  it('applies ritmo doctrine when streak > 7', () => {
    expect(tokensFromScan(10, 'C', { doctrines: ['mestra-ginga:ritmo'], streak: 8, hour: 0 })).toBe(11);
    expect(tokensFromScan(10, 'C', { doctrines: ['mestra-ginga:ritmo'], streak: 7, hour: 0 })).toBe(10);
  });
});

describe('selectEcoQualityIndex', () => {
  it('returns neutral C when history empty', () => {
    expect(selectEcoQualityIndex([])).toEqual({ letter: 'C', numeric: 60, samples: 0 });
  });

  it('returns letter C while samples < 5 (neutral early-game)', () => {
    const h = [rec('A', 1), rec('A', 2), rec('A', 3)];
    const idx = selectEcoQualityIndex(h);
    expect(idx.samples).toBe(3);
    expect(idx.letter).toBe('C');
    expect(idx.numeric).toBeGreaterThan(80);
  });

  it('returns A when 5+ samples average ≥ 80', () => {
    const h = [rec('A', 1), rec('A', 2), rec('A', 3), rec('A', 4), rec('A', 5)];
    expect(selectEcoQualityIndex(h).letter).toBe('A');
  });

  it('returns D when 5+ samples average ~ 45', () => {
    const h = [rec('D', 1), rec('D', 2), rec('D', 3), rec('D', 4), rec('D', 5)];
    expect(selectEcoQualityIndex(h).letter).toBe('D');
  });
});
