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

## P7 — Anonymous usage telemetry · _landed_

The only analytics a school project with minors should ship: a **local** count of
what happened, never who or what. `usageCountersStore` projects the EcoPulse
action vocabulary into `counts['YYYY-MM-DD'][key] = n` — local-first, **no
network, no external SDK, no PII**. PII is structurally impossible: `recordUsage`
takes a closed `UsageCounterKey` and stores a number — never an event payload, an
id, or any free-form string. `onboarded` (its payload carries a display name) and
`impact_recorded` are deliberately uncounted.

- Store + API: `src/store/usageCountersStore.ts` (`recordUsage`,
  `usageKeyForEventType`, `recordUsageForEventType`).
- Emission (live today): the typed `mvpSync.sync*` client wrappers bump by closed
  key. Emission (dormant): a `onCommandExecuted` hook on `CommandContext`
  (`executeCommand` → `composition.ts`) lights up once a future PR routes a live
  flow through the seam (deferred — see "How to add a feature").
- Gates: dependency-cruiser `no-external-analytics-sdks` (bans posthog/mixpanel/
  amplitude/segment/ga/plausible/… — preventive); TS closed-key signature (no
  free-form); a no-PII round-trip test (`usageCountersStore.test.ts`).

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

## How to add a feature (the realized convention) · _landed_

The convention is **tiered, not uniform** — a feature grows the parts it needs,
and each part is enforced where it exists. (We deliberately did **not** force
every folder into a `rules.ts` + `commands/` + `index.ts` triad: that would be
churn without payoff for a solo-maintained MVP.)

```
src/lib/<feature>/
  rules.ts          pure, framework-free core — when the feature has deterministic logic
  adapters/*.raw.ts external wire formats (P6) — when it talks to an open-data provider
  index.ts          public barrel — ONLY when the feature has external consumers + a stable surface
src/lib/commands/<command>.ts   event-emitting mutations (P1) live FLAT here, not per-feature
src/store/, src/lib/<x>Actions.ts   the only side-effect sites (functional core / imperative shell)
```

**Checklist:**

- Pure logic? → `rules.ts` (no React/Next/store; type-only store refs OK). Enforced by the core firewall + `pure-core-stays-pure`.
- External wire format? → `adapters/<provider>.ts` + `.raw.ts`; nothing outside `adapters/` imports a `.raw.ts` (`raw-provider-shapes-stay-in-adapters`).
- A mutation that emits a domain event? → a command in `src/lib/commands/` — deps injected, ports not adapters, no `@/store`, no `throw` (the `commands/**` gates). Run it via `executeCommand(command, deps, input, commandContext)`.
- A plain store mutation / shared reward? → a store action, or an `*Actions` module (e.g. `gameActions.awardTokens`). These stay top-level; they are cross-cutting, not feature-owned.
- External consumers + a stable surface? → add an `index.ts` barrel and **enumerate the feature** in the `no-deep-imports-into-barreled-features` depcruise rule (that enumeration is the act of declaring its public surface). Otherwise skip the barrel. The barrel re-exports the feature's types too, so type imports go through it as well — everything via `index.ts`.
- UI: read via selectors; async I/O via `useAsync` (P4) rendered with the `AsyncState` primitives (P5); gate un-hydrated reads behind `useHydrated`.

Commands currently live flat in `src/lib/commands/`; the `commands/**` ESLint +
depcruise globs already match a future per-feature `commands/`, so the nested
form is anticipated but not required today.

## Explicitly deferred (kept healthy, not enterprise)

Outbox/retry-queue · multi-device sync/read-back · persisted read-models ·
idempotency cache · real persistent identity · external analytics. All slot in
later behind `EventStore`/`composition` with no feature churn.
