import type { MapPointType, Score } from '@/types';

export type ScenarioId = 'new-user' | 'returning-week' | 'arthur-demo' | 'legacy-import';

export interface SimulationConfig {
  scenario: ScenarioId;
  seed: string;
  regionId: string;
  startedAt: string;
  currentDay: string;
}

export type SimulationEventType =
  | 'onboarded'
  | 'scan_completed'
  | 'map_visit_marked'
  | 'post_liked'
  | 'promise_created'
  | 'daily_bonus_claimed'
  | 'battle_completed';

export type SimulationEventPayload = Record<string, string | number | boolean | null>;

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

