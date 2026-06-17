# EcoPulse — Generative pattern playbook

Companion to `docs/ARCHITECTURE.md`. That file lists the **defensive** rules
(what you may not do, and which gate stops you). This file lists the
**generative** patterns: how to build a feature and move data with confidence,
so the prototype grows into a healthy operable MVP. Scope is **phased
local-first**: build the patterns on the current local-first architecture now,
with a backbone designed so a future multi-user backend slots in later — without
implementing sync/read-models/outbox/real-identity yet.

Each pattern, like the defensive rules, ships with a **reference implementation
and a self-propagating gate** (TS / ESLint / dependency-cruiser / test / CI).

## P1 — Command + Result (railway) · _landed_

A state mutation is a **Command**: `(deps, input) => Result<{ output, event }, AppError>`.
It receives its dependencies injected (store actions + pure helpers — never
imports `@/store`), **validates fully before mutating** (returns `err` before any
state change, so no rollback is needed), and returns the domain event to record.
No exception crosses the command boundary.

- Types: `src/lib/ports/result.ts`, `src/lib/ports/appError.ts`
- Seam: `src/lib/runtime/executeCommand.ts` (the one place every mutation flows through)
- Reference: `src/lib/commands/scanProduct.ts` (+ `scanProduct.test.ts`)
- Gates: ESLint `commands/**` may not import `@/store` and may not `throw`; TS — `Result`/`AppError` are exhaustive via `assertNever`.

## P2 — Repository / Port (`EventStore`) · _landed_

The sync-ready persistence seam. Commands record events through the **`EventStore`
Port**, not a concrete store. Today `LocalEventStore` (awaits the BFF write and
returns a `Result` — replacing the old fire-and-forget that swallowed failures)
satisfies it; later a `SupabaseEventStore` adapter replaces it at the one
composition point (`src/lib/runtime/composition.ts`) with zero feature churn.
`EventStore.list()` exists from day one so read-back/sync is an adapter change.

- Interface: `src/lib/ports/eventStore.ts`
- Adapter (now): `src/lib/persistence/local/localEventStore.ts`
- Gate: dependency-cruiser `commands-use-ports-not-adapters` (commands import ports, never `persistence/**` or `backend/**`).

## P3 — Boundary parse-don't-validate · _landed_

Every untrusted edge (an API body, a persisted JSON blob) is **parsed** into a
typed value or a typed `AppError` — never cast. A tiny tree-shakeable combinator
(`Parser<T> = (unknown) => Result<T, AppError>`, ~60 lines) composes primitives
into one parser per event type; `parseEventEnvelope` narrows `{ type, payload }`
at the route, replacing the old boolean `eventPayloadLooksValid` (which narrowed
nothing and forced a `payload as never`). Deliberately **not zod** — the repo
already speaks branded factories + `isScore` + `assertNever`, and the PWA bundle
stays lean. The rehydration boundary (`parsePersistedState`) discards any blob
that isn't a `{ state }` envelope, so a malformed shape never reaches a store.

- Combinator + parsers: `src/domain/parse.ts` (`isRecord` leaf: `src/lib/isRecord.ts`)
- References: `src/app/api/events/route.ts` (`parseEventEnvelope`); the five other
  `api/**` handlers use the `isRecord` boundary guard; `src/store/storage.ts`
  (`parsePersistedState`)
- Gates: ESLint bans `as Record<…>` in `src/app/api/**`; `npm run schema:check`
  (code-written tables ⊆ migration tables); round-trip test (`parse.test.ts`).

## P4 — `useAsync` + client fetch discipline · _landed_

Every client→BFF call goes through one state machine with retry + cancellation,
never a bare `fetch(`. `useAsync(task, { onError })` wraps a task in
loading/success/error state with an AbortController that cancels the previous run
and aborts on unmount (a late response never sets state on a gone component; an
aborted run is a no-op, not an error). The task pairs with `fetchWithRetry`
(previously orphaned — used only by server adapters).

**Retry policy — retry reads, not writes.** Retry is enabled on the idempotent
**GET**s (`ScannerPage` product lookup, `MapPage` ESG places). The **POST** sync
calls (`mvpSync`, `localEventStore`) go through `fetchWithRetry` for the single
uniform client fetch path but with `retries: 0`, because they are **not
idempotent under retry yet**: the routes re-mint `at` via `createEcoPulseEvent`
(and comments a fresh UUID), so a retried POST would land a duplicate row /
double-count impact. Safe write-retry waits on a client idempotency key
(deferred). This is why `fetchWithRetry` takes a `retries` option.

