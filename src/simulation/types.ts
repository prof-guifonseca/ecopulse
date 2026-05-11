import type { MapPointType, Score } from '@/types';
import type { EcoPulseEventType } from '@/domain';

export type ScenarioId = 'new-user' | 'returning-week' | 'arthur-demo' | 'legacy-import';

export interface SimulationConfig {
  scenario: ScenarioId;
  seed: string;
  regionId: string;
  startedAt: string;
  currentDay: string;
}

export type SimulationEventType = EcoPulseEventType;

export type SimulationEventPayload = Record<string, string | number | boolean | null | undefined>;

export interface SimulationEvent {
  id: string;
  type: SimulationEventType;
  at: string;
  day: string;
  payload: SimulationEventPayload;
}

export interface ProductPickContext {
  seed: string;
  cursor: number;
  recentlyScannedIds: string[];
  firstRun?: boolean;
  minScore?: Score | null;
}

export interface DailyPlanContext {
  seed: string;
  day: string;
  tribe: string;
  chapterId: string;
}

export interface MapRankingContext {
  visitedPointIds: string[];
  preferredTypes?: MapPointType[];
}

