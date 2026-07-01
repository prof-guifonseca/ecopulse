import * as Sentry from '@sentry/nextjs';
import { findProductByBarcode } from '@/data/products';
import type { ProductLookupResult } from '@/domain';
import { deriveScore } from '@/lib/scoring';
import type { Product } from '@/types';
import { fetchOpenFoodFactsProduct } from './adapters/openFoodFacts';
import { INSUFFICIENT_TIP } from './lookupShared';

/**
 * Product lookup orchestrator. Owns the cache + fallback policy (live provider →
 * local catalog → unknown) and delegates the provider boundary to the Open Food
 * Facts adapter (P6), which is the only module that touches the raw wire format.
 */

const PRODUCT_CACHE_TTL_MS = 30 * 60 * 1000;
const productCache = new Map<string, { expiresAt: number; value: ProductLookupResult }>();

export async function lookupProductByBarcode(
  barcode: string,
  options: { userAgent?: string; signal?: AbortSignal } = {},
): Promise<ProductLookupResult> {
  const normalizedBarcode = normalizeBarcode(barcode);
  const cached = productCache.get(normalizedBarcode);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.value,
      source: 'cache',
      checkedAt: new Date().toISOString(),
    };
  }

  const local = findProductByBarcode(normalizedBarcode);

  try {
    const live = await fetchOpenFoodFactsProduct(normalizedBarcode, options);
    if (live) {
      productCache.set(normalizedBarcode, {
        expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS,
        value: live,
      });
      return live;
    }
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'product-lookup',
      level: 'warning',
      message: 'open food facts lookup failed, falling back to catalog',
      data: { message: error instanceof Error ? error.message : String(error) },
    });
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ecopulse] open food facts lookup failed', error);
    }
    // Fall through to local catalog/manual result.
  }

  if (local) return productLookupResultFromCatalog(local);
  return unknownProductResult(normalizedBarcode);
}

export function productLookupResultFromCatalog(product: Product): ProductLookupResult {
  const score = deriveScore({
    novaGroup: product.novaGroup,
    preGradedScore: product.score,
    packagingTags: product.packagingTags,
    isLocal: product.isLocal,
    hasKnownOrigin: true,
  });

  return {
    id: product.id,
    barcode: product.barcode,
    found: true,
    source: 'cache',
    provider: 'openfoodfacts',
    name: product.name,
    brand: product.brand,
    category: product.category,
    emoji: product.emoji,
    score: score.score,
    breakdown: { ...score.breakdown },
    tip: product.tip || score.tip,
    rationale: ['Snapshot Open Food Facts', ...score.rationale],
    confidence: product.confidence ?? 55,
    evidence: product.evidence ?? emptyEvidence(),
    sourceUrl: product.sourceUrl,
    lastFetchedAt: product.sourceUpdatedAt ?? new Date().toISOString(),
    catalogProductId: product.id,
    checkedAt: new Date().toISOString(),
  };
}

function unknownProductResult(barcode: string): ProductLookupResult {
  const score = deriveScore({
    novaGroup: null,
    packagingTags: [],
    isLocal: false,
    hasKnownOrigin: false,
  });

  return {
    id: `manual:${barcode}`,
    barcode,
    found: false,
    source: 'user',
    provider: 'manual',
    name: `Produto ${barcode}`,
    brand: 'Não identificado',
    category: 'Produto',
    emoji: '📦',
    score: score.score,
    breakdown: { ...score.breakdown },
    tip: INSUFFICIENT_TIP,
    rationale: ['Barcode não encontrado em provedores abertos', ...score.rationale],
    confidence: 15,
    evidence: emptyEvidence(),
    lastFetchedAt: new Date().toISOString(),
    checkedAt: new Date().toISOString(),
  };
}

function normalizeBarcode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 32);
}

function emptyEvidence(): ProductLookupResult['evidence'] {
  return {
    packagingTags: [],
    countriesTags: [],
    novaGroup: null,
    ecoscoreGrade: null,
    image: false,
    fields: [],
  };
}
