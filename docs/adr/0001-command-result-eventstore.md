# ADR 0001 — Command + Result seam over an EventStore Port

Status: accepted (2026-06-17) · Phase 2, PR-1

## Context

Imperative state mutations were ad-hoc: each `src/lib/*Actions.ts` read several
Zustand stores via `getState()`, mutated them with no contract, no typed
failure, and (in `performScan` — the dead module since removed in PR-5) `throw`.
Persistence was fire-and-forget —
`mvpSync.postJson` and `supabaseRest.persistRow` swallowed errors, so a failed
write was invisible (silent data-loss risk). There was no seam to attach
cross-cutting concerns (telemetry, future retry) exactly once.

## Decision

- Every mutation is a **Command** returning a `Result<{ output, event }, AppError>`
  (railway); commands validate-then-mutate and never throw.
- All commands run through one **`executeCommand`** seam, which appends the
  domain event through an **`EventStore` Port** and **surfaces** (not swallows)
  a durability failure via `onAppendFailure` (Sentry breadcrumb). Local-first:
  the optimistic store state is kept; the gap is observed, not rolled back.
- Today `LocalEventStore` satisfies the Port (awaited BFF write → `Result`); a
  future `SupabaseEventStore` swaps in at `composition.ts` with no feature churn.
- Self-propagating gates: ESLint (`commands/**` no-`@/store`, no-`throw`) +
  dependency-cruiser (commands → ports, never adapters).

## Consequences

- (+) Failures are typed and observed; commands are testable with fake deps + a
  fake `EventStore` (see `scanProduct.test.ts`); one place for telemetry/retry.
- (+) Read-back/sync becomes an adapter change, not an interface change.
- (−) A `deps` object per command is more verbose than `getState()`. Accepted —
  it is what decouples commands from store singletons and satisfies the gate.

## Alternatives rejected

zod (bundle weight; repo already parses via branded factories) · generic command
bus / DI container (bloat for a solo maintainer) · event-sourcing as
system-of-record (stores stay the UX source of truth; events are an append log +
telemetry). Outbox / sync / read-models are **deferred**, not rejected.
