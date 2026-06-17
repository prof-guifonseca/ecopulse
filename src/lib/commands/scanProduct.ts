import { createEcoPulseEvent } from '@/domain';
import { asProductId } from '@/types';
import type { Product, Score } from '@/types';
import { emptyCatalogError } from '@/lib/ports/appError';
import { err, ok } from '@/lib/ports/result';
import type { Command } from '@/lib/runtime/executeCommand';

/**
 * Dependencies for {@link scanProductCommand}, injected by the composition root
 * (never imported — the ESLint `commands/**` rule forbids `@/store`). This is
 * what makes the command pure-to-test and decoupled from store singletons.
 */
export interface ScanProductDeps {
  pickProduct: (opts: { recentlyScannedIds: string[]; minScore: Score | null }) => Product | null;
  recentlyScannedIds: () => string[];
  scanMinScore: () => Score | null;
  computeTokens: (score: Score) => number;
  recordScan: (product: Product, tokens: number) => void;
  celebrate: (product: Product, tokens: number) => void;
}

export interface ScanProductOutput {
  product: Product;
  tokens: number;
}

/**
 * scanProductCommand — the reference Command (P1). Validates the catalog FIRST
 * (returns `err` before any mutation, so no rollback is needed), then records
 * the scan + awards tokens through injected deps, and emits a `scan_completed`
 * event for the seam (executeCommand) to persist through the EventStore Port.
 */
export const scanProductCommand: Command<ScanProductDeps, void, ScanProductOutput> = (deps) => {
  const product = deps.pickProduct({
    recentlyScannedIds: deps.recentlyScannedIds(),
    minScore: deps.scanMinScore(),
  });
  if (!product) return err(emptyCatalogError('No product available to scan.'));

  const tokens = deps.computeTokens(product.score);
  deps.recordScan(product, tokens);
  deps.celebrate(product, tokens);

  const event = createEcoPulseEvent({
    type: 'scan_completed',
    source: 'user',
    payload: {
      productId: asProductId(product.id),
      score: product.score,
      source: 'scan-action',
    },
  });

  return ok({ output: { product, tokens }, event });
};
