# EcoPulse — Architecture & the self-disciplining regime

This is the human-readable mirror of the machine gates. Every rule below is
enforced automatically — by the TypeScript compiler, ESLint, a test, or CI — so
the codebase disciplines itself rather than relying on review vigilance. If you
change a convention here, change the gate that enforces it (and vice-versa).

## Layers

```
app ─────────────┐ (routes, API handlers — may use everything)
components/ui ────┤ presentation primitives (shadcn + cva); no store, no actions
components/* ─────┤ feature components; may use store + actions
actions (lib/*Actions) ─ imperative shell over the pure core; may use the store
domain ──────────┤ event model + validation; framework-free
pure core ───────┤ lib/**/rules.ts, ecoMultiplier, doctrines, scoring,
                 │   arena/{affinity,progress} — pure functions, framework-free
data ────────────┤ static catalog; framework/store-free (may hold view descriptors)
types ───────────┘ leaves — declare types, import no runtime
```

**Functional core / imperative shell**: `rules.ts` modules are pure and
deterministic (the battle engine is seed-based); stores and `*Actions` modules
are the only place side effects live.

## The rules and who enforces them

| Rule | Enforcer | Where |
| --- | --- | --- |
| A discriminated union with an unhandled case won't compile | **TS** | `assertNever` (`src/lib/assertNever.ts`) |
| A `PointId` can't be passed where a `ProductId` is expected | **TS** | branded ids (`src/types/ids.ts`) |
| Out-of-range `Score` rejected at the boundary | **TS** | `isScore` (`src/types/index.ts`) |
| Pure core / data / domain stay framework-free | **ESLint** | `no-restricted-imports` (`eslint.config.mjs`) |
| Pure core may import a store **type** but never its runtime | **ESLint** | `allowTypeImports` |
| `ui` primitives never reach the store or the action layer | **ESLint** | `eslint.config.mjs` |
| Types are leaves (no runtime imports) | **ESLint** | `eslint.config.mjs` |
| `any` is forbidden | **ESLint** | `@typescript-eslint/no-explicit-any` |
| Every `className` flows through `cn()` (no template-literal/concat) | **ESLint** | `no-restricted-syntax` |
| A misspelled design token won't compile | **TS** | generated `src/types/tokens.ts` |
| `globals.css` is the single source of tokens (no drift) | **CI** | `npm run tokens:check` |
| Code is Prettier-formatted | **CI + pre-commit** | `format:check`, lint-staged |
| Type coverage ≥ 99% | **CI** | `npm run type-coverage` |
| Functional-core test coverage ≥ floor | **CI** | `vitest` thresholds (`vitest.config.ts`) |
| Module graph: layer boundaries + cycle report | **CI** | `npm run depcruise` |
| Commit messages are conventional | **pre-commit** | commitlint |
| Commands never import the store runtime / never `throw` (P1) | **ESLint** | `commands/**` rules (`eslint.config.mjs`) |
| Commands depend on ports, never on adapters (P2) | **CI** | `commands-use-ports-not-adapters` (`.dependency-cruiser.cjs`) |
| API routes parse input, never cast it (`as Record<…>` banned) (P3) | **ESLint** | `src/app/api/**` rule (`eslint.config.mjs`) |
| Written tables stay in sync with the SQL migration (P3) | **CI** | `npm run schema:check` (`scripts/check-schema.mjs`) |

`npm run lint && typecheck && format:check && tokens:check && schema:check && type-coverage && depcruise && test:coverage && build && test:e2e && test:a11y && audit` is the full gate; CI runs it on every PR.

The **generative** patterns (how to build features + move data) live in [docs/PATTERNS.md](PATTERNS.md); architecture decisions in [docs/adr/](adr/).

## Design tokens

`src/app/globals.css` is the single source of truth. The canonical names follow
the **shadcn** convention (`--background`, `--foreground`, `--primary`, `--card`,
`--muted`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, …) and
hold EcoPulse's dark-editorial values. The bespoke legacy names (`--bg-*`,
`--text-*`, `--accent-green`, `--line-soft`, …) are kept as **thin aliases** so
existing call sites resolve unchanged; they are removed once swept (see below).
`scripts/gen-tokens.mjs` regenerates the typed `CssToken` union from this file.

## shadcn migration status

- **Done**: `components.json`; the shadcn token system (canonical names are the
  sole source of truth — the legacy aliases were swept out); `class-variance-authority`
  as the variant mechanism across the `ui` primitives (`Button`, `Card`,
  `IconButton`, `IconTile`, `ListCard`, `Tile`, `ScoreBadge`) + `Badge`;
  `asChild`/Slot on `Button`; **`Toasts → sonner`** (the store's `showToast`
  routes to sonner; `<Toaster>` is themed to the editorial card).
- **Kept custom, by design (not deferred)**:
  - **`Modal`** stays a hand-rolled portal with its own focus trap / Escape /
    focus-return. A Radix Dialog migration was attempted and reverted: Radix's
    focus-restore lifecycle is driven by its `open` state, which conflicts with
    this app's store-driven *external* unmount (`uiStore.modal = null`), breaking
    the e2e focus-return guarantees. The custom Modal is a11y-complete and
    covered by those e2e tests, so it is the better choice here.
  - **`Tabs`** stays custom: the usage is a panel-less segmented control, so
    Radix Tabs would emit a dangling `aria-controls` (an a11y regression).

## Known tech debt (reported, not blocking)

- **Coverage floor is a ratchet** at lines 85 / functions 85 / branches 72 of
  the functional core (currently ~90% lines); raise toward 100% as the IO shell
  gains tests.
- **Pre-commit `eslint-plugin-boundaries`** was rejected (broken v6 resolver);
  import boundaries are enforced by `no-restricted-imports` + `depcruise`
  (`no-circular` is now `error` — the graph is fully acyclic).
