import { getMissionTemplate } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { pickNextCatalogProduct, pickRealSampleProduct } from '@/lib/products/catalog';
import { scanRecordFromProduct } from '@/lib/products/scanRecord';
import type { ScanRecord } from '@/store/scanHistoryStore';

export function performDemoScan(
  recentlyScannedIds: string[],
  options: { firstRun?: boolean } = {}
): ScanRecord {
  const game = useGameStore.getState();
  const scanTemplateId = game.todaysMissionIds.find((id) => getMissionTemplate(id)?.slot === 'scan');
  const scanTemplate = getMissionTemplate(scanTemplateId);
  const product = options.firstRun
    ? pickRealSampleProduct()
    : pickNextCatalogProduct({
        recentlyScannedIds,
        minScore: scanTemplate?.filter?.minScore ?? null,
      });

  if (!product) throw new Error('Product catalog is empty.');
  return scanRecordFromProduct(product, 'demo');
}
