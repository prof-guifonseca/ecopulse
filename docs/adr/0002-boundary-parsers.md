# ADR 0002 — Boundary parsers (parse-don't-validate, no zod)

Status: accepted (2026-06-17) · Phase 2, PR-2a

## Context

Untrusted input crossed our boundaries as casts, not parses:

- API routes did `(await request.json()) as Record<string, unknown>`, then picked
  fields with ad-hoc `typeof` checks. The events route validated with
  `eventPayloadLooksValid` — a **boolean** that narrowed nothing, forcing a
  `payload as never` into `createEcoPulseEvent`.
- `storage.ts` rehydrated any well-formed JSON regardless of shape, so a corrupt
  or foreign blob could flow into a store.

A cast asserts a type the runtime never checked — exactly the class of bug
parse-don't-validate removes.

## Decision

- A tiny, tree-shakeable combinator (`Parser<T> = (unknown) => Result<T, AppError>`,
  ~60 lines in `src/domain/parse.ts`) composes primitives (`pString`, `pNumber`,
  `pLiteral`, `pOptional`, `pObject`, branded-id + `pScore`) into **one parser per
  event type**. `parseEventEnvelope` narrows `{ type, payload }` at the route on
  the same `Result` rail commands ride (P1).
- The five other `api/**` handlers adopt an `isRecord(body)` boundary guard,
  killing the `as Record<…>` cast while keeping their field checks.
- `parsePersistedState` discards any persisted blob that isn't a `{ state }`
  envelope; field drift remains each store's versioned `migrate`'s job.
- Self-propagating gates: ESLint bans `as Record<…>` in `src/app/api/**`;
  `npm run schema:check` asserts the tables `buildSupabaseRow` writes are a
  subset of the SQL migration's; a round-trip test covers `parse.ts`.

## Consequences

- (+) Malformed input fails as a typed `AppError` at the edge, not as a wrong
  type deep inside; `eventPayloadLooksValid` and its `payload as never` are gone.
- (+) `isRecord` lives in a leaf (`src/lib/isRecord.ts`) so the store can guard
  rehydration without importing `@/domain` (which transitively reaches the store
  → would cycle).
- (−) One documented `as ParsedEcoPulseEvent` remains in `parseEventEnvelope`:
  TypeScript can't express the runtime type/payload correlation we just
  established. It is sound, isolated, and far narrower than the `as never` it
  replaces.

## Alternatives rejected

zod / valibot (bundle weight on a PWA; the repo already parses via branded
factories + `isScore` + `assertNever`). A SQL-parsing `schema:check` (overkill —
the `events` table is `jsonb`, so there are no per-type columns to drift against;
a table-set string assertion is the honest, enforceable check). Full per-store
state validation on rehydrate (deferred — migrations own field drift; this guard
only rejects a structurally broken envelope).
