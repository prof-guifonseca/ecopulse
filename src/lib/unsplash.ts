/**
 * Unsplash photo registry + URL helper.
 *
 * Each photo is curated for a sustainable-lifestyle theme (urban gardens,
 * upcycling, repair, plant-based food, recycling, second-hand fashion, etc.).
 * Photos are referenced by short keys so data files (feed posts, stories)
 * stay readable and changes can be made in one place.
 *
 * URLs use Unsplash's image CDN with format=auto + fit=crop, so each call
 * site can request the dimensions it actually needs without re-downloading
 * the original.
 */
export const UNSPLASH_PHOTOS = {
  // Urban gardens / vertical farming / homegrown vegetables
  urbanGarden: 'photo-1466692476868-aef1dfb1e735',
  vegetables: 'photo-1488459716781-31db52582fe9',

  // Upcycling / DIY / craft
  upcyclingCrafts: 'photo-1567361808960-dec9cb578182',
  ceramics: 'photo-1611464419988-1cab3e6e8d96',
  repairCafe: 'photo-1581090464777-f3220bbe1b8b',

  // Composting / organic
  composting: 'photo-1542838132-92c53300491e',

  // Bulk / zero-waste shopping / refill stores
  bulkShopping: 'photo-1604719312566-8912e9227c6a',
  refillStore: 'photo-1610701596007-11502861dcfa',
  reusableBags: 'photo-1573497019418-b400bb3ab074',

  // Recycling / e-waste / battery disposal
  recyclingBins: 'photo-1532996122724-e3c354a0b15b',
  eWaste: 'photo-1606170033648-5d55a3edf314',

  // Plant-based food / cooking / market
  freshProduce: 'photo-1610348725531-843dff563e2c',

  // Cycling / sustainable mobility
  bicycle: 'photo-1485965120184-e220f721d03e',

  // Second-hand fashion / clothing swap
  vintageFashion: 'photo-1490481651871-ab68de25d43d',
  clothingRack: 'photo-1567401893414-76b7b1e5a7a5',

  // Forest / nature / outdoor / hiking
  forest: 'photo-1441974231531-c6227db76b6e',
  beachCleanup: 'photo-1530514126434-0d56eda64a2c',
} as const;

export type UnsplashKey = keyof typeof UNSPLASH_PHOTOS;

interface UnsplashOpts {
  w?: number;
  h?: number;
  q?: number;
  /** crop direction; defaults to entropy for content-aware framing */
  crop?: 'entropy' | 'center' | 'top' | 'bottom' | 'edges' | 'faces';
}

export function unsplashUrl(key: UnsplashKey, opts: UnsplashOpts = {}): string {
  const id = UNSPLASH_PHOTOS[key];
  const params = new URLSearchParams({
    auto: 'format',
    fit: 'crop',
    crop: opts.crop ?? 'entropy',
    q: String(opts.q ?? 78),
    w: String(opts.w ?? 800),
  });
  if (opts.h) params.set('h', String(opts.h));
  return `https://images.unsplash.com/${id}?${params.toString()}`;
}
