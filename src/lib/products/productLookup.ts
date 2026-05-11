import { findProductByBarcode } from '@/data/products';
import type { ProductLookupResult } from '@/domain';
import { deriveScore, type ScoreInput } from '@/lib/scoring';
import type { Product, Score } from '@/types';

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  product_name_pt?: string;
  brands?: string;
  categories?: string;
  categories_tags?: string[];
  packaging?: string;
  packaging_tags?: string[];
  labels_tags?: string[];
  countries_tags?: string[];
  nova_group?: number;
  ecoscore_grade?: string;
  image_front_url?: string;
}

interface OpenFoodFactsResponse {
  code?: string;
  status?: number;
  product?: OpenFoodFactsProduct;
}

const PRODUCT_CACHE_TTL_MS = 30 * 60 * 1000;
const productCache = new Map<string, { expiresAt: number; value: ProductLookupResult }>();

export async function lookupProductByBarcode(
  barcode: string,
  options: { userAgent?: string; signal?: AbortSignal } = {}
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
    const live = await lookupOpenFoodFacts(normalizedBarcode, options);
    if (live) {
      productCache.set(normalizedBarcode, { expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS, value: live });
      return live;
    }
  } catch {
    // Fall through to local catalog/manual result.
  }

  if (local) return productLookupResultFromCatalog(local);
  return unknownProductResult(normalizedBarcode);
}

export function normalizeOpenFoodFactsProduct(
  barcode: string,
  product: OpenFoodFactsProduct
): ProductLookupResult {
  const packagingTags = normalizeTags([...(product.packaging_tags ?? []), product.packaging ?? '']);
  const countries = normalizeTags(product.countries_tags ?? []);
  const novaGroup = normalizeNova(product.nova_group);
  const preGradedScore = scoreFromEcoScore(product.ecoscore_grade);
  const input: ScoreInput = {
    novaGroup,
    preGradedScore,
    packagingTags,
    isLocal: countries.some((country) => country.includes('brazil') || country.includes('brasil')),
    hasKnownOrigin: countries.length > 0,
  };
  const score = deriveScore(input);
  const category = categoryFromOpenFoodFacts(product);

  return {
    id: `off:${barcode}`,
    barcode,
    found: true,
    source: 'provider',
    provider: 'openfoodfacts',
    name: product.product_name_pt || product.product_name || 'Produto sem nome',
    brand: firstValue(product.brands) || 'Marca não informada',
    category,
    emoji: emojiForCategory(category),
    score: score.score,
    breakdown: { ...score.breakdown },
    tip: score.tip,
    rationale: ['Open Food Facts', ...score.rationale],
    imageUrl: product.image_front_url,
    checkedAt: new Date().toISOString(),
  };
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
    source: 'simulation',
    provider: 'local-catalog',
    name: product.name,
    brand: product.brand,
    category: product.category,
    emoji: product.emoji,
    score: score.score,
    breakdown: { ...score.breakdown },
    tip: product.tip || score.tip,
    rationale: ['Catálogo local de fallback', ...score.rationale],
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
    tip: 'Dados insuficientes. Use como registro manual e revise alternativas no catálogo.',
    rationale: ['Barcode não encontrado em provedores abertos', ...score.rationale],
    checkedAt: new Date().toISOString(),
  };
}

async function lookupOpenFoodFacts(
  barcode: string,
  options: { userAgent?: string; signal?: AbortSignal }
): Promise<ProductLookupResult | null> {
  const fields = [
    'code',
    'product_name',
    'product_name_pt',
    'brands',
    'categories',
    'categories_tags',
    'packaging',
    'packaging_tags',
    'labels_tags',
    'countries_tags',
    'nova_group',
    'ecoscore_grade',
    'image_front_url',
  ].join(',');
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=${fields}`,
    {
      headers: {
        'user-agent': options.userAgent ?? process.env.OPEN_FOOD_FACTS_USER_AGENT ?? 'EcoPulse/0.1',
      },
      signal: options.signal,
    }
  );
  if (!response.ok) return null;
  const data = (await response.json()) as OpenFoodFactsResponse;
  if (data.status !== 1 || !data.product) return null;
  return normalizeOpenFoodFactsProduct(data.code ?? barcode, data.product);
}

function normalizeBarcode(value: string): string {
  return value.replace(/\D/g, '').slice(0, 32);
}

function normalizeTags(values: string[]): string[] {
  return values
    .flatMap((value) => value.split(','))
    .map((value) => value.trim().toLowerCase().replace(/^en:/, '').replace(/^pt:/, ''))
    .filter(Boolean);
}

function normalizeNova(value: number | undefined): 1 | 2 | 3 | 4 | null {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : null;
}

function scoreFromEcoScore(value: string | undefined): Score | null {
  const normalized = value?.trim().toUpperCase();
  return normalized === 'A' || normalized === 'B' || normalized === 'C' || normalized === 'D' || normalized === 'E'
    ? normalized
    : null;
}

function categoryFromOpenFoodFacts(product: OpenFoodFactsProduct): string {
  const tags = normalizeTags(product.categories_tags ?? []);
  const raw = firstValue(product.categories);
  if (tags.some((tag) => tag.includes('beverage') || tag.includes('bebida'))) return 'Bebidas';
  if (tags.some((tag) => tag.includes('cosmetic') || tag.includes('hygiene'))) return 'Higiene';
  if (tags.some((tag) => tag.includes('cleaning'))) return 'Limpeza';
  return raw || 'Alimentos';
}

function emojiForCategory(category: string): string {
  const key = category.toLowerCase();
  if (key.includes('bebida')) return '🥤';
  if (key.includes('higiene')) return '🧼';
  if (key.includes('limpeza')) return '🧽';
  if (key.includes('moda') || key.includes('vest')) return '👕';
  return '🛒';
}

function firstValue(value: string | undefined): string {
  return value?.split(',').map((item) => item.trim()).find(Boolean) ?? '';
}
