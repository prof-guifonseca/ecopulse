import { describe, expect, it } from 'vitest';
import { ARENA_OPPONENTS } from './arena';
import { ARENA_STAGE_VISUALS } from './arenaVisuals';

describe('arena stage visuals', () => {
  it('defines a complete visual stage for every opponent theme', () => {
    for (const opponent of ARENA_OPPONENTS) {
      const visual = ARENA_STAGE_VISUALS[opponent.stageTheme];

      expect(visual.id).toBe(opponent.stageTheme);
      expect(visual.name.length).toBeGreaterThan(3);
      expect(visual.palette.skyTop).toMatch(/^#/);
      expect(visual.palette.floor).toMatch(/^#/);
      expect(visual.particles.length).toBeGreaterThan(0);
      expect(visual.props.length).toBeGreaterThan(0);
    }
  });
});
