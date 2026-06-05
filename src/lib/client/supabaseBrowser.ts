'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

// Browser-side Supabase auth, fully gated: when NEXT_PUBLIC_SUPABASE_* are absent
// nothing loads (the @supabase/supabase-js bundle is lazy-imported only when
// configured) and the app stays local-first. Anonymous sign-in gives each visitor
// a real auth.users id with zero friction, matching the "começa vazio" principle.

let clientPromise: Promise<SupabaseClient | null> | null = null;
let accessToken: string | null = null;

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function getClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseBrowserConfigured()) return null;
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } },
      ),
    );
  }
  return clientPromise;
}

/** Current access token (for the Authorization header on BFF calls), or null. */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Ensures an anonymous session exists and returns the user id (or null when not
 * configured / on failure — the app keeps working local-first). Idempotent.
 */
export async function ensureSupabaseSession(): Promise<string | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    const existing = await client.auth.getSession();
    if (!existing.data.session) {
      await client.auth.signInAnonymously();
    }
    const { data } = await client.auth.getSession();
    accessToken = data.session?.access_token ?? null;
    client.auth.onAuthStateChange((_event, session) => {
      accessToken = session?.access_token ?? null;
    });
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}
