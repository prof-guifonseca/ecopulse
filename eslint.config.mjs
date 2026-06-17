import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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

const FRAMEWORK_GROUP = ["react", "react-dom", "next", "next/*", "zustand", "maplibre-gl", "react-map-gl"];
const SHELL_GROUP = ["@/store", "@/store/**", "@/components", "@/components/**", "@/app", "@/app/**"];
const TEST_GLOBS = ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"];

// Pure rule engines + the domain model. Never touch framework or app shell.
const CORE_FILES = [
  "src/lib/**/rules.ts",
  "src/lib/**/affinity.ts",
  "src/lib/**/progress.ts",
  "src/lib/ecoMultiplier.ts",
  "src/lib/doctrines.ts",
  "src/lib/scoring.ts",
  "src/domain/**/*.ts",
];

const eslintConfig = defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),

  // Functional core — framework-free and shell-free (store TYPES allowed).
  {
    files: CORE_FILES,
    ignores: TEST_GLOBS,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: FRAMEWORK_GROUP, message: "The functional core must stay framework-free (no React/Next/Zustand/MapLibre)." },
            { group: SHELL_GROUP, allowTypeImports: true, message: "The functional core must not depend on the store runtime, UI, or app shell." },
          ],
        },
      ],
    },
  },

  // Static data / catalog. Framework-free and store-free, but view-descriptor
  // data (a Region's backdrop, the gear-visual registry) may reference a
  // component — that inversion is intentional in this codebase.
  {
    files: ["src/data/**/*.{ts,tsx}"],
    ignores: TEST_GLOBS,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: FRAMEWORK_GROUP, message: "Data modules must stay framework-free." },
            { group: ["@/store", "@/store/**", "@/app", "@/app/**"], allowTypeImports: true, message: "Data modules must not depend on the store runtime or the app shell." },
          ],
        },
      ],
    },
  },

  // Types are leaves: declare types here, import runtime nowhere.
  {
    files: ["src/types/**/*.ts"],
    ignores: TEST_GLOBS,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                ...FRAMEWORK_GROUP,
                "@/store", "@/store/**",
                "@/components", "@/components/**",
                "@/app", "@/app/**",
                "@/lib", "@/lib/**",
                "@/data", "@/data/**",
                "@/domain", "@/domain/**",
              ],
              message: "Types are leaves: declare types here, import runtime nowhere.",
            },
          ],
        },
      ],
    },
  },

  // UI primitives must not subscribe to the store or call the action layer.
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    ignores: TEST_GLOBS,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/store", "@/store/**"], message: "UI primitives must not subscribe to the store — receive data via props." },
            { group: ["@/lib/*Actions", "@/lib/**/*Actions"], message: "UI primitives must not call the action layer — lift it to a feature component." },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Type & composition discipline (PR-B).
  // ---------------------------------------------------------------------------
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Freeze the zero-`any` baseline into the compiler-of-record.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/**/*.tsx"],
    rules: {
      // Force className composition through cn() — never a template literal or
      // string concatenation (cn() de-duplicates and resolves Tailwind conflicts).
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral",
          message: "Compose className with cn() instead of a template literal.",
        },
        {
          selector: "JSXAttribute[name.name='className'] > JSXExpressionContainer > BinaryExpression",
          message: "Compose className with cn() instead of string concatenation.",
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".claude/**",
    "out/**",
    "build/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
