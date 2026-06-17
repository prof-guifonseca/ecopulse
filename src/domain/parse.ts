import { isRecord } from '@/lib/isRecord';
import type { AppError } from '@/lib/ports/appError';
import { validationError } from '@/lib/ports/appError';
import type { Result } from '@/lib/ports/result';
import { err, ok } from '@/lib/ports/result';
import {
  asBattleId,
  asPointId,
  asPostId,
  asProductId,
  isScore,
  type BattleId,
  type PointId,
  type PostId,
  type ProductId,
  type Score,
} from '@/types';
import { isEcoPulseEventType } from './events';
import type { DataSource, EcoPulseEventPayloads, EcoPulseEventType } from './types';

/**
 * Boundary parsers (P3) — *parse, don't validate*. Every untrusted edge (an API
 * body, a persisted JSON blob) is narrowed from `unknown` into a typed value or
 * a typed failure, on the same `Result` rail commands ride (P1). The first
 * failing field annotates which key was wrong.
 *
 * Deliberately ~tiny and tree-shakeable instead of a schema library: the
 * codebase already speaks branded factories + `isScore` + `assertNever`, and
 * the PWA bundle stays lean. Composing these primitives is the idiom — never a
 * raw `as Record<…>` cast at a route (the ESLint gate forbids it).
 */
export type Parser<T> = (input: unknown) => Result<T, AppError>;

// `isRecord` is the one shape primitive — re-exported from its leaf module so
// `@/domain` and route handlers keep a single import surface for it.
export { isRecord };

export const pString: Parser<string> = (value) =>
  typeof value === 'string' ? ok(value) : err(validationError('expected a string'));

export const pNumber: Parser<number> = (value) =>
  typeof value === 'number' && Number.isFinite(value)
    ? ok(value)
    : err(validationError('expected a finite number'));

export const pBoolean: Parser<boolean> = (value) =>
  typeof value === 'boolean' ? ok(value) : err(validationError('expected a boolean'));

/** Accepts only one of the given string literals — a closed enum at the edge. */
export function pLiteral<T extends string>(...allowed: readonly T[]): Parser<T> {
  return (value) => {
    for (const candidate of allowed) {
      if (value === candidate) return ok(candidate);
    }
    return err(validationError(`expected one of: ${allowed.join(', ')}`));
  };
}

/** Lifts a parser so a missing/null field is allowed (maps to `undefined`). */
export function pOptional<T>(parser: Parser<T>): Parser<T | undefined> {
  return (value) => (value === undefined || value === null ? ok(undefined) : parser(value));
}

type ShapeOf<S> = { [K in keyof S]: S[K] extends Parser<infer T> ? T : never };

/** Parses a record field-by-field; the first failing field annotates its key. */
export function pObject<S extends Record<string, Parser<unknown>>>(shape: S): Parser<ShapeOf<S>> {
  return (value) => {
    if (!isRecord(value)) return err(validationError('expected an object'));
    const parsed: Record<string, unknown> = {};
    for (const key of Object.keys(shape) as (keyof S & string)[]) {
      const result = shape[key](value[key]);
      if (!result.ok) return err(validationError(result.error.message, key));
      parsed[key] = result.value;
    }
    return ok(parsed as ShapeOf<S>);
  };
}

export const pScore: Parser<Score> = (value) =>
  isScore(value) ? ok(value) : err(validationError('expected an eco-score (A–E)'));

/**
 * A branded-id parser: promotes an untrusted string into the branded world
 * through its factory — the single, searchable place a raw string becomes an id.
 */
function brandedId<T extends string>(make: (raw: string) => T): Parser<T> {
  return (value) =>
    typeof value === 'string' ? ok(make(value)) : err(validationError('expected an id string'));
}

export const pProductId = brandedId<ProductId>(asProductId);
export const pPointId = brandedId<PointId>(asPointId);
export const pPostId = brandedId<PostId>(asPostId);
export const pBattleId = brandedId<BattleId>(asBattleId);

