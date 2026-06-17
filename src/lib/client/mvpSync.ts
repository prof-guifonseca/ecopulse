import type { EcoPulseEventPayloads, EcoPulseEventType, ProductLookupResult } from '@/domain';
import type { EnvironmentalPoint } from '@/lib/esg';
import { fetchWithRetry } from '@/lib/net/fetchRetry';
import { recordUsage, recordUsageForEventType } from '@/store/usageCountersStore';
import { getAccessToken } from './supabaseBrowser';

// These wrappers are the live client chokepoints for real user actions, so they
// also record one ANONYMOUS usage count (P7) — by closed event-type key only,
// never the payload. The count is local; it does not depend on the POST.

export function syncEvent<TType extends EcoPulseEventType>(
  type: TType,
  payload: EcoPulseEventPayloads[TType],
): void {
  recordUsageForEventType(type);
  void postJson('/api/events', { type, payload });
}

export function syncScan(lookup: ProductLookupResult, source: 'barcode' | 'manual'): void {
  recordUsage('scan_completed');
  void postJson('/api/scans', { lookup, source });
}

export function syncMapVisit(point: EnvironmentalPoint): void {
  recordUsage('map_visit_marked');
  void postJson('/api/esg/visits', { point });
}

export function syncCommunityReaction(
  postId: string,
  reaction: 'like' | 'promise',
  active = true,
): void {
  // Count only the ADD of a reaction, not its removal — un-liking must not bump
  // the "like reactions today" signal (recordUsage ignores `active`, so gate here).
  if (active) {
    recordUsage(reaction === 'promise' ? 'community_reaction_promise' : 'community_reaction_like');
  }
  void postJson('/api/community/reactions', { postId, reaction, active });
}

export function syncCommunityComment(comment: {
  postId: string;
  text: string;
  userName: string;
  userAvatar?: string;
  userId?: string;
}): void {
  recordUsage('community_comment');
  void postJson('/api/community/comments', comment);
}

async function postJson(path: string, body: unknown): Promise<void> {
  try {
    const token = getAccessToken();
    // Single attempt (retries: 0) — these writes are NOT yet idempotent under
    // retry: createEcoPulseEvent mints a server-fresh `at` and comments a fresh
    // UUID, so a retried POST would land a second row (duplicate event / impact
    // entry / comment). We still go through fetchWithRetry for the one uniform
    // client fetch path; enabling retry here waits on a client idempotency key
    // (deferred). Reads (GET) are retried where they're called.
    await fetchWithRetry(
      fetch,
      path,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      },
      { retries: 0 },
    );
  } catch {
    // Local-first: the persisted stores remain the immediate source of UX truth.
  }
}
