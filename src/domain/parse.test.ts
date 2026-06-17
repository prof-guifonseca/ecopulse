import { describe, expect, it } from 'vitest';
import { asProductId } from '@/types';
import { createEcoPulseEvent } from './events';
import {
  isRecord,
  parseEventEnvelope,
  pLiteral,
  pNumber,
  pObject,
  pOptional,
  pString,
} from './parse';

describe('parse combinators', () => {
  it('isRecord accepts plain objects and rejects arrays/null/primitives', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord('x')).toBe(false);
  });

  it('pString / pNumber narrow or fail with a typed AppError', () => {
    expect(pString('hi')).toEqual({ ok: true, value: 'hi' });
    const bad = pNumber('nope');
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.kind).toBe('validation');
    expect(pNumber(Number.NaN).ok).toBe(false);
  });

  it('pLiteral accepts only the listed members', () => {
    const parse = pLiteral('a', 'b');
    expect(parse('a')).toEqual({ ok: true, value: 'a' });
    expect(parse('c').ok).toBe(false);
  });

  it('pObject annotates the first failing field with its key', () => {
    const parse = pObject({ name: pString, age: pNumber, nick: pOptional(pString) });
    const ok = parse({ name: 'Ada', age: 36 });
    expect(ok).toEqual({ ok: true, value: { name: 'Ada', age: 36, nick: undefined } });

    const fail = parse({ name: 'Ada', age: 'old' });
    expect(fail.ok).toBe(false);
    if (!fail.ok) {
      expect(fail.error.kind).toBe('validation');
      if (fail.error.kind === 'validation') expect(fail.error.field).toBe('age');
    }
  });
});

describe('parseEventEnvelope', () => {
  it('round-trips a created event back into its parsed envelope', () => {
    const event = createEcoPulseEvent({
      type: 'scan_completed',
      payload: {
        productId: asProductId('off:7891000000001'),
        barcode: '7891000000001',
        score: 'B',
        source: 'barcode',
      },
    });

    const parsed = parseEventEnvelope({ type: event.type, payload: event.payload });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.type).toBe('scan_completed');
      expect(parsed.value.payload).toEqual(event.payload);
    }
  });

  it('parses every event type from a representative payload', () => {
    const cases: { type: string; payload: unknown }[] = [
      { type: 'onboarded', payload: { name: 'Ana', tribe: 'verde', regionId: 'londrina' } },
      {
        type: 'scan_completed',
        payload: { productId: 'p1', score: 'A', source: 'scan-action' },
      },
      {
        type: 'product_lookup_completed',
        payload: { barcode: '789', provider: 'openfoodfacts', found: true, source: 'provider' },
      },
      {
        type: 'map_visit_marked',
        payload: {
          pointId: 'pt1',
          source: 'osm',
          category: 'batteries',
          lat: -23.3,
          lng: -51.1,
          confidence: 80,
        },
      },
      { type: 'esg_point_verified', payload: { pointId: 'pt1', status: 'visited' } },
      { type: 'post_liked', payload: { postId: 'post1' } },
      { type: 'promise_created', payload: { postId: 'post1' } },
      {
        type: 'community_reaction_recorded',
        payload: { postId: 'post1', reaction: 'like', active: true },
      },
      { type: 'daily_bonus_claimed', payload: { day: '2026-06-17' } },
      { type: 'battle_completed', payload: { battleId: 'b1', outcome: 'win' } },
      {
        type: 'impact_recorded',
        payload: { metric: 'co2_kg', value: 1.5, unit: 'kg', confidence: 'estimated' },
      },
    ];

    for (const sample of cases) {
      const parsed = parseEventEnvelope(sample);
      expect(parsed.ok, `${sample.type} should parse`).toBe(true);
    }
  });

  it('rejects an unknown event type, annotating the `type` field', () => {
    const parsed = parseEventEnvelope({ type: 'nope', payload: {} });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok && parsed.error.kind === 'validation') {
      expect(parsed.error.field).toBe('type');
    }
  });

  it('rejects a malformed payload (missing required field)', () => {
    const parsed = parseEventEnvelope({ type: 'post_liked', payload: { id: 'post1' } });
    expect(parsed.ok).toBe(false);
    if (!parsed.ok && parsed.error.kind === 'validation') {
      expect(parsed.error.field).toBe('postId');
    }
  });

  it('rejects a non-object envelope', () => {
    expect(parseEventEnvelope(null).ok).toBe(false);
    expect(parseEventEnvelope('event').ok).toBe(false);
    expect(parseEventEnvelope([]).ok).toBe(false);
  });
});