- Hook: `src/hooks/useAsync.ts`
- References: `ScannerPage` barcode lookup (via `useAsync`, retried); `MapPage`
  ESG fetch (retried); `mvpSync` + `localEventStore` POSTs (`fetchWithRetry`,
  `retries: 0`).
- Gate: ESLint bans bare `fetch(` in client dirs (`components/**`, `hooks/**`,
  `lib/client/**`, `lib/persistence/**`); `fetchWithRetry(fetch, …)` is allowed
  (the `fetch` is an argument). Server code (`lib/backend`, `lib/esg`,
  `lib/products`, `app/api`) is out of scope.

## Planned (each lands with its reference + gate)

- **P7 — Telemetry on the event backbone** (anonymous, no PII; reuses `EcoPulseEvent`). Gate: TS payloads only (no free-form) + ESLint deny-list of external analytics SDKs.

## P5 — Async-state presentation primitives · _landed_

Loading, empty, and error look and read the same everywhere instead of being
hand-rolled per page. Three pure presentational primitives —
`Loading` / `EmptyState` / `ErrorState` (`src/components/ui/AsyncState.tsx`,
props-only, no store, so they compose into both server boundaries and client
features). Hydration-gated screens render a skeleton until the persisted stores
rehydrate (the existing `useHydrated`), so the UI never flashes pre-hydration
store defaults.

- Primitives: `src/components/ui/AsyncState.tsx`
- References: `(main)/loading.tsx` + `(main)/error.tsx` (the group boundaries;
  `error.tsx` now also reports to Sentry); `ProfilePage` hydration skeleton;
  `EmptyState` on the Scanner catalog + Map filtered list.
- Boundaries are GROUP-level by design — every `(main)` page is a thin client
  component with no server-side data fetch, so per-segment `error.tsx`/`loading.tsx`
  would be inert files. The gate freezes the shared pair instead.
- Gates: structural test that the `(main)` group keeps `error.tsx` + `loading.tsx`
  (`src/app/(main)/boundaries.test.ts`); the a11y suite waits for hydration
  (`aria-busy` clear) so it scans the settled UI deterministically.

## P6 — Anti-Corruption Layer / Adapter (open data) · _landed_

Each open-data provider talks to us in its own wire format; we never let that
format leak inward. The raw shapes live in `adapters/*.raw.ts` (provider
warts and all), and the adapter is the **only** module that fetches, narrows,
and translates them into a domain type. Callers receive `ProductLookupResult` /
`EnvironmentalPoint` / `GeocodedPlace` — never the provider shape. A provider
changing its JSON is now a one-file edit.

- Products: `src/lib/products/adapters/openFoodFacts.ts` (+ `.raw.ts`) — `fetchOpenFoodFactsProduct` / `normalizeOpenFoodFactsProduct`; `productLookup.ts` is a thin orchestrator (cache → adapter → catalog → unknown).
- ESG: `src/lib/esg/adapters/openStreetMap.ts` (+ `.raw.ts`) — `normalizeOverpassResponse` accepts `unknown` so the Overpass provider never names the raw type; `src/lib/esg/adapters/nominatim.ts` (+ `.raw.ts`) — `geocodePlace`.
- Gate: dependency-cruiser `raw-provider-shapes-stay-in-adapters` — nothing outside `adapters/` may import a `*.raw.ts`; golden-fixture tests (`openStreetMap.test.ts`, `productLookup.test.ts`).

## How to add a feature (target shape — finalized in P5)

```
src/lib/<feature>/
  rules.ts        pure, framework-free (the functional core)
  commands/*.ts   imperative orchestration (P1), deps injected
  index.ts        barrel (the public surface)
```
UI calls `executeCommand(<command>, deps, input, commandContext)`; reads come
from selectors; async I/O goes through `useAsync` (P4) rendered with the
async-state primitives (P5).

## Explicitly deferred (kept healthy, not enterprise)

Outbox/retry-queue · multi-device sync/read-back · persisted read-models ·
idempotency cache · real persistent identity · external analytics. All slot in
later behind `EventStore`/`composition` with no feature churn.
