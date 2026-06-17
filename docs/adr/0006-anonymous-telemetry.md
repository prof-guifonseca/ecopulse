# ADR 0006 — Anonymous usage telemetry on the event backbone

Status: accepted (2026-06-17) · Phase 2, PR-4

## Context

There was zero usage observability — Sentry captured errors only. We want to
know "how much is each feature used" to guide the MVP, but this is a school
project used by **minors**, so any analytics must be **anonymous, local-first,
and free of third-party data egress**. The EcoPulse event vocabulary
(`EcoPulseEventType`) is the natural backbone to count against.

A wrinkle: the `executeCommand` seam (the documented home for cross-cutting
concerns) is **not yet wired to any live flow** — that is PR-5's job. Emitting
telemetry only there would count nothing today.

## Decision

- A local projection store, `usageCountersStore`
  (`counts['YYYY-MM-DD'][key] = n`), persisted to localStorage. **No network, no
  SDK.** `recordUsage(key)` / `recordUsageForEventType(type)` are the only API.
- **PII is structurally impossible**: `recordUsage` takes a closed
  `UsageCounterKey` literal union and stores a `number` — never a payload, id, or
  free-form string. `onboarded` (display-name PII) and `impact_recorded` are
  deliberately uncounted; the like/promise reaction split is recorded at the call
  site.
- **Emit where it fires today + where it will fire tomorrow**: the typed
  `mvpSync.sync*` client wrappers (the live action chokepoints) bump now; an
  `onCommandExecuted` hook on `CommandContext` is added and wired in
  `composition.ts` but **dormant** until PR-5 routes flows through the seam.
- Self-propagating gates: dependency-cruiser `no-external-analytics-sdks` (bans
  posthog/mixpanel/amplitude/segment/ga/plausible/…); the closed-key TS signature;
  a no-PII round-trip test.

## Consequences

- (+) Anonymous per-day usage counts with no privacy surface; the analytics ban
  is machine-enforced (verified against a planted denylisted import).
- (+) When PR-5 wires the command seam, telemetry lights up there for free.
- (−) Two emission points (mvpSync now, the seam later) until PR-5 unifies flow
  through `executeCommand`. Documented as intentional.

## Alternatives rejected

PostHog / Mixpanel / GA / any external analytics (third-party data egress —
unacceptable for minors; banned by the gate). Emitting **only** at the
`executeCommand` seam (would count nothing until PR-5). Reusing the raw
`EcoPulseEventType` as the counter key (kept a dedicated `UsageCounterKey` to
exclude the PII-bearing `onboarded` and to model the reaction split). An **ESLint**
`no-restricted-imports` analytics deny-list (a broad block would replace — not
merge with — the per-directory import firewall, which also uses
`no-restricted-imports`; dependency-cruiser enforces it across the whole module
graph without that hazard). No persisted retention cap yet (counts are tiny;
trimming old days is deferred).
