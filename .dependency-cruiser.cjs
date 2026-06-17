/**
 * dependency-cruiser — the whole-module-graph barrier that complements the
 * ESLint import firewall (PR-B). Its unique value here is cycle detection and
 * a second, graph-level check of the layering. tsConfig gives it `@/` path
 * resolution.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Circular dependencies make the module graph impossible to reason about.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'pure-core-stays-pure',
      comment: 'Rule engines + domain must not import React, Next, or the store.',
      severity: 'error',
      from: {
        path: [
          '^src/lib/[^/]+/rules\\.ts$',
          '^src/lib/(ecoMultiplier|doctrines|scoring)\\.ts$',
          '^src/lib/arena/(affinity|progress)\\.ts$',
          '^src/domain/',
        ],
      },
      to: {
        path: ['^node_modules/(react|react-dom|next)/', '^src/store/', '^src/components/'],
        // The core may reference a store TYPE (e.g. ScanRecord), never its runtime.
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'commands-use-ports-not-adapters',
      comment:
        'Commands (P1) depend on the ports (interfaces), never on concrete adapters — dependency inversion. The composition root wires the adapter.',
      severity: 'error',
      from: { path: '^src/lib/(commands|.*/commands)/' },
      to: { path: ['^src/lib/persistence/', '^src/lib/backend/'] },
    },
    {
      name: 'raw-provider-shapes-stay-in-adapters',
      comment:
        'Raw external-provider response shapes (P6, anti-corruption layer) are declared in `*.raw.ts` and may be imported only within their adapter directory. The rest of the app consumes the domain types the adapter returns (ProductLookupResult, EnvironmentalPoint, GeocodedPlace), never the provider wire format.',
      severity: 'error',
      from: { pathNot: ['^src/lib/(products|esg)/adapters/'] },
      to: { path: ['^src/lib/(products|esg)/adapters/.*\\.raw\\.ts$'] },
    },
    {
      name: 'data-has-no-framework',
      comment: 'Static data must not import React, Next, or the store at runtime.',
      severity: 'error',
      from: { path: '^src/data/' },
      to: {
        path: ['^node_modules/(react|react-dom|next)/', '^src/store/'],
        dependencyTypesNot: ['type-only'],
      },
    },
    {
      name: 'no-deep-imports-into-barreled-features',
      comment:
        "A feature that exposes a public barrel (index.ts) is imported THROUGH it, never by reaching into its internals — types included (the barrel re-exports them). Scoped to the features that actually have a stable, framework-free barrel today (esg); enrolling a feature here is the deliberate act of declaring its public surface. (A feature whose barrel is 'use client' — e.g. region — could not serve type-only server consumers and would need a types carve-out before being enrolled.)",
      severity: 'error',
      from: { pathNot: ['^src/lib/esg/'] },
      to: { path: ['^src/lib/esg/(?!index)'] },
    },
    {
      name: 'no-external-analytics-sdks',
      comment:
        'Telemetry is anonymous + local-only (P7): usage lives in usageCountersStore, never leaves the device. A school project with minors must not ship a third-party analytics/tracking SDK. (Enforced in the module graph rather than ESLint to avoid weakening the per-directory import firewall, which also uses no-restricted-imports.)',
      severity: 'error',
      from: { path: '^src/' },
      to: {
        path: 'node_modules/(posthog-js|posthog-node|posthog|@posthog|mixpanel-browser|mixpanel|@amplitude|amplitude-js|@segment|analytics-node|react-ga|react-ga4|plausible-tracker|@vercel/analytics|@google-analytics|gtag)(/|$)',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    exclude: { path: '\\.(test|spec)\\.tsx?$|^src/app/api/.*\\.test\\.' },
  },
};
