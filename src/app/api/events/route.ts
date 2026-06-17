import { createEcoPulseEvent, isRecord, parseEventEnvelope, type DataSource } from '@/domain';
import { saveEvent } from '@/lib/backend/mvpRepository';
import { resolveUserId } from '@/lib/backend/supabaseAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = parseEventEnvelope(body);
    if (!parsed.ok) {
      return Response.json(
        { error: 'invalid_event', detail: parsed.error.message },
        { status: 400 },
      );
    }

    const event = createEcoPulseEvent({
      type: parsed.value.type,
      payload: parsed.value.payload,
      userId: await resolveUserId(request),
      source: isRecord(body) ? dataSourceFrom(body.source) : 'user',
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
    value === 'demo' ||
    value === 'user'
    ? value
    : 'user';
}
