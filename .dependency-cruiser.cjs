/**
 * dependency-cruiser — the whole-module-graph barrier that complements the
 * ESLint import firewall (PR-B). Its unique value here is cycle detection and
 * a second, graph-level check of the layering. tsConfig gives it `@/` path
 * resolution.
 */
module.exports = {
  forbidden: [
    {
      // KNOWN DEBT (reported, not blocking): 4 pre-existing cycles —
      // src/lib/esg/* ↔ src/store/gameStore, src/data/products ↔
      // openFoodFactsProducts, and map/MapCanvas ↔ MapCanvasClient. Kept at
      // `warn` so the graph is visible without blocking the regime; promote to
      // `error` once they are broken (see docs/ARCHITECTURE.md).
      name: 'no-circular',
      comment: 'Circular dependencies make the module graph impossible to reason about.',
      severity: 'warn',
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
      name: 'data-has-no-framework',
      comment: 'Static data must not import React, Next, or the store at runtime.',
      severity: 'error',
      from: { path: '^src/data/' },
      to: {
        path: ['^node_modules/(react|react-dom|next)/', '^src/store/'],
        dependencyTypesNot: ['type-only'],
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
