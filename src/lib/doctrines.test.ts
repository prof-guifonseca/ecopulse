import { describe, expect, it } from 'vitest';
import { DOCTRINE_BY_RIVAL, DOCTRINE_DESCRIPTION, DOCTRINE_LABEL } from './doctrines';

describe('doctrine catalog', () => {
  it('maps every rival to a doctrine id that has a label and a description', () => {
    const ids = Object.values(DOCTRINE_BY_RIVAL);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      expect(DOCTRINE_LABEL[id], `label for ${id}`).toBeTruthy();
      expect(DOCTRINE_DESCRIPTION[id], `description for ${id}`).toBeTruthy();
    }
  });

  it('uses the rival:doctrine id convention', () => {
    for (const [rival, id] of Object.entries(DOCTRINE_BY_RIVAL)) {
      expect(id.startsWith(`${rival}:`)).toBe(true);
    }
  });
});
