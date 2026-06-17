import type { NextRequest } from 'next/server';
import { isRecord, type CommunityComment } from '@/domain';
import { listCommunityComments, saveCommunityComment } from '@/lib/backend/mvpRepository';
import { resolveUserId } from '@/lib/backend/supabaseAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get('postId')?.trim() ?? '';
  if (!postId) return Response.json({ error: 'missing_post_id' }, { status: 400 });
  return Response.json({ comments: listCommunityComments(postId) });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body)) return Response.json({ error: 'invalid_comment' }, { status: 400 });
    const postId = typeof body.postId === 'string' ? body.postId.trim() : '';
    const text = typeof body.text === 'string' ? body.text.trim().slice(0, 500) : '';
    const userId = await resolveUserId(request);
    const userName = typeof body.userName === 'string' ? body.userName.trim().slice(0, 80) : 'Você';
    const userAvatar =
      typeof body.userAvatar === 'string' ? body.userAvatar.trim().slice(0, 8) : '🌱';

    if (!postId || text.length < 2) {
      return Response.json({ error: 'invalid_comment' }, { status: 400 });
    }

    const comment: CommunityComment = {
      id: `comment:${postId}:${crypto.randomUUID()}`,
      postId,
      userId,
      userName,
      userAvatar,
      text,
      createdAt: new Date().toISOString(),
      source: 'user',
    };

    return Response.json({ comment: await saveCommunityComment(comment) }, { status: 201 });
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
}
