import type { NextRequest } from 'next/server';
import { createEcoPulseEvent } from '@/domain';
import { saveEvent } from '@/lib/backend/mvpRepository';
import { lookupProductByBarcode } from '@/lib/products/productLookup';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('barcode')?.replace(/\D/g, '') ?? '';
  if (barcode.length < 6) {
    return Response.json({ error: 'invalid_barcode' }, { status: 400 });
  }

  const result = await lookupProductByBarcode(barcode, {
    userAgent: process.env.OPEN_FOOD_FACTS_USER_AGENT ?? process.env.ESG_USER_AGENT,
  });
  await saveEvent(
    createEcoPulseEvent({
      type: 'product_lookup_completed',
      source: result.source,
      payload: {
        barcode: result.barcode,
        provider: result.provider,
        found: result.found,
        source: result.source,
        score: result.score,
      },
    }),
  );

  return Response.json(result, {
    headers: {
      'Cache-Control': 'private, max-age=300',
    },
  });
}
