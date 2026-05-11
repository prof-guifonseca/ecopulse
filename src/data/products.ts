import { deriveScore } from '@/lib/scoring';
import type { Product, Score } from '@/types';
import { OPEN_FOOD_FACTS_PRODUCTS, OPEN_FOOD_FACTS_SNAPSHOT_META } from './openFoodFactsProducts';

export interface OpenFoodFactsSnapshotProduct {
  code: string;
  productName: string;
  brand: string;
  categories: string;
  categoriesTags: readonly string[];
  packaging: string;
  packagingTags: readonly string[];
  countriesTags: readonly string[];
  novaGroup: 1 | 2 | 3 | 4 | null;
  ecoscoreGrade: string | null;
  imageUrl?: string;
  sourceUrl: string;
  evidenceFields: readonly string[];
}

export const PRODUCTS: Product[] = OPEN_FOOD_FACTS_PRODUCTS.map((item) => {
  const scoreInput = {
    novaGroup: item.novaGroup,
    preGradedScore: scoreFromEcoScore(item.ecoscoreGrade),
    packagingTags: [...item.packagingTags],
    isLocal: item.countriesTags.includes('brazil'),
    hasKnownOrigin: item.countriesTags.length > 0,
  };
  const result = deriveScore(scoreInput);
  const confidence = productConfidence(item);

  return {
    id: `off-${item.code}`,
    barcode: item.code,
    name: item.productName,
    brand: item.brand,
    category: categoryFromOpenFoodFacts(item),
    emoji: emojiForCategory(item),
    photoKey: photoKeyForCategory(item),
    packagingTags: [...item.packagingTags],
    isLocal: item.countriesTags.includes('brazil'),
    novaGroup: item.novaGroup,
    score: result.score,
    breakdown: result.breakdown,
    tip: tipFromEvidence(result.score, confidence),
    sourceName: OPEN_FOOD_FACTS_SNAPSHOT_META.sourceName,
    sourceUrl: item.sourceUrl,
    sourceUpdatedAt: OPEN_FOOD_FACTS_SNAPSHOT_META.generatedAt,
    confidence,
    evidence: {
      packagingTags: [...item.packagingTags],
      countriesTags: [...item.countriesTags],
      novaGroup: item.novaGroup,
      ecoscoreGrade: item.ecoscoreGrade,
      image: Boolean(item.imageUrl),
      fields: [...item.evidenceFields],
    },
  } satisfies Product;
});

export function findProductByBarcode(barcode: string): Product | undefined {
  return PRODUCTS.find((p) => p.barcode === barcode.replace(/\D/g, ''));
}

export function getOpenFoodFactsSnapshotMeta() {
  return OPEN_FOOD_FACTS_SNAPSHOT_META;
}

export function productConfidence(item: OpenFoodFactsSnapshotProduct): number {
  let confidence = 35;
  confidence += Math.min(item.evidenceFields.length, 5) * 8;
  if (item.packagingTags.length > 0) confidence += 12;
  if (item.novaGroup) confidence += 10;
  if (scoreFromEcoScore(item.ecoscoreGrade)) confidence += 12;
  if (item.imageUrl) confidence += 5;
  if (item.countriesTags.includes('brazil')) confidence += 8;
  return Math.min(confidence, 95);
}

export function scoreFromEcoScore(value: string | null | undefined): Score | null {
  const normalized = value?.trim().toUpperCase();
  return normalized === 'A' || normalized === 'B' || normalized === 'C' || normalized === 'D' || normalized === 'E'
    ? normalized
    : null;
}

function tipFromEvidence(score: Score, confidence: number): string {
  if (confidence < 55) return 'Dados insuficientes para avaliação completa. Use como indício, não como veredito.';
  if (score === 'A') return 'Boa pegada ambiental segundo sinais abertos do Open Food Facts.';
  if (score === 'B') return 'Sinais positivos. Compare embalagem e processamento antes da próxima compra.';
  if (score === 'C') return 'Avaliação intermediária. Vale procurar versões com embalagem mais simples.';
  if (score === 'D') return 'Sinais de maior impacto. Confira alternativas com melhor embalagem ou menor processamento.';
  return 'Sinais críticos de impacto. Priorize uma alternativa com dados e embalagem melhores.';
}

function categoryFromOpenFoodFacts(item: OpenFoodFactsSnapshotProduct): string {
  const tags = new Set(item.categoriesTags);
  const raw = item.categories.split(',').map((part) => part.trim()).find(Boolean);
  if (hasAny(tags, ['beverages', 'instant-beverages', 'sodas'])) return 'Bebidas';
  if (hasAny(tags, ['dairies', 'milks', 'uht-milks', 'milk-powders'])) return 'Laticínios';
  if (hasAny(tags, ['snacks', 'sweet-snacks', 'salty-snacks', 'biscuits-and-cakes'])) return 'Snacks';
  if (hasAny(tags, ['fats', 'vegetable-oils', 'olive-oils', 'soybean-oils'])) return 'Óleos e gorduras';
  if (hasAny(tags, ['breads', 'sliced-breads', 'cereals-and-potatoes'])) return 'Padaria';
  if (hasAny(tags, ['condiments', 'sauces', 'mayonnaises'])) return 'Condimentos';
  return raw || 'Alimentos';
}

function emojiForCategory(item: OpenFoodFactsSnapshotProduct): string {
  const category = categoryFromOpenFoodFacts(item).toLowerCase();
  if (category.includes('bebida')) return '🥤';
  if (category.includes('latic')) return '🥛';
  if (category.includes('snack')) return '🍫';
  if (category.includes('óleo') || category.includes('gordura')) return '🫒';
  if (category.includes('padaria')) return '🍞';
  if (category.includes('condimento')) return '🥫';
  return '🛒';
}

function photoKeyForCategory(item: OpenFoodFactsSnapshotProduct): Product['photoKey'] {
  const category = categoryFromOpenFoodFacts(item).toLowerCase();
  if (category.includes('bebida')) return 'aluminiumCan';
  if (category.includes('latic')) return 'milk';
  if (category.includes('snack')) return 'chocolate';
  if (category.includes('óleo')) return 'oliveOil';
  if (category.includes('padaria')) return 'oats';
  return undefined;
}

function hasAny(tags: Set<string>, values: string[]): boolean {
  return values.some((value) => tags.has(value));
}
