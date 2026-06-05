import type { EcoPulseEventPayloads, EcoPulseEventType, ProductLookupResult } from '@/domain';
import type { EnvironmentalPoint } from '@/lib/esg';
import { getAccessToken } from './supabaseBrowser';

export function syncEvent<TType extends EcoPulseEventType>(
  type: TType,
  payload: EcoPulseEventPayloads[TType]
): void {
  void postJson('/api/events', { type, payload });
}

export function syncScan(lookup: ProductLookupResult, source: 'barcode' | 'manual'): void {
  void postJson('/api/scans', { lookup, source });
}

export function syncMapVisit(point: EnvironmentalPoint): void {
  void postJson('/api/esg/visits', { point });
}

export function syncCommunityReaction(postId: string, reaction: 'like' | 'promise', active = true): void {
  void postJson('/api/community/reactions', { postId, reaction, active });
}

export function syncCommunityComment(comment: {
  postId: string;
  text: string;
  userName: string;
  userAvatar?: string;
  userId?: string;
}): void {
  void postJson('/api/community/comments', comment);
}

async function postJson(path: string, body: unknown): Promise<void> {
  try {
    const token = getAccessToken();
    await fetch(path, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Local-first: the persisted stores remain the immediate source of UX truth.
  }
}
