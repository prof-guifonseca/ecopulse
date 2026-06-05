import { isSupabaseConfigured } from './supabaseRest';

export const LOCAL_USER = 'local-user';

/**
 * Resolves the request's user id from a Supabase access token
 * (`Authorization: Bearer <jwt>`), verified against GoTrue. Falls back to
 * 'local-user' when Supabase isn't configured or the token is missing/invalid —
 * so the BFF keeps working local-first and never trusts a spoofed id.
 */
export async function resolveUserId(request: Request): Promise<string> {
  if (!isSupabaseConfigured()) return LOCAL_USER;

  const header = request.headers.get('authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) return LOCAL_USER;

  try {
    const res = await fetch(`${(process.env.SUPABASE_URL ?? '').replace(/\/$/, '')}/auth/v1/user`, {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
        authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return LOCAL_USER;
    const user = (await res.json()) as { id?: string };
    return user.id ?? LOCAL_USER;
  } catch {
    return LOCAL_USER;
  }
}
