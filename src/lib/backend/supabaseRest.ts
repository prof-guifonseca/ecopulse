// Gated Supabase REST (PostgREST) access for the BFF. Completely inert when the
// project isn't configured: the MVP stays local-first and CI passes with no keys.
// The BFF uses the service-role key (bypasses RLS); RLS in the schema is the
// backstop for the authenticated client introduced in Fase B.

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function endpoint(table: string): string {
  return `${(process.env.SUPABASE_URL ?? '').replace(/\/$/, '')}/rest/v1/${table}`;
}

function headers(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    'content-type': 'application/json',
  };
}

/**
 * Maps a camelCase contract object to a schema-aligned row: the full object goes
 * into `data` (jsonb) plus a few extracted snake_case columns for querying. Keeps
 * the Postgres schema idiomatic while the app keeps its camelCase contracts.
 */
export function buildSupabaseRow(table: string, obj: Record<string, unknown>): Record<string, unknown> {
  const userId = (typeof obj.userId === 'string' && obj.userId) || 'local-user';
  switch (table) {
    case 'events':
      return { id: obj.id, user_id: userId, type: obj.type, day: obj.day, source: obj.source, data: obj };
    case 'scan_results':
      return { id: obj.id, user_id: userId, score: obj.score, data: obj };
    case 'impact_entries':
      return { id: obj.id, user_id: userId, metric: obj.metric, confidence: obj.confidence, data: obj };
    case 'community_reactions':
      return {
        id: `${userId}:${String(obj.postId)}:${String(obj.reaction)}`,
        user_id: userId,
        post_id: obj.postId,
        reaction: obj.reaction,
        active: obj.active,
        data: obj,
      };
    case 'community_comments':
      return { id: obj.id, user_id: userId, post_id: obj.postId, data: obj };
    default:
      return { id: obj.id, user_id: userId, data: obj };
  }
}

/**
 * Upsert a contract object into its table (merge on primary-key conflict, so
 * re-saves and reaction toggles are idempotent). Never throws — the local /
 * in-memory store stays the immediate source of UX truth.
 */
export async function persistRow(table: string, obj: object): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await fetch(endpoint(table), {
      method: 'POST',
      headers: { ...headers(), prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(buildSupabaseRow(table, obj as Record<string, unknown>)),
    });
  } catch {
    // O MVP precisa seguir navegável mesmo sem Supabase configurado/disponível.
  }
}
