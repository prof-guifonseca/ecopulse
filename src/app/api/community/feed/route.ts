import { buildServerCommunityFeed } from '@/lib/backend/mvpRepository';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    items: buildServerCommunityFeed(),
    source: process.env.SUPABASE_URL ? 'provider' : 'cache',
  });
}
