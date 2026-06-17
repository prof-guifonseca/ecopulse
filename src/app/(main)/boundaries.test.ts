import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Structural gate (P5): the (main) route group must keep its shared error +
 * loading boundaries. These are GROUP-level by design — every (main) page is a
 * thin client component with no server-side data fetch, so per-segment
 * boundaries would be inert files; this freezes the boundaries that actually
 * run (route-transition Suspense + render-time throws) without demanding dead
 * per-segment boilerplate.
 */
describe('(main) route group boundaries', () => {
  it('keeps a shared error.tsx and loading.tsx', () => {
    expect(existsSync(join(here, 'error.tsx'))).toBe(true);
    expect(existsSync(join(here, 'loading.tsx'))).toBe(true);
  });
});
