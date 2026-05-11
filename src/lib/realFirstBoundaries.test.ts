import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('real-first app boundaries', () => {
  it('keeps visible product and mission surfaces off the simulation catalog', () => {
    for (const file of [
      'src/components/scanner/ScannerPage.tsx',
      'src/components/overlays/ProductDetailModal.tsx',
      'src/components/home/HomePage.tsx',
      'src/components/map/MapPage.tsx',
      'src/store/gameStore.ts',
      'src/lib/journey.ts',
    ]) {
      const source = read(file);
      expect(source).not.toContain('@/simulation');
      expect(source).not.toContain('getProductCatalog');
      expect(source).not.toContain('getCommunityPostCatalog');
      expect(source).not.toContain('LEGACY_DAILY_MISSIONS');
    }
  });

  it('keeps demo scan code out of the default scanner import graph', () => {
    const source = read('src/components/scanner/ScannerPage.tsx');

    expect(source).not.toContain("from '@/demo/simulatedScan'");
    expect(source).not.toContain("from '@/lib/simulatedScan'");
    expect(source).toContain("import('@/demo/simulatedScan')");
  });
});

function read(file: string): string {
  return readFileSync(path.join(ROOT, file), 'utf8');
}
