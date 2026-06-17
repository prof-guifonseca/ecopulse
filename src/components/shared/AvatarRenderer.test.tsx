import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EMPTY_GEAR, GEAR_ITEMS, GEAR_SETS, defaultLoadoutForSet } from '@/data';
import { AvatarRenderer } from './AvatarRenderer';

describe('AvatarRenderer', () => {
  it('renders every complete gear set without throwing', () => {
    for (const set of GEAR_SETS) {
      const markup = renderToStaticMarkup(
        <AvatarRenderer
          loadout={defaultLoadoutForSet(set.id, 'base1')}
          size="stage"
          pose="battleReady"
        />,
      );
      expect(markup).toContain('<svg');
      expect(markup).toContain('data-avatar-slot="torso"');
    }
  });

  it('renders every Arena pose at duel size', () => {
    const loadout = defaultLoadoutForSet('cyber-reciclador', 'base1');
    const poses = [
      'idle',
      'builder',
      'battleReady',
      'attack',
      'defend',
      'focus',
      'victory',
      'defeat',
    ] as const;

    for (const pose of poses) {
      const markup = renderToStaticMarkup(
        <AvatarRenderer loadout={loadout} size="duel" pose={pose} />,
      );

      expect(markup).toContain('width="196"');
      expect(markup).toContain('<svg');
    }
  });

  it('renders every individual gear item as a highlighted wearable layer', () => {
    for (const item of GEAR_ITEMS) {
      const markup = renderToStaticMarkup(
        <AvatarRenderer
          loadout={{
            baseId: 'base1',
            equippedGear: { ...EMPTY_GEAR, [item.slot]: item.id },
            activeSetId: null,
          }}
          size="lg"
          pose="builder"
          highlightSlot={item.slot}
          showAura={item.slot === 'aura'}
        />,
      );

      expect(markup).toContain('<svg');
      expect(markup).toContain(`data-avatar-slot="${item.slot}"`);
    }
  });
});
