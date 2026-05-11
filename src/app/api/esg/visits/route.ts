import { createEcoPulseEvent } from '@/domain';
import type { ImpactEntry } from '@/domain';
import { environmentalImpactDeltaForPoint, type EnvironmentalPoint } from '@/lib/esg';
import { saveEvent, saveImpactEntry } from '@/lib/backend/mvpRepository';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const point = body.point as EnvironmentalPoint | undefined;
    if (!point?.id || typeof point.lat !== 'number' || typeof point.lng !== 'number') {
      return Response.json({ error: 'invalid_point' }, { status: 400 });
    }

    const event = createEcoPulseEvent({
      type: 'map_visit_marked',
      source: point.source === 'cache' ? 'cache' : point.source === 'demo' ? 'demo' : 'provider',
      payload: {
        pointId: point.id,
        source: point.source,
        category: point.category,
        lat: point.lat,
        lng: point.lng,
        confidence: point.confidence,
      },
    });
    await saveEvent(event);

    const entries = impactEntriesForPoint(point, event.id);
    await Promise.all(entries.map(saveImpactEntry));
    return Response.json({ event, impactEntries: entries }, { status: 201 });
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
}

function impactEntriesForPoint(point: EnvironmentalPoint, eventId: string): ImpactEntry[] {
  const delta = environmentalImpactDeltaForPoint(point);
  const now = new Date().toISOString();
  const entries: ImpactEntry[] = [];
  if (delta.batteriesKgEstimated) {
    entries.push(metric('batteries_kg', delta.batteriesKgEstimated, 'kg', eventId, now, '0.5 kg estimado por visita a ponto de baterias.'));
  }
  if (delta.oilLitersEstimated) {
    entries.push(metric('oil_l', delta.oilLitersEstimated, 'l', eventId, now, '1 L estimado por entrega de óleo de cozinha.'));
  }
  if (delta.repairsCount) {
    entries.push(metric('repairs', delta.repairsCount, 'count', eventId, now, '1 reparo registrado por visita a serviço de reparo.'));
  }
  if (delta.exchangesCount) {
    entries.push(metric('exchanges', delta.exchangesCount, 'count', eventId, now, '1 reuso/troca estimado por visita a ponto de reuso.'));
  }
  return entries;
}

function metric(
  metricName: ImpactEntry['metric'],
  value: number,
  unit: ImpactEntry['unit'],
  eventId: string,
  now: string,
  methodology: string
): ImpactEntry {
  return {
    id: `impact:${eventId}:${metricName}`,
    metric: metricName,
    value,
    unit,
    confidence: 'estimated',
    sourceEventId: eventId,
    createdAt: now,
    methodology,
  };
}
