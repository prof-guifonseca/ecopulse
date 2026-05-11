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

export function eventPayloadLooksValid(type: EcoPulseEventType, payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false;
  const item = payload as Record<string, unknown>;
  switch (type) {
    case 'onboarded':
      return typeof item.name === 'string' && typeof item.tribe === 'string' && typeof item.regionId === 'string';
    case 'scan_completed':
      return typeof item.productId === 'string' && typeof item.score === 'string';
    case 'product_lookup_completed':
      return typeof item.barcode === 'string' && typeof item.provider === 'string' && typeof item.found === 'boolean';
    case 'map_visit_marked':
      return typeof item.pointId === 'string' && typeof item.category === 'string';
    case 'esg_point_verified':
      return typeof item.pointId === 'string' && typeof item.status === 'string';
    case 'post_liked':
    case 'promise_created':
      return typeof item.postId === 'string';
    case 'community_reaction_recorded':
      return typeof item.postId === 'string' && typeof item.reaction === 'string' && typeof item.active === 'boolean';
    case 'daily_bonus_claimed':
      return typeof item.day === 'string';
    case 'battle_completed':
      return typeof item.battleId === 'string' && typeof item.outcome === 'string';
    case 'impact_recorded':
      return typeof item.metric === 'string' && typeof item.value === 'number' && typeof item.unit === 'string';
  }
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
