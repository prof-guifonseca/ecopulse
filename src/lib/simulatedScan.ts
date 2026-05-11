import { deriveScore } from '@/lib/scoring';
import type { ScanRecord } from '@/store/scanHistoryStore';
import { useGameStore } from '@/store/gameStore';
import { useSimulationStore } from '@/store/simulationStore';
import { getDailyMissionTemplate, pickNextProduct } from '@/simulation';
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
export function performSimulatedScan(
  recentlyScannedIds: string[],
  options: { firstRun?: boolean } = {}
): ScanRecord {
  const simulation = useSimulationStore.getState();
  const game = useGameStore.getState();
  const cursor = simulation.nextCursor();
  const scanTemplateId = game.todaysMissionIds.find((id) => getDailyMissionTemplate(id)?.slot === 'scan');
  const scanTemplate = getDailyMissionTemplate(scanTemplateId);
  const product = pickNextProduct({
    seed: simulation.config?.seed ?? 'ecopulse-local',
    cursor,
    recentlyScannedIds,
    firstRun: options.firstRun,
    minScore: scanTemplate?.filter?.minScore ?? null,
  });
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
    confidence: product.confidence,
    sourceName: product.sourceName,
    sourceUrl: product.sourceUrl,
    lastFetchedAt: product.sourceUpdatedAt,
    evidence: product.evidence,
    scannedAt,
  };
}
