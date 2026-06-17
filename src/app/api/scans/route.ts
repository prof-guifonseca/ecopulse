import { createEcoPulseEvent, isRecord } from '@/domain';
import type { ProductLookupResult, ScanResult } from '@/domain';
import { asProductId } from '@/types';
import { saveEvent, saveScan } from '@/lib/backend/mvpRepository';
import { resolveUserId } from '@/lib/backend/supabaseAuth';
import { lookupProductByBarcode } from '@/lib/products/productLookup';
import { scanResultFromLookup } from '@/lib/products/scanRecord';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!isRecord(body)) return Response.json({ error: 'invalid_scan' }, { status: 400 });
    const lookup = await resolveLookup(body);
    if (!lookup) return Response.json({ error: 'invalid_scan' }, { status: 400 });

    const userId = await resolveUserId(request);
    const scan = scanResultFromLookup(lookup, scanSourceFrom(body.source, lookup));
    await saveScan(scan, userId);
    await saveEvent(
      createEcoPulseEvent({
        type: 'scan_completed',
        source: lookup.source,
        userId,
        payload: {
          productId: asProductId(scan.productId),
          barcode: scan.barcode,
          score: scan.score,
          source: scan.source,
        },
      }),
    );

    return Response.json({ scan }, { status: 201 });
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
}

async function resolveLookup(body: Record<string, unknown>): Promise<ProductLookupResult | null> {
  if (body.lookup && typeof body.lookup === 'object') return body.lookup as ProductLookupResult;
  const barcode = typeof body.barcode === 'string' ? body.barcode.replace(/\D/g, '') : '';
  if (barcode.length < 6) return null;
  return lookupProductByBarcode(barcode, {
    userAgent: process.env.OPEN_FOOD_FACTS_USER_AGENT ?? process.env.ESG_USER_AGENT,
  });
}

function scanSourceFrom(value: unknown, lookup: ProductLookupResult): ScanResult['source'] {
  if (value === 'manual' || value === 'barcode') return value;
  return lookup.source === 'user' ? 'manual' : 'barcode';
}
