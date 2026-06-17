# ADR 0004 — Async-state presentation primitives + hydration gating

Status: accepted (2026-06-17) · Phase 2, PR-3a

## Context

Loading, empty, and error states were hand-rolled per screen: the Map invented
a 4-value status machine, the Scanner an ad-hoc boolean+string, each page its own
empty/error markup. `ProfilePage` read persisted store values
(name/level/xp/tokens/badges) directly during render with no hydration guard —
the lone un-gated store reader among the tabs, so it briefly flashed
pre-rehydration defaults. The a11y suite ran axe at `domcontentloaded`, racing
hydration: it sometimes scanned a transient pre-hydration paint frame (where
muted text was momentarily measured against the page background) and flaked on a
color-contrast violation.

The original plan also called for a per-segment `error.tsx` in every `(main)`
segment. Re-surveying the tree showed that is moot: every `(main)` page is a thin
client component with no server-side async data fetch, so route error/loading
boundaries only ever fire for render-time throws and route-transition Suspense —
per-segment files would be inert boilerplate.

## Decision

- Three pure presentational primitives — `Loading` / `EmptyState` / `ErrorState`
  (`src/components/ui/AsyncState.tsx`): props-only, no store, no `'use client'`,
  so they compose into both server boundaries (`loading.tsx`) and client features.
- Consumers: `(main)/loading.tsx` + `(main)/error.tsx` (the latter now also
  `Sentry.captureException` — it used to swallow); `ProfilePage` gates on the
  existing `useHydrated` and renders a skeleton until rehydrated; `EmptyState` on
  the Scanner catalog and Map filtered list.
- Boundaries stay GROUP-level (shared `(main)/error.tsx` + `loading.tsx`) — not
  per-segment, which would be dead files.
- Gates: a structural test freezes the group boundary pair
  (`src/app/(main)/boundaries.test.ts`); the a11y suite waits for `aria-busy` to
  clear before axe, so it measures the settled UI deterministically (this both
  removes the flake and makes the suite an honest gate).

## Consequences

- (+) One look for loading/empty/error app-wide; the profile no longer flashes
  defaults; render-time errors in the tabs now reach Sentry; the a11y gate is
  deterministic (verified green across repeated runs).
- (+) `EmptyState` now surfaces a message on the Map's empty filtered list, which
  previously rendered a blank card.
- (−) The hydration skeleton adds one pre-content frame on the profile tab.
  Accepted — it is the same gate Home/Community/Arena already use, and correct
  output beats an instantaneous-but-wrong flash.

## Alternatives rejected

Per-segment `error.tsx`/`loading.tsx` for all six tabs (inert — no server async;
a "every segment has error.tsx" gate would force dead files). Extending
`useHydrated` to also track arena/scanHistory stores (it is shared by 6
consumers; lengthening its barrier app-wide to fix a profile-only flash is the
wrong trade — deferred). Fixing the contrast by darkening/lightening the
`--muted-foreground` token (the violation was a transient pre-hydration frame,
not settled content — confirmed by the now-deterministic a11y pass; no token
change warranted). The data-layer `useAsync` hook + bare-`fetch` ban (P4) is its
own follow-up (PR-3b), kept separate so this PR stays a low-risk view-layer change.
