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

  // Product cards — added in v3 for the expanded scanner catalog
  coffeeBag: 'photo-1559056199-641a0ac8b55e',
  glassBottle: 'photo-1556228720-195a672e8a03',
  paperPackage: 'photo-1607082348824-0a96f2a4b9da',
  aluminiumCan: 'photo-1622543925917-763c34d1a86e',
  plasticBottle: 'photo-1572584642822-6f8de0243c93',
  oats: 'photo-1614961233913-a5113a4a34ed',
  shampoo: 'photo-1556228453-efd6c1ff04f6',
  soap: 'photo-1600857544200-b2f666a9a2ec',
  detergent: 'photo-1583947215259-38e31be8751f',
  tshirtRack: 'photo-1620799140408-edc6dcb6d633',
  smartphone: 'photo-1511707171634-5f897ff02aa9',
  battery: 'photo-1620283085439-39620a1e21c4',
  petFood: 'photo-1601758174039-2bb37046f43c',
  diaper: 'photo-1607101212615-cdba6c91dd80',
  toothbrush: 'photo-1559591935-c6c92c6cb6b9',
  chocolate: 'photo-1606312619070-d48b4c652a52',
  milk: 'photo-1609501676725-7186f017a4b7',
  jeans: 'photo-1542272604-787c3835535d',
  oliveOil: 'photo-1474979266404-7eaacbcd87c5',
  honey: 'photo-1587049352846-4a222e784d38',
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
