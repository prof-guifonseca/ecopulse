import { listEvents } from '@/lib/backend/mvpRepository';
import { isSupabaseConfigured } from '@/lib/backend/supabaseRest';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    events: listEvents(),
    source: isSupabaseConfigured() ? 'provider' : 'cache',
  });
}
