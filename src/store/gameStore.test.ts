import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

describe('gameStore recordScanProgress', () => {
  beforeEach(() => {
    useGameStore.setState({
      scannedProducts: [],
      dailyMissions: { scan: false, likes: 0, map: false, bonusClaimed: false },
    });
  });

  it('records the scanned product and marks the scan mission together', () => {
    useGameStore.getState().recordScanProgress('product-1', true);
    const state = useGameStore.getState();

    expect(state.scannedProducts).toContain('product-1');
    expect(state.dailyMissions.scan).toBe(true);
  });

  it('records the scanned product without touching the mission when not requested', () => {
    useGameStore.getState().recordScanProgress('product-1', false);
    const state = useGameStore.getState();

    expect(state.scannedProducts).toContain('product-1');
    expect(state.dailyMissions.scan).toBe(false);
  });

  it('does not duplicate an already-scanned product id', () => {
    useGameStore.getState().recordScanProgress('product-1', true);
    useGameStore.getState().recordScanProgress('product-1', false);
    const state = useGameStore.getState();

    expect(state.scannedProducts).toEqual(['product-1']);
    // The mission flag, once set, is not cleared by a later no-op call.
    expect(state.dailyMissions.scan).toBe(true);
  });

  it('preserves other dailyMissions fields when marking the scan mission', () => {
    useGameStore.setState({
      dailyMissions: { scan: false, likes: 3, map: true, bonusClaimed: false },
    });
    useGameStore.getState().recordScanProgress('product-2', true);
    const state = useGameStore.getState();

    expect(state.dailyMissions).toEqual({ scan: true, likes: 3, map: true, bonusClaimed: false });
  });
});
