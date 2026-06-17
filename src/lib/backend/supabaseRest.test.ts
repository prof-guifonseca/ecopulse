import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSupabaseRow,
  isSupabaseConfigured,
  persistRow,
  supabaseSelectData,
} from './supabaseRest';

describe('supabaseRest', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('isSupabaseConfigured', () => {
    it('is false unless both URL and service-role key are set', () => {
      vi.stubEnv('SUPABASE_URL', '');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
      expect(isSupabaseConfigured()).toBe(false);

      vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
      expect(isSupabaseConfigured()).toBe(false);

      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
      expect(isSupabaseConfigured()).toBe(true);
    });
  });

  describe('buildSupabaseRow', () => {
    it('wraps the full object in data and extracts queryable columns (events)', () => {
      const event = {
        id: 'e1',
        userId: 'u1',
        type: 'scan_completed',
        day: '2026-06-05',
        source: 'provider',
        payload: { productId: 'p1' },
      };
      expect(buildSupabaseRow('events', event)).toEqual({
        id: 'e1',
        user_id: 'u1',
        type: 'scan_completed',
        day: '2026-06-05',
        source: 'provider',
        data: event,
      });
    });

    it('defaults user_id to local-user when absent', () => {
      expect(buildSupabaseRow('scan_results', { id: 's1', score: 'B' })).toMatchObject({
        id: 's1',
        user_id: 'local-user',
        score: 'B',
      });
    });

    it('builds a composite id for reactions so toggles upsert', () => {
      expect(
        buildSupabaseRow('community_reactions', {
          userId: 'u1',
          postId: 'p9',
          reaction: 'like',
          active: true,
        }),
      ).toMatchObject({
        id: 'u1:p9:like',
        user_id: 'u1',
        post_id: 'p9',
        reaction: 'like',
        active: true,
      });
    });
  });

  describe('persistRow', () => {
    it('no-ops (never fetches) when Supabase is not configured', async () => {
      vi.stubEnv('SUPABASE_URL', '');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await persistRow('events', { id: 'e1' });

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('upserts the mapped row to PostgREST when configured', async () => {
      vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
      const fetchMock = vi.fn(async () => new Response(null, { status: 201 }));
      vi.stubGlobal('fetch', fetchMock);

      await persistRow('scan_results', { id: 's1', userId: 'u1', score: 'A' });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toBe('https://x.supabase.co/rest/v1/scan_results');
      expect(String((init.headers as Record<string, string>).prefer)).toContain('merge-duplicates');
      expect(JSON.parse(String(init.body))).toMatchObject({ id: 's1', user_id: 'u1', score: 'A' });
    });

    it('stays silent when the network call throws', async () => {
      vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new Error('network down');
        }),
      );

      await expect(persistRow('events', { id: 'e1' })).resolves.toBeUndefined();
    });
  });

  describe('supabaseSelectData', () => {
    it('returns [] without fetching when unconfigured', async () => {
      vi.stubEnv('SUPABASE_URL', '');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(supabaseSelectData('events', 'user_id=eq.u1')).resolves.toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('unwraps each row.data when configured', async () => {
      vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
      const fetchMock = vi.fn(async () =>
        Response.json([{ data: { id: 'e1' } }, { data: { id: 'e2' } }]),
      );
      vi.stubGlobal('fetch', fetchMock);

      const rows = await supabaseSelectData<{ id: string }>('events', 'user_id=eq.u1');
      expect(rows).toEqual([{ id: 'e1' }, { id: 'e2' }]);
      const [url] = fetchMock.mock.calls[0] as unknown as [string];
      expect(url).toContain('/rest/v1/events?select=data&user_id=eq.u1');
    });
  });
});
