import { describe, expect, it } from 'vitest';
import { normalizeOpenFoodFactsProduct, productLookupResultFromCatalog } from './productLookup';
import { PRODUCTS } from '@/data/products';

describe('product lookup normalization', () => {
  it('ships a real Open Food Facts snapshot with barcode and evidence provenance', () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(12);
    expect(PRODUCTS.every((product) => /^\d{8,14}$/.test(product.barcode))).toBe(true);
    expect(PRODUCTS.every((product) => product.sourceName === 'Open Food Facts')).toBe(true);
    expect(
      PRODUCTS.every((product) => product.sourceUrl?.includes('openfoodfacts.org/product/')),
    ).toBe(true);
    expect(PRODUCTS.every((product) => (product.evidence?.fields.length ?? 0) >= 3)).toBe(true);
  });

  it('turns partial Open Food Facts data into an EcoPulse product lookup', () => {
    const result = normalizeOpenFoodFactsProduct('7891000000001', {
      product_name: 'Arroz Integral Orgânico',
      brands: 'Cooperativa Norte',
      categories_tags: ['en:plant-based-foods'],
      packaging_tags: ['en:paper'],
      countries_tags: ['en:brazil'],
      nova_group: 1,
      ecoscore_grade: 'b',
    });

    expect(result.source).toBe('provider');
    expect(result.provider).toBe('openfoodfacts');
    expect(result.found).toBe(true);
    expect(result.score).toBe('B');
    expect(result.rationale).toContain('Open Food Facts');
    expect(result.confidence).toBeGreaterThan(60);
    expect(result.sourceUrl).toContain('openfoodfacts.org/product/7891000000001');
  });

  it('keeps local catalog products as Open Food Facts cache fallback lookups', () => {
    const result = productLookupResultFromCatalog(PRODUCTS[0]);

    expect(result.source).toBe('cache');
    expect(result.provider).toBe('openfoodfacts');
    expect(result.catalogProductId).toBe(PRODUCTS[0].id);
    expect(result.confidence).toBeGreaterThanOrEqual(50);
  });
});
