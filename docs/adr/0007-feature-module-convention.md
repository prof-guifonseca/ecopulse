# ADR 0007 — Feature-module convention (the capstone, scoped honestly)

Status: accepted (2026-06-17) · Phase 2, PR-5

## Context

Fase 2 set out to make feature-building repeatable. With P1–P7 landed, the last
step was to codify "how to add a feature" and finish the migration. The plan's
literal shape was a uniform `src/lib/<feature>/{rules, commands/, index}` triad
for every feature, a strict barrel-only import rule, and routing the live scan
flow through the command seam.

A survey of the actual tree showed that shape is **over-scoped** for a
solo-maintained school MVP:

- Only 2 of 9 feature folders have a barrel; 3 have `rules.ts`; **none** have a
  per-feature `commands/` — commands live flat in `src/lib/commands/`.
- A strict barrel-only rule would be **red on day one** (≈8 new barrels + ~30
  edited import sites), violating the regime's "gates are green against the
  current tree" norm.
- `gameActions` (the shared `awardTokens`/`unlockBadge`) is consumed by 7+
  features — it is cross-cutting, not feature-owned; moving it inward would
  manufacture deep cross-feature imports.
- `performScan`/`scanActions.ts` and `scanner.ts`'s `findAlternatives` were
  **dead** (zero callers).

## Decision

- **Codify the realized, tiered convention** (a feature grows the parts it
  needs), documented in `docs/PATTERNS.md` "How to add a feature" with a
  checklist — replacing the aspirational stub.
- **Delete the dead code** (`scanActions.ts`/`performScan`, `findAlternatives`).
- **Add one real, low-churn gate**: `no-deep-imports-into-barreled-features`
  (dependency-cruiser), scoped to the features that actually have a stable,
  framework-free barrel today (esg) — everything, types included, goes through
  `index.ts` (the barrel re-exports the feature's types). Enrolling a feature in
  the rule is the deliberate act of declaring its public surface. Required fixing
  exactly one pre-existing deep import (`community/realFeed.ts` → `@/lib/esg`). A
  `use client` barrel (e.g. region) would need a types carve-out before enrolment.
- **Keep commands flat** in `src/lib/commands/` (the `commands/**` globs already
  anticipate a nested form if ever needed); **keep `gameActions`/`missions`/
  `challengeActions` top-level**.

## Consequences

- (+) The convention is honest (matches the tree), dead code is gone, and the
  barrel rule has teeth (verified against a planted deep import) without a
  tree-wide migration.
- (−) The convention is not uniform — readers must consult the tiered checklist
  rather than assume every feature looks identical. Accepted: uniformity here
  would be churn, not safety.

## Explicitly deferred (flagged, not done here)

- **Wiring the live scan flow through `executeCommand`** (which would light up the
  EventStore append + the dormant telemetry hook). HIGH risk and **not** a
  capstone item: `scanProductCommand` models the *synchronous sample* scan
  (`pickProduct`), not the async barcode lookup that is the live path, and naive
  wiring would double-write the event / double-count telemetry (the live flow
  already `syncScan`s). When pursued, it is its own PR — scoped to the sample
  path, removing the duplicate `syncScan` bump, with an e2e event-append
  assertion.
- Relocating `scanner.ts` → `scan/` and `challengeActions` → `challenges/` (pure
  tidiness, skippable).

## Alternatives rejected

Universal `{rules, commands/, index}` per feature (churn without payoff). A
strict repo-wide barrel-only rule (red on the current tree; forces premature
barrels). Moving `gameActions` into a feature (breaks the shared-primitive
ergonomics).
