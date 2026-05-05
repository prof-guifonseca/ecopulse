import { PRODUCTS } from '@/data';
import { deriveScore } from '@/lib/scoring';
import type { ScanRecord } from '@/store/scanHistoryStore';
import type { Product } from '@/types';

/**
 * Picks a product from the catalog and produces a ScanRecord.
 *
 * Heuristic: prefer products the user hasn't scanned recently. When everything
 * has been seen, just pick something — it's a prototype, repetition is fine.
 *
 * The returned record carries the *derived* score from lib/scoring.ts so the
 * "Como calculamos" panel has real signals to show. The score will usually
 * match the catalog's hand-curated grade, but they're computed independently.
 */
export function performSimulatedScan(recentlyScannedIds: string[]): ScanRecord {
  const seen = new Set(recentlyScannedIds);
  const unseen = PRODUCTS.filter((p) => !seen.has(p.id));
  const pool = unseen.length > 0 ? unseen : PRODUCTS;
  const product = pool[Math.floor(Math.random() * pool.length)];
  return scanRecordFromProduct(product, 'simulator');
}

/**
 * Builds a ScanRecord directly from a known product. Used by:
 *   - performSimulatedScan (random pick)
 *   - the demo seed (pre-populating Arthur's history)
 *   - the "view from catalog" path in the product modal
 */
export function scanRecordFromProduct(
  product: Product,
  source: ScanRecord['source'] = 'simulator',
  scannedAt: string = new Date().toISOString()
): ScanRecord {
  const result = deriveScore({
    novaGroup: product.novaGroup,
    preGradedScore: product.score,
    packagingTags: product.packagingTags,
    isLocal: product.isLocal,
    hasKnownOrigin: true,
  });

  return {
    id: product.id,
    source,
    barcode: product.barcode,
    productId: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    emoji: product.emoji,
    photoKey: product.photoKey,
    score: result.score,
    breakdown: result.breakdown,
    tip: result.tip,
    rationale: result.rationale,
    scannedAt,
  };
}
