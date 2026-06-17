/** Shape of one Open Food Facts snapshot record. Lives in a neutral module so
 *  the curated snapshot data and the product-derivation logic don't form an
 *  import cycle. */
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
