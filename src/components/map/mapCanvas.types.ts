import type { EnvironmentalPoint } from '@/lib/esg';
import type { Region } from '@/lib/region/types';

/** Props shared by MapCanvas and its client implementation (lives in a neutral
 *  module so the two don't form an import cycle). */
export interface MapCanvasProps {
  region: Region;
  points: EnvironmentalPoint[];
  visitedPointIds: string[];
  focusCenter?: { lat: number; lng: number };
  onSelectPoint: (point: EnvironmentalPoint) => void;
}
