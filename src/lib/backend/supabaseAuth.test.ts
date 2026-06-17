import { afterEach, describe, expect, it, vi } from 'vitest';
import { LOCAL_USER, resolveUserId } from './supabaseAuth';

function req(headers: Record<string, string> = {}): Request {
  return new Request('https://app.test/api/x', { method: 'POST', headers });
}

describe('resolveUserId', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns local-user when Supabase is not configured', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    await expect(resolveUserId(req({ authorization: 'Bearer abc' }))).resolves.toBe(LOCAL_USER);
  });

  it('returns local-user when configured but no bearer token', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(resolveUserId(req())).resolves.toBe(LOCAL_USER);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('resolves the user id from a valid token', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ id: 'user-123' })),
    );
    await expect(resolveUserId(req({ authorization: 'Bearer good' }))).resolves.toBe('user-123');
  });

  it('falls back to local-user when the token is rejected', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'svc');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 401 })),
    );
    await expect(resolveUserId(req({ authorization: 'Bearer bad' }))).resolves.toBe(LOCAL_USER);
  });
});
