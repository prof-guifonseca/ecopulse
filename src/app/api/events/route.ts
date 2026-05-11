import { createEcoPulseEvent, eventPayloadLooksValid, isEcoPulseEventType, type DataSource } from '@/domain';
import { saveEvent } from '@/lib/backend/mvpRepository';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const type = body.type;
    const payload = body.payload;
    if (!isEcoPulseEventType(type) || !eventPayloadLooksValid(type, payload)) {
      return Response.json({ error: 'invalid_event' }, { status: 400 });
    }

    const event = createEcoPulseEvent({
      type,
      payload: payload as never,
      userId: typeof body.userId === 'string' ? body.userId : 'local-user',
      source: dataSourceFrom(body.source),
    });
    await saveEvent(event);
    return Response.json({ event }, { status: 201 });
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
}

function dataSourceFrom(value: unknown): DataSource {
  return value === 'provider' ||
    value === 'cache' ||
    value === 'official' ||
    value === 'simulation' ||
    value === 'demo' ||
    value === 'user'
    ? value
    : 'user';
}
