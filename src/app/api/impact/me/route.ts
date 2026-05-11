import { listImpactEntries } from '@/lib/backend/mvpRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = listImpactEntries();
  return Response.json({
    entries,
    totals: entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.metric] = (acc[entry.metric] ?? 0) + entry.value;
      return acc;
    }, {}),
    source: process.env.SUPABASE_URL ? 'provider' : 'cache',
  });
}
