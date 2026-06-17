import type { DataSource, EcoPulseEvent, EcoPulseEventPayloads, EcoPulseEventType } from './types';

export const ECOPULSE_EVENT_TYPES: EcoPulseEventType[] = [
  'onboarded',
  'scan_completed',
  'product_lookup_completed',
  'map_visit_marked',
  'esg_point_verified',
  'post_liked',
  'promise_created',
  'community_reaction_recorded',
  'daily_bonus_claimed',
  'battle_completed',
  'impact_recorded',
];

export function isEcoPulseEventType(value: unknown): value is EcoPulseEventType {
  return typeof value === 'string' && ECOPULSE_EVENT_TYPES.includes(value as EcoPulseEventType);
}

export function createEcoPulseEvent<TType extends EcoPulseEventType>(input: {
  type: TType;
  payload: EcoPulseEventPayloads[TType];
  userId?: string;
  source?: DataSource;
  at?: string;
}): EcoPulseEvent<TType> {
  const at = input.at ?? new Date().toISOString();
  return {
    id: stableEventId(input.type, at, input.userId ?? 'local', input.payload),
    type: input.type,
    userId: input.userId ?? 'local-user',
    at,
    day: at.slice(0, 10),
    source: input.source ?? 'user',
    payload: input.payload,
  };
}

function stableEventId(type: string, at: string, userId: string, payload: unknown): string {
  const input = `${type}|${at}|${userId}|${JSON.stringify(payload)}`;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `evt_${(hash >>> 0).toString(36)}_${Date.parse(at).toString(36)}`;
}
