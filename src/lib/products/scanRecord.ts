import type { ProductLookupResult, ScanResult } from '@/domain';
import type { ScanRecord } from '@/store/scanHistoryStore';

export function scanRecordFromLookup(
  lookup: ProductLookupResult,
  source: ScanRecord['source'] = lookup.source === 'user' ? 'manual' : 'barcode'
): ScanRecord {
  return {
    id: lookup.id,
    source,
    barcode: lookup.barcode,
    productId: lookup.catalogProductId ?? lookup.id,
    name: lookup.name,
    brand: lookup.brand,
    category: lookup.category,
    emoji: lookup.emoji,
    score: lookup.score,
    breakdown: {
      carbono: lookup.breakdown.carbono ?? 50,
      embalagem: lookup.breakdown.embalagem ?? 50,
      reciclabilidade: lookup.breakdown.reciclabilidade ?? 50,
      origem: lookup.breakdown.origem ?? 50,
    },
    tip: lookup.tip,
    rationale: lookup.rationale,
    confidence: lookup.confidence,
    sourceName:
      lookup.provider === 'openfoodfacts'
        ? lookup.source === 'cache'
          ? 'Open Food Facts snapshot/cache'
          : 'Open Food Facts'
        : undefined,
    sourceUrl: lookup.sourceUrl,
    lastFetchedAt: lookup.lastFetchedAt,
    evidence: lookup.evidence,
    scannedAt: lookup.checkedAt,
  };
}

export function scanResultFromLookup(lookup: ProductLookupResult, source: ScanResult['source']): ScanResult {
  return {
    id: `scan:${lookup.id}:${Date.parse(lookup.checkedAt).toString(36)}`,
    barcode: lookup.barcode,
    productId: lookup.catalogProductId ?? lookup.id,
    score: lookup.score,
    source,
    lookup,
    scannedAt: lookup.checkedAt,
  };
}
