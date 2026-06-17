import { defineConfig, globalIgnores } from 'eslint/config';
import { fixupConfigRules } from '@eslint/compat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// -----------------------------------------------------------------------------
// Architecture firewall (PR-B). Encodes the layering the codebase already
// honours so it can never silently rot during the shadcn migration. Expressed
// with the built-in `no-restricted-imports` (no resolver, no extra plugin):
// each rule is scoped to the directory it governs via flat-config `files`, and
// is verified green against the current tree. The full module-graph barrier
// (dependency-cruiser, with tsconfig-path awareness) lands in PR-F.
//
// A note on `allowTypeImports`: the functional core may reference a *type* that
// happens to live in the store module (e.g. ScanRecord, a plain data shape),
// but it must never import the store's *runtime* (hooks, state). That single
// distinction is what keeps the core pure while staying pragmatic.
// -----------------------------------------------------------------------------

const FRAMEWORK_GROUP = [
  'react',
  'react-dom',
  'next',
  'next/*',
  'zustand',
  'maplibre-gl',
  'react-map-gl',
];
const SHELL_GROUP = [
  '@/store',
  '@/store/**',
  '@/components',
  '@/components/**',
  '@/app',
  '@/app/**',
];
const TEST_GLOBS = ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'];

// Pure rule engines + the domain model. Never touch framework or app shell.
const CORE_FILES = [
  'src/lib/**/rules.ts',
  'src/lib/**/affinity.ts',
  'src/lib/**/progress.ts',
  'src/lib/ecoMultiplier.ts',
  'src/lib/doctrines.ts',
  'src/lib/scoring.ts',
  'src/domain/**/*.ts',
];

const eslintConfig = defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),

  // Functional core — framework-free and shell-free (store TYPES allowed).
  {
    files: CORE_FILES,
    ignores: TEST_GLOBS,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: FRAMEWORK_GROUP,
              message:
                'The functional core must stay framework-free (no React/Next/Zustand/MapLibre).',
            },
            {
              group: SHELL_GROUP,
              allowTypeImports: true,
              message:
                'The functional core must not depend on the store runtime, UI, or app shell.',
            },
          ],
        },
      ],
    },
  },

  // Static data / catalog. Framework-free and store-free, but view-descriptor
  // data (a Region's backdrop, the gear-visual registry) may reference a
  // component — that inversion is intentional in this codebase.
  {
    files: ['src/data/**/*.{ts,tsx}'],
    ignores: TEST_GLOBS,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: FRAMEWORK_GROUP, message: 'Data modules must stay framework-free.' },
            {
              group: ['@/store', '@/store/**', '@/app', '@/app/**'],
              allowTypeImports: true,
              message: 'Data modules must not depend on the store runtime or the app shell.',
            },
          ],
        },
      ],
    },
  },

  // Types are leaves: declare types here, import runtime nowhere.
  {
    files: ['src/types/**/*.ts'],
    ignores: TEST_GLOBS,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                ...FRAMEWORK_GROUP,
                '@/store',
                '@/store/**',
                '@/components',
                '@/components/**',
                '@/app',
                '@/app/**',
                '@/lib',
                '@/lib/**',
                '@/data',
                '@/data/**',
                '@/domain',
                '@/domain/**',
              ],
              message: 'Types are leaves: declare types here, import runtime nowhere.',
            },
          ],
        },
      ],
    },
  },

  // UI primitives must not subscribe to the store or call the action layer.
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    ignores: TEST_GLOBS,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/store', '@/store/**'],
              message: 'UI primitives must not subscribe to the store — receive data via props.',
            },
            {
              group: ['@/lib/*Actions', '@/lib/**/*Actions'],
              message:
                'UI primitives must not call the action layer — lift it to a feature component.',
            },
          ],
        },
      ],
    },
  },

  // Commands (P1) are pure orchestration: they receive store actions via
  // injected deps (never import the store runtime) and never throw (return a
  // Result err instead). The composition root does the wiring.
  {
    files: ['src/lib/commands/**/*.ts', 'src/lib/**/commands/**/*.ts'],
    ignores: TEST_GLOBS,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/store', '@/store/**'],
              message:
                'Commands must not import the store — receive store actions via injected deps.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ThrowStatement',
          message: 'Commands must not throw — return err(AppError) instead.',
        },
      ],
    },
  },

  // API route handlers sit on the untrusted edge: parse input, never cast it.
  // A structural `as Record<…>` skips validation and lets a malformed body flow
  // inward typed-as-safe. Use a boundary parser instead (src/domain/parse.ts):
  // `isRecord(body)` guard or `parseEventEnvelope` (P3).
  {
    files: ['src/app/api/**/*.ts'],
    ignores: TEST_GLOBS,
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAsExpression > TSTypeReference[typeName.name="Record"]',
          message:
            'Do not cast request input with `as Record<…>` — parse it at the boundary (src/domain/parse.ts: isRecord / parseEventEnvelope).',
        },
      ],
    },
  },

  // Client code goes through useAsync / fetchWithRetry (P4), never a bare
  // `fetch(` — so every client→BFF call gets retry + cancellation and a uniform
  // error contract (no more silent fire-and-forget). Server code (lib/backend,
  // lib/esg, lib/products, app/api) is out of scope; `fetchWithRetry(fetch, …)`
  // is allowed everywhere (the `fetch` there is an argument, not a call). The
  // `.tsx` half of this rule lives in the `src/**/*.tsx` block below, because
  // flat-config replaces (not merges) `no-restricted-syntax` per file — keeping
  // it there lets a component get both the className and the no-bare-fetch checks.
  {
    files: [
      'src/components/**/*.ts',
      'src/hooks/**/*.ts',
      'src/lib/client/**/*.ts',
      'src/lib/persistence/**/*.ts',
    ],
    ignores: TEST_GLOBS,
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            'No bare fetch() in client code — use useAsync (src/hooks/useAsync.ts) or fetchWithRetry(fetch, …) for retry + cancellation.',
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Type & composition discipline (PR-B).
  // ---------------------------------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Freeze the zero-`any` baseline into the compiler-of-record.
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/**/*.tsx'],
    rules: {
      // Force className composition through cn() — never a template literal or
      // string concatenation (cn() de-duplicates and resolves Tailwind conflicts).
      // Plus the no-bare-fetch check (P4): a component must never call `fetch(`
      // directly — go through useAsync / fetchWithRetry, or a server-side lib
      // data function. (Co-located with the className rules because flat-config
      // replaces `no-restricted-syntax` per file rather than merging.)
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            'No bare fetch() in a component — use useAsync (src/hooks/useAsync.ts), fetchWithRetry(fetch, …), or a server-side lib data function.',
        },
        {
          selector:
            "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral",
          message: 'Compose className with cn() instead of a template literal.',
        },
        {
          selector:
            "JSXAttribute[name.name='className'] > JSXExpressionContainer > BinaryExpression",
          message: 'Compose className with cn() instead of string concatenation.',
        },
        {
          // No magic hex colours in className — every colour goes through a
          // design token (var(--token) or a token utility). Dimensional
          // arbitraries (px/rem) stay allowed for genuine one-offs.
          selector: "JSXAttribute[name.name='className'] Literal[value=/-\\[#[0-9a-fA-F]/]",
          message:
            'No raw hex colours in className — use a design token (var(--…) or a token utility).',
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    '.claude/**',
    'out/**',
    'build/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
