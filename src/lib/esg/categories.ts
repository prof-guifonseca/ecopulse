import type { MapPointType, RealImpact } from '@/types';
import type { EnvironmentalCategory, EnvironmentalPoint, EnvironmentalPointSource } from './types';

export const ENVIRONMENTAL_CATEGORIES: EnvironmentalCategory[] = [
  'recycling',
  'batteries',
  'electronics',
  'cooking_oil',
  'clothes',
  'repair',
  'reuse',
  'bulk',
  'compost',
];

export const ENVIRONMENTAL_CATEGORY_LABELS: Record<EnvironmentalCategory, string> = {
  recycling: 'Reciclagem',
  batteries: 'Baterias',
  electronics: 'Eletrônicos',
  cooking_oil: 'Óleo',
  clothes: 'Roupas',
  repair: 'Reparo',
  reuse: 'Reuso',
  bulk: 'Granel',
  compost: 'Compostagem',
};

export const ENVIRONMENTAL_CATEGORY_DETAIL_LABELS: Record<EnvironmentalCategory, string> = {
  recycling: 'Ponto de Reciclagem',
  batteries: 'Descarte de Baterias',
  electronics: 'Reciclagem Eletrônica',
  cooking_oil: 'Coleta de Óleo',
  clothes: 'Doação / Roupas',
  repair: 'Reparo / Conserto',
  reuse: 'Reuso / Segunda mão',
  bulk: 'Compra a Granel',
  compost: 'Compostagem',
};

export const ENVIRONMENTAL_CATEGORY_ICON: Record<EnvironmentalCategory, string> = {
  recycling: 'recycle',
  batteries: 'battery',
  electronics: 'cpu',
  cooking_oil: 'droplet',
  clothes: 'shirt',
  repair: 'hammer',
  reuse: 'recycle',
  bulk: 'leaf',
  compost: 'trees',
};

export const ENVIRONMENTAL_SOURCE_LABELS: Record<EnvironmentalPointSource, string> = {
  official: 'Snapshot oficial',
  osm: 'OpenStreetMap',
  cache: 'Cache',
  user: 'Comunidade',
  demo: 'Demo',
};

export const MAP_POINT_TYPE_TO_ENVIRONMENTAL_CATEGORY: Record<MapPointType, EnvironmentalCategory> =
  {
    baterias: 'batteries',
    eletronicos: 'electronics',
    oleo: 'cooking_oil',
    trocas: 'reuse',
    granel: 'bulk',
    reparo: 'repair',
  };

const ENVIRONMENTAL_CATEGORY_TO_MAP_POINT_TYPE: Partial<
  Record<EnvironmentalCategory, MapPointType>
> = {
  batteries: 'baterias',
  electronics: 'eletronicos',
  cooking_oil: 'oleo',
  clothes: 'trocas',
  repair: 'reparo',
  reuse: 'trocas',
  bulk: 'granel',
};

export function mapPointTypeToEnvironmentalCategory(type: MapPointType): EnvironmentalCategory {
  return MAP_POINT_TYPE_TO_ENVIRONMENTAL_CATEGORY[type];
}

export function environmentalCategoryToMapPointType(
  category: EnvironmentalCategory,
): MapPointType | null {
  return ENVIRONMENTAL_CATEGORY_TO_MAP_POINT_TYPE[category] ?? null;
}

export function mapPointTypeForEnvironmentalPoint(point: EnvironmentalPoint): MapPointType | null {
  return point.legacyMapPointType ?? environmentalCategoryToMapPointType(point.category);
}

export function environmentalImpactDeltaForPoint(point: EnvironmentalPoint): Partial<RealImpact> {
  switch (point.category) {
    case 'batteries':
      return { batteriesKgEstimated: 0.5 };
    case 'cooking_oil':
      return { oilLitersEstimated: 1 };
    case 'repair':
      return { repairsCount: 1 };
    case 'reuse':
    case 'clothes':
      return { exchangesCount: 1 };
    default:
      return {};
  }
}
