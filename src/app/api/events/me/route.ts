import { listEvents } from '@/lib/backend/mvpRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    events: listEvents(),
    source: process.env.SUPABASE_URL ? 'provider' : 'cache',
  });
}
