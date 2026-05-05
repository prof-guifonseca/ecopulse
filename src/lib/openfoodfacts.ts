/**
 * Thin client for the Open Food Facts public API. No API key, no auth.
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 *
 * Used by the v2 scanner to look up real products by barcode (EAN-13 etc.).
 * We pull only the fields we need and normalize them into a flat shape so
 * the rest of the app doesn't have to know about OFF's wide schema.
 */

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

const FIELDS = [
  'product_name',
  'brands',
  'image_small_url',
  'image_url',
  'categories_tags',
  'nova_group',
  'ecoscore_grade',
  'ecoscore_score',
  'nutriscore_grade',
  'packaging',
  'packaging_tags',
  'origins',
  'manufacturing_places',
  'countries_tags',
  'labels_tags',
].join(',');

export interface OffProduct {
  /** Barcode the lookup was made with — useful for caching keys. */
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  category: string | null;
  /** 1–4 (1 unprocessed, 4 ultra-processed); null when OFF doesn't know. */
  novaGroup: 1 | 2 | 3 | 4 | null;
  /** Capital A–E from OFF; null when not assessed. */
  ecoscoreGrade: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  /** 0–100 raw OFF score; mostly informational. */
  ecoscoreScore: number | null;
  packaging: string | null;
  packagingTags: string[];
  origins: string | null;
  manufacturingPlaces: string | null;
  /** ISO-style country tag list (e.g. ['en:brazil']). */
  countries: string[];
  labels: string[];
}

interface OffApiResponse {
  status: 0 | 1;
  status_verbose?: string;
  product?: Record<string, unknown>;
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function asNova(value: unknown): OffProduct['novaGroup'] {
  const n = typeof value === 'number' ? value : Number(value);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

function asEcoscoreGrade(value: unknown): OffProduct['ecoscoreGrade'] {
  const s = typeof value === 'string' ? value.toUpperCase() : null;
  if (s === 'A' || s === 'B' || s === 'C' || s === 'D' || s === 'E') return s;
  return null;
}

function asEcoscoreScore(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function deriveCategory(p: Record<string, unknown>): string | null {
  const tags = asStringArray(p.categories_tags);
  if (tags.length === 0) return null;
  // Prefer the most specific tag (last in the list) and strip the language prefix.
  const last = tags[tags.length - 1];
  return last.includes(':') ? last.split(':').pop()!.replace(/-/g, ' ') : last;
}

/**
 * Fetch + normalize a product by barcode. Returns null when OFF reports
 * no product (status: 0) and throws on transport errors.
 */
export async function fetchOffProduct(
  barcode: string,
  init?: { signal?: AbortSignal }
): Promise<OffProduct | null> {
  const url = `${BASE_URL}/product/${encodeURIComponent(barcode)}?fields=${FIELDS}`;
  const res = await fetch(url, {
    signal: init?.signal,
    headers: { Accept: 'application/json' },
    // OFF caches well at the edge — let the browser do its job.
    cache: 'force-cache',
  });
  if (!res.ok) {
    throw new Error(`OFF responded ${res.status}`);
  }
  const data = (await res.json()) as OffApiResponse;
  if (data.status === 0 || !data.product) return null;
  const p = data.product;

  return {
    barcode,
    name: asString(p.product_name) ?? 'Produto sem nome',
    brand: asString(p.brands),
    imageUrl: asString(p.image_small_url) ?? asString(p.image_url),
    category: deriveCategory(p),
    novaGroup: asNova(p.nova_group),
    ecoscoreGrade: asEcoscoreGrade(p.ecoscore_grade),
    ecoscoreScore: asEcoscoreScore(p.ecoscore_score),
    packaging: asString(p.packaging),
    packagingTags: asStringArray(p.packaging_tags),
    origins: asString(p.origins),
    manufacturingPlaces: asString(p.manufacturing_places),
    countries: asStringArray(p.countries_tags),
    labels: asStringArray(p.labels_tags),
  };
}
