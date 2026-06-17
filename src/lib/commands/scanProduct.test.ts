import { describe, expect, it, vi } from 'vitest';
import type { Product } from '@/types';
import type { AppError } from '@/lib/ports/appError';
import type { EcoPulseEvent } from '@/domain';
import { ok, err } from '@/lib/ports/result';
import type { CommandContext } from '@/lib/runtime/executeCommand';
import { executeCommand } from '@/lib/runtime/executeCommand';
import { scanProductCommand, type ScanProductDeps } from './scanProduct';

const fakeProduct = (over: Partial<Product> = {}): Product => ({
  id: 'p1',
  barcode: '1',
  name: 'Arroz',
  brand: '',
  category: '',
  emoji: '',
  packagingTags: [],
  isLocal: false,
  novaGroup: null,
  score: 'B',
  breakdown: { carbono: 0, embalagem: 0, reciclabilidade: 0, origem: 0 },
  tip: '',
  ...over,
});

const deps = (over: Partial<ScanProductDeps> = {}): ScanProductDeps => ({
  pickProduct: () => fakeProduct(),
  recentlyScannedIds: () => [],
  scanMinScore: () => null,
  computeTokens: () => 15,
  recordScan: vi.fn(),
  celebrate: vi.fn(),
  ...over,
});

function captureCtx() {
  const appended: EcoPulseEvent[] = [];
  const ctx: CommandContext = {
    eventStore: {
      append: async (event) => {
        appended.push(event);
        return ok(event);
      },
      list: async () => [],
    },
  };
  return { ctx, appended };
}

describe('scanProductCommand (reference) via executeCommand', () => {
  it('records the scan, celebrates, and persists a scan_completed event', async () => {
    const d = deps();
    const { ctx, appended } = captureCtx();

    const result = await executeCommand(scanProductCommand, d, undefined, ctx);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.product.id).toBe('p1');
      expect(result.value.tokens).toBe(15);
    }
    expect(d.recordScan).toHaveBeenCalledOnce();
    expect(d.celebrate).toHaveBeenCalledOnce();
    expect(appended).toHaveLength(1);
    expect(appended[0]?.type).toBe('scan_completed');
  });

  it('returns err WITHOUT mutating when the catalog is empty', async () => {
    const d = deps({ pickProduct: () => null });
    const { ctx, appended } = captureCtx();

    const result = await executeCommand(scanProductCommand, d, undefined, ctx);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('empty-catalog');
    expect(d.recordScan).not.toHaveBeenCalled();
    expect(d.celebrate).not.toHaveBeenCalled();
    expect(appended).toHaveLength(0);
  });

  it('observes (does not swallow) a persistence failure but keeps the optimistic result', async () => {
    const d = deps();
    const onAppendFailure = vi.fn();
    const persistErr: AppError = { kind: 'persistence', message: 'offline' };
    const ctx: CommandContext = {
      eventStore: { append: async () => err(persistErr), list: async () => [] },
      onAppendFailure,
    };

    const result = await executeCommand(scanProductCommand, d, undefined, ctx);

    expect(result.ok).toBe(true); // local-first: the scan still succeeded locally
    expect(onAppendFailure).toHaveBeenCalledWith(
      persistErr,
      expect.objectContaining({ type: 'scan_completed' }),
    );
  });
});
