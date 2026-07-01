import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/.next/**', '**/.claude/**'],
    coverage: {
      provider: 'v8',
      // Gate the deterministic functional core (pure rule engines + domain).
      // The IO shell (backend/client/net/share, provider fetches) and stateful
      // action modules stay out of the unit-coverage gate to avoid a
      // flaky-mock tax — no browser e2e suite exists at this prototype stage
      // to cover them behaviorally instead, so treat this slice as thin and
      // low-risk by design, not fully verified.
      include: [
        'src/lib/**/rules.ts',
        'src/lib/arena/affinity.ts',
        'src/lib/arena/progress.ts',
        'src/lib/arena/presentation.ts',
        'src/lib/ecoMultiplier.ts',
        'src/lib/doctrines.ts',
        'src/lib/scoring.ts',
        'src/lib/journey.ts',
        'src/domain/**/*.ts',
      ],
      exclude: ['**/*.test.ts'],
      reporter: ['text-summary'],
      // Real ≥80% on the core (lines 89.6% / functions 89.4% today). Set with a
      // margin below current so the gate is green but can only ratchet up.
      thresholds: {
        lines: 85,
        statements: 82,
        functions: 85,
        branches: 72,
      },
    },
  },
});
