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
    exclude: ['**/node_modules/**', '**/.next/**', '**/.claude/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      // Gate only the deterministic functional core (pure rules + domain).
      // Components/stores are exercised by the Playwright e2e/a11y suite.
      include: ['src/lib/**/*.ts', 'src/domain/**/*.ts'],
      exclude: ['**/*.test.ts'],
      reporter: ['text-summary'],
      // Ratchet floor — set just under the current level so coverage can only
      // climb. Target is 80%; raise these as tests are added.
      thresholds: {
        lines: 50,
        statements: 50,
        functions: 48,
        branches: 50,
      },
    },
  },
});