const pDataSource = pLiteral<DataSource>(
  'user',
  'provider',
  'cache',
  'official',
  'simulation',
  'demo',
);

/**
 * One parser per event type, keyed so the map is exhaustive (a new
 * `EcoPulseEventType` without a parser fails to compile). Each parser produces
 * exactly the typed payload — replacing the old boolean `eventPayloadLooksValid`
 * guard, which narrowed nothing and forced a `payload as never` at the route.
 */
const PAYLOAD_PARSERS: { [T in EcoPulseEventType]: Parser<EcoPulseEventPayloads[T]> } = {
  onboarded: pObject({
    name: pString,
    tribe: pString,
    regionId: pString,
  }),
  scan_completed: pObject({
    productId: pProductId,
    barcode: pOptional(pString),
    score: pScore,
    source: pLiteral(
      'user',
      'provider',
      'cache',
      'official',
      'simulation',
      'demo',
      'barcode',
      'manual',
      'scan-action',
      'scanner',
      'first-run',
      'simulator',
    ),
  }),
  product_lookup_completed: pObject({
    barcode: pString,
    provider: pString,
    found: pBoolean,
    source: pDataSource,
    score: pOptional(pScore),
  }),
  map_visit_marked: pObject({
    pointId: pPointId,
    source: pLiteral('official', 'osm', 'cache', 'user', 'demo'),
    category: pLiteral(
      'recycling',
      'batteries',
      'electronics',
      'cooking_oil',
      'clothes',
      'repair',
      'reuse',
      'bulk',
      'compost',
    ),
    lat: pNumber,
    lng: pNumber,
    confidence: pNumber,
  }),
  esg_point_verified: pObject({
    pointId: pPointId,
    status: pLiteral('visited', 'closed', 'incorrect', 'suggested'),
    note: pOptional(pString),
  }),
  post_liked: pObject({ postId: pPostId }),
  promise_created: pObject({ postId: pPostId }),
  community_reaction_recorded: pObject({
    postId: pPostId,
    reaction: pLiteral('like', 'promise'),
    active: pBoolean,
  }),
  daily_bonus_claimed: pObject({ day: pString }),
  battle_completed: pObject({
    battleId: pBattleId,
    outcome: pLiteral('win', 'loss', 'draw'),
  }),
  impact_recorded: pObject({
    metric: pLiteral(
      'co2_kg',
      'waste_kg',
      'water_l',
      'batteries_kg',
      'oil_l',
      'repairs',
      'exchanges',
      'trees',
    ),
    value: pNumber,
    unit: pLiteral('kg', 'l', 'count'),
    confidence: pLiteral('estimated', 'verified'),
  }),
};

/**
 * The parsed event envelope — a discriminated union correlating each `type`
 * with its narrowed `payload`. Pass it straight to `createEcoPulseEvent`.
 */
export type ParsedEcoPulseEvent = {
  [T in EcoPulseEventType]: { type: T; payload: EcoPulseEventPayloads[T] };
}[EcoPulseEventType];

/**
 * Parses an untrusted `{ type, payload }` envelope at the API boundary. The lone
 * `as ParsedEcoPulseEvent` is the one place TypeScript can't express the runtime
 * correlation we just established (we parsed `payload` *with* this `type`), so it
 * is sound and isolated here — a precise, documented seam, not an `as never`.
 */
export function parseEventEnvelope(input: unknown): Result<ParsedEcoPulseEvent, AppError> {
  if (!isRecord(input)) return err(validationError('expected an event object'));
  const type = input.type;
  if (!isEcoPulseEventType(type)) return err(validationError('unknown event type', 'type'));
  const parsed = PAYLOAD_PARSERS[type](input.payload);
  if (!parsed.ok) return parsed;
  return ok({ type, payload: parsed.value } as ParsedEcoPulseEvent);
}
