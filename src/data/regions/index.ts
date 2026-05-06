import type { Region } from '@/lib/region/types';
import { LONDRINA } from './londrina';

export const REGIONS: Region[] = [LONDRINA];

export const DEFAULT_REGION_ID = 'londrina';

export function getRegion(id: string | null | undefined): Region | undefined {
  if (!id) return undefined;
  return REGIONS.find((r) => r.id === id);
}
