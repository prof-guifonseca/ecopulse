import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUTPUT = path.join(process.cwd(), 'src', 'data', 'openFoodFactsProducts.ts');
const MAX_PRODUCTS = Number(process.env.OFF_SNAPSHOT_LIMIT ?? 32);
const PAGE_SIZE = Math.max(40, MAX_PRODUCTS * 2);
const USER_AGENT =
  process.env.OPEN_FOOD_FACTS_USER_AGENT ??
  'EcoPulse/0.1 (+https://github.com/prof-guifonseca/ecopulse)';

const FIELDS = [
  'code',
  'product_name',
  'product_name_pt',
  'brands',
  'categories',
  'categories_tags',
  'packaging',
  'packaging_tags',
  'countries_tags',
  'nova_group',
  'ecoscore_grade',
  'image_front_url',
].join(',');

const SNAPSHOT_URL = new URL('https://world.openfoodfacts.org/api/v2/search');
SNAPSHOT_URL.searchParams.set('countries_tags_en', 'Brazil');
SNAPSHOT_URL.searchParams.set('fields', FIELDS);
SNAPSHOT_URL.searchParams.set('page_size', String(PAGE_SIZE));
SNAPSHOT_URL.searchParams.set('sort_by', 'popularity_key');

const text = await fetchSnapshotText();
if (!text.trim().startsWith('{')) {
  throw new Error('Open Food Facts returned a non-JSON response.');
}

const payload = JSON.parse(text);
const products = [];
const seen = new Set();

for (const product of payload.products ?? []) {
  const normalized = normalizeProduct(product);
  if (!normalized || seen.has(normalized.code)) continue;
  seen.add(normalized.code);
  products.push(normalized);
  if (products.length >= MAX_PRODUCTS) break;
}

if (products.length < 12) {
  throw new Error(`Only ${products.length} products met the evidence threshold.`);
}

const generatedAt = new Date().toISOString();
const file = `import type { OpenFoodFactsSnapshotProduct } from './products';

export const OPEN_FOOD_FACTS_SNAPSHOT_META = {
  sourceName: 'Open Food Facts',
  sourceUrl: '${SNAPSHOT_URL.toString()}',
  generatedAt: '${generatedAt}',
  license: 'Open Database License / Open Food Facts',
} as const;

export const OPEN_FOOD_FACTS_PRODUCTS = ${JSON.stringify(products, null, 2)} as const satisfies readonly OpenFoodFactsSnapshotProduct[];
`;

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, file, 'utf8');
console.log(`Wrote ${products.length} Open Food Facts products to ${OUTPUT}`);

async function fetchSnapshotText() {
  let lastStatus = 0;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(SNAPSHOT_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });
    lastStatus = response.status;
    if (response.ok) return response.text();
    await new Promise((resolve) => setTimeout(resolve, attempt * 2500));
  }
  throw new Error(`Open Food Facts search failed with ${lastStatus}`);
}

function normalizeProduct(product) {
  const code = String(product.code ?? '').replace(/\D/g, '');
  const productName = clean(product.product_name_pt || product.product_name);
  const brand = clean(String(product.brands ?? '').split(',')[0]);
  const categories = clean(product.categories);
  const categoriesTags = normalizeTags(product.categories_tags);
  const packagingTags = normalizeTags(product.packaging_tags);
  const countriesTags = normalizeTags(product.countries_tags);
  const novaGroup = [1, 2, 3, 4].includes(product.nova_group) ? product.nova_group : null;
  const ecoscoreGrade = clean(product.ecoscore_grade)?.toLowerCase() || null;
  const imageUrl = clean(product.image_front_url);

  const evidenceFields = [
    packagingTags.length > 0 || clean(product.packaging) ? 'packaging' : null,
    novaGroup ? 'nova_group' : null,
    ecoscoreGrade && !['unknown', 'not-applicable'].includes(ecoscoreGrade)
      ? 'ecoscore_grade'
      : null,
    imageUrl ? 'image_front_url' : null,
    countriesTags.includes('brazil') ? 'countries_tags' : null,
  ].filter(Boolean);

  if (!/^\d{8,14}$/.test(code)) return null;
  if (!productName || !brand || !categories) return null;
  if (!countriesTags.includes('brazil')) return null;
  if (evidenceFields.length < 3) return null;

  return {
    code,
    productName,
    brand,
    categories,
    categoriesTags,
    packaging: clean(product.packaging),
    packagingTags,
    countriesTags,
    novaGroup,
    ecoscoreGrade,
    imageUrl: imageUrl || undefined,
    sourceUrl: `https://world.openfoodfacts.org/product/${code}`,
    evidenceFields,
  };
}

function normalizeTags(values) {
  return (values ?? [])
    .flatMap((value) => String(value).split(','))
    .map((value) =>
      value
        .trim()
        .toLowerCase()
        .replace(/^(en|pt|fr|es):/, ''),
    )
    .filter(Boolean);
}

function clean(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}
