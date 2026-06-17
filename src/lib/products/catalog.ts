import { PRODUCTS } from '@/data/products';
import type { Product, Score } from '@/types';

export type ProductCatalogItem = Product;

const SCORE_RANK: Record<Score, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };
const SAMPLE_SCORE_ORDER: Score[] = ['B', 'C', 'A', 'D', 'E'];
const ALTERNATIVE_ORDER: Score[] = ['A', 'B', 'C', 'D', 'E'];

export function listProductCatalog(): ProductCatalogItem[] {
  return PRODUCTS;
}

export function findCatalogProductById(id: string): ProductCatalogItem | null {
  return PRODUCTS.find((product) => product.id === id) ?? null;
}

export function findCatalogProductByBarcode(barcode: string): ProductCatalogItem | null {
  const normalized = barcode.replace(/\D/g, '');
  return PRODUCTS.find((product) => product.barcode === normalized) ?? null;
}

export function pickRealSampleProduct(): ProductCatalogItem | null {
  for (const score of SAMPLE_SCORE_ORDER) {
    const product = PRODUCTS.find(
      (item) => item.score === score && item.confidence && item.confidence >= 55,
    );
    if (product) return product;
  }
  return PRODUCTS[0] ?? null;
}

export function pickNextCatalogProduct(
  options: {
    recentlyScannedIds?: readonly string[];
    minScore?: Score | null;
  } = {},
): ProductCatalogItem | null {
  const recent = new Set(options.recentlyScannedIds ?? []);
  const unseen = PRODUCTS.filter((product) => !recent.has(product.id));
  const pool = unseen.length > 0 ? unseen : PRODUCTS;
  const eligible = options.minScore
    ? pool.filter((product) => SCORE_RANK[product.score] >= SCORE_RANK[options.minScore!])
    : pool;
  return sortRealProducts(eligible.length > 0 ? eligible : pool)[0] ?? null;
}

export function findProductAlternatives(product: ProductCatalogItem): ProductCatalogItem[] {
  const productScoreIndex = ALTERNATIVE_ORDER.indexOf(product.score);
  if (productScoreIndex <= 1) return [];

  const betterSameCategory = PRODUCTS.filter((candidate) => candidate.id !== product.id)
    .filter((candidate) => candidate.category === product.category)
    .filter((candidate) => ALTERNATIVE_ORDER.indexOf(candidate.score) < productScoreIndex)
    .sort(productComparator)
    .slice(0, 3);

  if (betterSameCategory.length > 0) return betterSameCategory;

  return PRODUCTS.filter((candidate) => candidate.id !== product.id)
    .filter((candidate) => candidate.score === 'A' || candidate.score === 'B')
    .sort(productComparator)
    .slice(0, 2);
}

export function assertRealProductCatalog(): boolean {
  return PRODUCTS.every(
    (product) =>
      /^\d{8,14}$/.test(product.barcode) &&
      product.sourceName === 'Open Food Facts' &&
      Boolean(product.sourceUrl?.includes('openfoodfacts.org/product/')) &&
      (product.evidence?.fields.length ?? 0) >= 3,
  );
}

function sortRealProducts(products: readonly ProductCatalogItem[]): ProductCatalogItem[] {
  return [...products].sort(productComparator);
}

function productComparator(a: ProductCatalogItem, b: ProductCatalogItem): number {
  const scoreDelta = ALTERNATIVE_ORDER.indexOf(a.score) - ALTERNATIVE_ORDER.indexOf(b.score);
  if (scoreDelta !== 0) return scoreDelta;
  const confidenceDelta = (b.confidence ?? 0) - (a.confidence ?? 0);
  if (confidenceDelta !== 0) return confidenceDelta;
  return a.name.localeCompare(b.name, 'pt-BR');
}
