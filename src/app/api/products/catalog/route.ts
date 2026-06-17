import { PRODUCTS, getOpenFoodFactsSnapshotMeta } from '@/data/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(
    {
      source: 'cache',
      provider: 'openfoodfacts',
      meta: getOpenFoodFactsSnapshotMeta(),
      products: PRODUCTS,
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=600',
      },
    },
  );
}
