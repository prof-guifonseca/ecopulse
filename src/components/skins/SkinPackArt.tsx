import { AkashiArt } from './AkashiArt';
import { SamuraiVerdeArt } from './SamuraiVerdeArt';
import { NinjaEcoArt } from './NinjaEcoArt';
import { MagoDaFlorestaArt } from './MagoDaFlorestaArt';
import { CyberRecicladorArt } from './CyberRecicladorArt';
import { AventureiroArt } from './AventureiroArt';

export const SKIN_ART_REGISTRY = {
  akashi: AkashiArt,
  'samurai-verde': SamuraiVerdeArt,
  'ninja-eco': NinjaEcoArt,
  'mago-da-floresta': MagoDaFlorestaArt,
  'cyber-reciclador': CyberRecicladorArt,
  aventureiro: AventureiroArt,
} as const;

export type SkinArtId = keyof typeof SKIN_ART_REGISTRY;

export type SkinArtSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<SkinArtSize, number> = {
  sm: 36,
  md: 56,
  lg: 80,
  xl: 120,
};

interface Props {
  id: string;
  size?: SkinArtSize;
  className?: string;
}

/**
 * Resolves a SkinPack id to its SVG illustration component.
 * Falls back gracefully to a quiet placeholder if the id isn't registered.
 */
export function SkinPackArt({ id, size = 'md', className }: Props) {
  const Art = SKIN_ART_REGISTRY[id as SkinArtId];
  const sz = SIZE_PX[size];

  if (!Art) {
    return (
      <div
        className={className}
        style={{
          width: sz,
          height: sz,
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
        }}
      />
    );
  }

  return <Art size={sz} className={className} />;
}
