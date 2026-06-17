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

## Planned (each lands with its reference + gate)

- **P3 — Boundary parse-don't-validate** (no zod): per-event parsers replacing `eventPayloadLooksValid`, + `parsePersistedState` on rehydrate. Gate: ban `as Record<string,unknown>` in API routes + `schema:check` CI drift.
- **P4 — `useAsync`** (adopts the orphaned `src/lib/net/fetchRetry.ts`). Gate: ban bare `fetch(` in client dirs.
- **P5 — Loading/Empty/Error primitives + per-segment `error.tsx`**. Gate: structural test that every `(main)` segment has an `error.tsx`.
- **P6 — Anti-Corruption Layer / Adapter** for open-data providers (Open Food Facts, ESG). Gate: depcruise — raw provider types never escape `adapters/`.
- **P7 — Telemetry on the event backbone** (anonymous, no PII; reuses `EcoPulseEvent`). Gate: TS payloads only (no free-form) + ESLint deny-list of external analytics SDKs.

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
