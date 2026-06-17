import { createEcoPulseEvent } from '@/domain';
import { recordCommunityReaction, saveEvent } from '@/lib/backend/mvpRepository';
import { resolveUserId } from '@/lib/backend/supabaseAuth';
import { asPostId } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const postId = typeof body.postId === 'string' ? body.postId : '';
    const reaction =
      body.reaction === 'promise' ? 'promise' : body.reaction === 'like' ? 'like' : null;
    const active = typeof body.active === 'boolean' ? body.active : true;
    if (!postId || !reaction) return Response.json({ error: 'invalid_reaction' }, { status: 400 });

    const userId = await resolveUserId(request);
    const saved = await recordCommunityReaction({
      postId,
      reaction,
      active,
      userId,
      updatedAt: new Date().toISOString(),
    });
    await saveEvent(
      createEcoPulseEvent({
        type: 'community_reaction_recorded',
        userId,
        payload: { postId: asPostId(postId), reaction, active },
      }),
    );
    return Response.json({ reaction: saved }, { status: 201 });
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
}
