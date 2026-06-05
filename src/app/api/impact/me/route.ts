import { listImpactEntries } from '@/lib/backend/mvpRepository';
import { isSupabaseConfigured } from '@/lib/backend/supabaseRest';

export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = listImpactEntries();
  return Response.json({
    entries,
    totals: entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.metric] = (acc[entry.metric] ?? 0) + entry.value;
      return acc;
    }, {}),
    source: isSupabaseConfigured() ? 'provider' : 'cache',
  });
}
