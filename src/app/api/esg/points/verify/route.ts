import { createEcoPulseEvent } from '@/domain';
import { saveEvent } from '@/lib/backend/mvpRepository';
import { asPointId } from '@/types';

export const dynamic = 'force-dynamic';

const STATUSES = new Set(['visited', 'closed', 'incorrect', 'suggested']);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const pointId = typeof body.pointId === 'string' ? body.pointId.trim() : '';
    const status = typeof body.status === 'string' ? body.status.trim() : '';
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : undefined;

    if (!pointId || !STATUSES.has(status)) {
      return Response.json({ error: 'invalid_verification' }, { status: 400 });
    }

    const event = createEcoPulseEvent({
      type: 'esg_point_verified',
      source: 'user',
      payload: {
        pointId: asPointId(pointId),
        status: status as 'visited' | 'closed' | 'incorrect' | 'suggested',
        note,
      },
    });

    await saveEvent(event);
    return Response.json({ event }, { status: 201 });
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
}
