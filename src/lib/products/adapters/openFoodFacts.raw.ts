/**
 * Raw Open Food Facts response shapes (P6 — anti-corruption layer). These mirror
 * the provider's wire format, warts and all (snake_case, everything optional).
 * They are an adapter-private concern: the dependency-cruiser gate
 * `raw-provider-shapes-stay-in-adapters` forbids importing this module from
 * anywhere outside `adapters/`. The rest of the app sees only the domain
 * `ProductLookupResult` the adapter returns.
 */
export interface OpenFoodFactsProduct {
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

export interface OpenFoodFactsResponse {
  code?: string;
  status?: number;
  product?: OpenFoodFactsProduct;
}
