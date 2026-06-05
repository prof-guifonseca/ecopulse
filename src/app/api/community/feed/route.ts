import { buildServerCommunityFeed } from '@/lib/backend/mvpRepository';
import { isSupabaseConfigured } from '@/lib/backend/supabaseRest';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    items: buildServerCommunityFeed(),
    source: isSupabaseConfigured() ? 'provider' : 'cache',
  });
}
