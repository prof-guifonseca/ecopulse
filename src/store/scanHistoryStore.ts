'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafeJSONStorage } from './storage';
import type { Score } from '@/types';
import type { ScoreBreakdown } from '@/lib/scoring';

/**
 * One persisted scan. Compact on purpose — we store the *result* (score + a
 * minimal product card), not the raw OFF payload. Up to MAX_HISTORY most
 * recent entries; older ones drop off the tail.
 */
export interface ScanRecord {
  /** Stable id from the lookup/cache record. */
  id: string;
  /** Source of the entry so the UI can label and badge it. */
  source: 'barcode' | 'manual' | 'provider' | 'cache' | 'demo' | 'simulator' | 'seed';
  /** Barcode string used to look the product up in Open Food Facts/cache. */
  barcode: string;
  /** Product id from the real product catalog or lookup result. */
  productId: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  /** Optional Unsplash photo key from src/lib/unsplash.ts. */
  photoKey?: string;
  score: Score;
  breakdown: ScoreBreakdown;
  tip: string;
  /** Plain-language signals that drove the score. */
  rationale: string[];
  confidence?: number;
  sourceName?: string;
  sourceUrl?: string;
  lastFetchedAt?: string;
  evidence?: {
    packagingTags: string[];
    countriesTags: string[];
    novaGroup: 1 | 2 | 3 | 4 | null;
    ecoscoreGrade: string | null;
    image: boolean;
    fields: string[];
  };
  /** ISO timestamp. */
  scannedAt: string;
}

const MAX_HISTORY = 50;

interface ScanHistoryState {
  history: ScanRecord[];
  /** Push a new scan to the top, dedupe by id, cap at MAX_HISTORY. */
  recordScan: (record: ScanRecord) => void;
  /** Remove a single scan (rarely useful in prototype, but good hygiene). */
  removeScan: (id: string) => void;
  /** Wipe everything — surfaced via a settings/debug control later. */
  clearHistory: () => void;
}

export const useScanHistoryStore = create<ScanHistoryState>()(
  persist(
    (set) => ({
      history: [],

      recordScan: (record) =>
        set((s) => {
          const without = s.history.filter((x) => x.id !== record.id);
          const next = [record, ...without].slice(0, MAX_HISTORY);
          return { history: next };
        }),

      removeScan: (id) => set((s) => ({ history: s.history.filter((x) => x.id !== id) })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'ecopulse:scanHistory',
      version: 1,
      storage: createSafeJSONStorage<ScanHistoryState>(),
    }
  )
);

if (typeof window !== 'undefined') {
  useScanHistoryStore.persist.setOptions({
    storage: createSafeJSONStorage<ScanHistoryState>(),
  });
}
