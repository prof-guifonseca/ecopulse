# ADR 0003 — Anti-corruption adapters for open data

Status: accepted (2026-06-17) · Phase 2, PR-2b

## Context

Open-data providers (Open Food Facts, OpenStreetMap/Overpass, Nominatim) each
return their own wire format. Those raw shapes (`OpenFoodFactsProduct`,
`OsmElement`/`OverpassResponse`, `NominatimPlace`) and their `as <Raw>` casts
lived inline in the modules that also held orchestration and were re-exported
through the feature barrels — so the provider format could leak inward, and a
provider changing its JSON would ripple across the codebase.

## Decision

- Each provider gets an **adapter** under `src/lib/<feature>/adapters/`. The raw
  shapes live in a sibling `*.raw.ts`; the adapter is the only module that
  fetches, narrows, and **translates** them into a domain type
  (`ProductLookupResult`, `EnvironmentalPoint`, `GeocodedPlace`).
- The raw `as <Raw>` cast stays at the boundary. `normalizeOverpassResponse` now
  accepts `unknown` and narrows internally (via the `isRecord` leaf), so the
  Overpass provider never names the raw type at all.
- `productLookup.ts` becomes a thin orchestrator (cache → adapter → local
  catalog → unknown); `INSUFFICIENT_TIP` moves to a shared leaf so the
  orchestrator and adapter never import each other (which would cycle).
- Self-propagating gate: dependency-cruiser `raw-provider-shapes-stay-in-adapters`
  forbids any module outside `adapters/` from importing a `*.raw.ts`.
  Golden-fixture tests feed representative raw payloads and assert the domain
  output (+ a malformed-payload case proving the raw type never escapes).

## Consequences

- (+) A provider's format change is contained to one adapter; the rest of the
  app depends only on domain types.
- (+) The boundary is now machine-enforced, not convention — a leaked raw import
  fails CI (verified against a planted violation).
- (−) More files (a `.raw.ts` + adapter per provider) and one extra hop for the
  normalizers. Accepted: it is what makes the isolation real and gate-able.

## Alternatives rejected

Leaving normalizers in place with a lint-only convention (not enforceable at the
module graph; raw types still re-exported through barrels). A generic provider
abstraction / plugin registry (over-engineering for three providers — a plain
adapter function per provider is enough).
