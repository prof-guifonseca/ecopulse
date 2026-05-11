'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SimulationConfig, SimulationEvent, SimulationEventPayload, SimulationEventType } from '@/simulation/types';
import { deterministicId } from '@/simulation/rng';
import { createSafeJSONStorage } from './storage';

interface SimulationState {
  config: SimulationConfig | null;
  events: SimulationEvent[];
  cursor: number;

  startSimulation: (config: SimulationConfig) => void;
  setCurrentDay: (day: string) => void;
  nextCursor: () => number;
  recordEvent: (event: { type: SimulationEventType; payload?: SimulationEventPayload; at?: string; day?: string }) => void;
  resetSimulation: () => void;
}

const DEFAULT_SIMULATION = {
  config: null as SimulationConfig | null,
  events: [] as SimulationEvent[],
  cursor: 0,
};

export function migrateSimulationStateToV1(state: Partial<SimulationState> | undefined): Pick<SimulationState, 'config' | 'events' | 'cursor'> {
  return {
    config: state?.config ?? null,
    events: Array.isArray(state?.events) ? state.events : [],
    cursor: typeof state?.cursor === 'number' ? state.cursor : 0,
  };
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SIMULATION,

      startSimulation: (config) => set({ config, events: [], cursor: 0 }),

      setCurrentDay: (day) =>
        set((state) => ({
          config: state.config ? { ...state.config, currentDay: day } : state.config,
        })),

      nextCursor: () => {
        const next = get().cursor + 1;
        set({ cursor: next });
        return next;
      },

      recordEvent: ({ type, payload = {}, at, day }) =>
        set((state) => {
          const timestamp = at ?? new Date().toISOString();
          const eventDay = day ?? state.config?.currentDay ?? dayKey(new Date(timestamp));
          const id = deterministicId([state.config?.seed ?? 'local', type, timestamp, state.events.length]);
          return {
            events: [
              ...state.events,
              {
                id,
                type,
                at: timestamp,
                day: eventDay,
                payload,
              },
            ].slice(-200),
          };
        }),

      resetSimulation: () => set(DEFAULT_SIMULATION),
    }),
    {
      name: 'ecopulse:simulation',
      version: 1,
      storage: createSafeJSONStorage<SimulationState>(),
      migrate: (state) => migrateSimulationStateToV1(state as Partial<SimulationState>) as SimulationState,
    }
  )
);

if (typeof window !== 'undefined') {
  useSimulationStore.persist.setOptions({
    storage: createSafeJSONStorage<SimulationState>(),
  });
}

function dayKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
