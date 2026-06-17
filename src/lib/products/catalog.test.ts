import { describe, expect, it } from 'vitest';
import {
  assertRealProductCatalog,
  findCatalogProductByBarcode,
  findCatalogProductById,
  findProductAlternatives,
  listProductCatalog,
  pickRealSampleProduct,
} from './catalog';

describe('real product catalog facade', () => {
  it('only exposes Open Food Facts-backed products with minimum evidence', () => {
    const catalog = listProductCatalog();

    expect(catalog.length).toBeGreaterThanOrEqual(12);
    expect(assertRealProductCatalog()).toBe(true);
  });

  it('resolves products by id and barcode through the same real catalog', () => {
    const product = listProductCatalog()[0];

    expect(findCatalogProductById(product.id)).toBe(product);
    expect(findCatalogProductByBarcode(product.barcode)).toBe(product);
  });

  it('chooses a real sample and real alternatives without demo sources', () => {
    const sample = pickRealSampleProduct();
    expect(sample?.sourceName).toBe('Open Food Facts');

    const lowerScoreProduct = listProductCatalog().find(
      (product) => product.score === 'D' || product.score === 'E',
    );
    if (!lowerScoreProduct) return;

    const alternatives = findProductAlternatives(lowerScoreProduct);
    expect(alternatives.every((product) => product.sourceName === 'Open Food Facts')).toBe(true);
  });
});
