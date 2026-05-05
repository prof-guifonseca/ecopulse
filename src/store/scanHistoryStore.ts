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
  /** Stable id (barcode for real scans, generated for demo seeds). */
  id: string;
  /** Source of the lookup so the UI can label and badge it. */
  source: 'camera' | 'demo';
  /** Barcode string when scanned via camera; null for demo entries. */
  barcode: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  score: Score;
  breakdown: ScoreBreakdown;
  tip: string;
  /** Plain-language signals that drove the score. */
  rationale: string[];
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
