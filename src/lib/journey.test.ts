import { describe, expect, it } from 'vitest';
import {
  CHAPTERS,
  chapterProgress,
  currentChapter,
  evaluateGates,
  justUnlockedChapter,
  type JourneySnapshot,
} from './journey';

const baseline = (): JourneySnapshot => ({
  level: 1,
  scans: 0,
  ecoIndex: 'C',
  visitedPointIds: [],
  defeatedRivals: 0,
});

describe('CHAPTERS', () => {
  it('contains 5 chapters in order', () => {
    expect(CHAPTERS.map((c) => c.id)).toEqual([
      'semente',
      'broto',
      'arbusto',
      'arvore',
      'floresta',
    ]);
  });
});

describe('currentChapter', () => {
  it('returns semente for empty snapshot', () => {
    expect(currentChapter(baseline()).id).toBe('semente');
  });

  it('advances to broto with 5 scans + level 2', () => {
    expect(currentChapter({ ...baseline(), level: 2, scans: 5 }).id).toBe('broto');
  });

  it('advances to arbusto with granel visit at level 4', () => {
    expect(
      currentChapter({
        ...baseline(),
        level: 4,
        scans: 15,
        visitedPointIds: ['ldb-granel-empório'],
      }).id
    ).toBe('arbusto');
  });

  it('does not advance to arvore without rivals defeated', () => {
    const snap: JourneySnapshot = {
      level: 8,
      scans: 30,
      ecoIndex: 'B',
      visitedPointIds: ['ldb-bat-centro', 'ldb-rep-centro', 'ldb-granel-empório'],
      defeatedRivals: 0,
    };
    expect(currentChapter(snap).id).not.toBe('arvore');
  });

  it('advances to arvore when all gates met', () => {
    const snap: JourneySnapshot = {
      level: 8,
      scans: 30,
      ecoIndex: 'B',
      visitedPointIds: ['ldb-bat-centro', 'ldb-rep-centro', 'ldb-granel-empório'],
      defeatedRivals: 3,
    };
    expect(currentChapter(snap).id).toBe('arvore');
  });
});

describe('evaluateGates', () => {
  it('reports missing scans with current/target', () => {
    const misses = evaluateGates(baseline(), { minScans: 5 });
    const m = misses.find((x) => x.key === 'scans');
    expect(m).toBeTruthy();
    expect(m?.current).toBe(0);
    expect(m?.target).toBe(5);
  });

  it('reports per-type visit gaps in plain language', () => {
    const misses = evaluateGates(baseline(), {
      minVisitsByType: { reparo: 1 },
    });
    expect(misses.find((m) => m.key === 'visit:reparo')?.message).toMatch(/Reparo/);
  });

  it('returns empty when all gates pass', () => {
    expect(
      evaluateGates({ level: 5, scans: 10, ecoIndex: 'A', visitedPointIds: [], defeatedRivals: 0 }, {
        minLevel: 4,
        minScans: 5,
      })
    ).toEqual([]);
  });
});

describe('chapterProgress', () => {
  it('returns next as broto from semente', () => {
    const p = chapterProgress(baseline());
    expect(p.current.id).toBe('semente');
    expect(p.next?.id).toBe('broto');
    expect(p.pct).toBeGreaterThanOrEqual(0);
    expect(p.pct).toBeLessThanOrEqual(1);
  });

  it('returns null next when at floresta', () => {
    const snap: JourneySnapshot = {
      level: 12,
      scans: 60,
      ecoIndex: 'A',
      visitedPointIds: [
        'ldb-bat-centro',
        'ldb-oleo-centro',
        'ldb-rep-centro',
        'ldb-troca-centro',
        'ldb-granel-empório',
      ],
      defeatedRivals: 5,
    };
    expect(chapterProgress(snap).next).toBeNull();
  });
});

describe('justUnlockedChapter', () => {
  it('returns null when chapter unchanged', () => {
    expect(justUnlockedChapter(baseline(), baseline())).toBeNull();
  });

  it('returns the new chapter id on advance', () => {
    const prev = baseline();
    const curr = { ...baseline(), level: 2, scans: 5 };
    expect(justUnlockedChapter(prev, curr)).toBe('broto');
  });
});
