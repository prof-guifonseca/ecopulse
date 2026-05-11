import { describe, expect, it } from 'vitest';
import { normalizeOpenFoodFactsProduct, productLookupResultFromCatalog } from './productLookup';
import { PRODUCTS } from '@/data/products';

describe('product lookup normalization', () => {
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
  });

  it('keeps local catalog products as simulation fallback lookups', () => {
    const result = productLookupResultFromCatalog(PRODUCTS[0]);

    expect(result.source).toBe('simulation');
    expect(result.provider).toBe('local-catalog');
    expect(result.catalogProductId).toBe(PRODUCTS[0].id);
  });
});
