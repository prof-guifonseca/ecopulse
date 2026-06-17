import { describe, expect, it } from 'vitest';
import { asProductId } from '@/types';
import { createEcoPulseEvent, isEcoPulseEventType } from './events';

describe('EcoPulse domain events', () => {
  it('creates an audit event with stable day and source metadata', () => {
    const event = createEcoPulseEvent({
      type: 'scan_completed',
      at: '2026-05-11T09:00:00.000Z',
      source: 'provider',
      payload: {
        productId: asProductId('off:7891000000001'),
        barcode: '7891000000001',
        score: 'B',
        source: 'barcode',
      },
    });

    expect(event.id).toMatch(/^evt_/);
    expect(event.day).toBe('2026-05-11');
    expect(event.source).toBe('provider');
  });

  it('recognises known event types and rejects unknown ones', () => {
    expect(isEcoPulseEventType('map_visit_marked')).toBe(true);
    expect(isEcoPulseEventType('unknown')).toBe(false);
  });
});
