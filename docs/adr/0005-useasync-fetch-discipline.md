# ADR 0005 — useAsync + client fetch discipline

Status: accepted (2026-06-17) · Phase 2, PR-3b

## Context

Client→BFF calls were bare `fetch()` with divergent handling: `MapPage` a
4-value status machine, `ScannerPage` an ad-hoc boolean + string (and no
AbortController, so a late lookup could set state after unmount or after a newer
scan), `mvpSync.postJson` a fire-and-forget that silently swallowed failures,
`localEventStore` an awaited write with no retry. `fetchWithRetry`
(`src/lib/net/fetchRetry.ts`) existed but was orphaned — used only by the
server-side open-data adapters, never on the client hop, so a transient client
network blip was never retried.

## Decision

- One client async state machine: `useAsync(task, { onError })`
  (`src/hooks/useAsync.ts`) — loading/success/error + an AbortController that
  cancels the previous run and aborts on unmount; an aborted run is a no-op, not
  an error. The task receives the signal and pairs with `fetchWithRetry(fetch,
  url, { signal })`.
- Adopt it: `ScannerPage` runs its barcode lookup through `useAsync` (gaining the
  cancellation it lacked). `MapPage` routes its ESG fetch through `fetchWithRetry`.
- **Retry reads, not writes.** Retry is enabled only on the idempotent GETs
  (product lookup, ESG places). The POST sync calls (`mvpSync`, `localEventStore`)
  go through `fetchWithRetry` with `retries: 0`: an adversarial review caught that
  retrying them would **duplicate** rows — `createEcoPulseEvent` mints a
  server-fresh `at` (so `stableEventId` differs across retries) and
  `/api/community/comments` mints a fresh UUID, so the merge-duplicates upsert /
  id-dedup do **not** collapse a retried write (and `/api/esg/visits` would
  double-count impact). They still use the wrapper for the one uniform client
  fetch path; safe write-retry waits on a client idempotency key.
- Self-propagating gate: ESLint bans bare `fetch(` in client dirs
  (`components/**`, `hooks/**`, `lib/client/**`, `lib/persistence/**`).
  `fetchWithRetry(fetch, …)` passes (the `fetch` is an argument, not a call).
  Server dirs are out of scope. The `.tsx` half of the rule is co-located with
  the className rule because flat-config replaces — not merges —
  `no-restricted-syntax` per file.

## Consequences

- (+) One uniform client fetch path; reads get retry + cancellation; the Scanner
  lookup can no longer set state after unmount. (`mvpSync` still swallows write
  errors by design — local-first — it just no longer does so via a bare `fetch`.)
- (+) `fetchWithRetry` is no longer orphaned.
- (−) `useAsync` is a stateful React hook (IO shell), so it is covered by the
  Playwright e2e suite (Scanner/Map flows) rather than a unit test — consistent
  with the repo's "functional core unit-tested, IO shell e2e-tested" split; no
  jsdom/RTL added.
- (−) `MapPage` keeps its bespoke 4-state provenance machine (ready/loading/
  fallback/error + source label) rather than collapsing into `useAsync`, because
  that machine carries success-with-degradation that the generic hook does not
  model. It adopts `fetchWithRetry` only. Accepted as the honest fit.

## Alternatives rejected

Forcing `MapPage` entirely onto `useAsync` (would regress its official-snapshot
fallback messaging). A unit test for `useAsync` via new jsdom + Testing Library
infra (out of scope; the e2e suite already exercises the adopters). A repo-wide
bare-`fetch` ban (would break legitimate server fetch in `lib/backend` and the
service worker).
