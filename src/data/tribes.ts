import type { MapPointType } from '@/types';

export type TribeId = 'guardioes' | 'recicladores' | 'cultivadores' | 'reparadores';

export interface TribeDef {
  id: TribeId;
  label: string;
  blurb: string;
  /** Primary archetype rival in the Arena. UI surfaces a "Patrono" banner. */
  patronRivalId: string;
  /** Gear set ids that visually align with this tribe (sabor, não poder). */
  gearSetIds: string[];
  /** Map categories that surface in daily missions for this tribe. */
  mapAffinity: MapPointType[];
}

export const TRIBES: Record<TribeId, TribeDef> = {
  guardioes: {
    id: 'guardioes',
    label: 'Guardiões',
    blurb: 'Quem protege o que dura.',
    patronRivalId: 'raiz-antiga',
    gearSetIds: ['guardiao-da-floresta', 'samurai-verde'],
    mapAffinity: ['baterias', 'eletronicos'],
  },
  recicladores: {
    id: 'recicladores',
    label: 'Recicladores',
    blurb: 'Fecha o ciclo. Nada vira lixo.',
    patronRivalId: 'luna-circuito',
    gearSetIds: ['cyber-reciclador', 'pirata-recicla'],
    mapAffinity: ['eletronicos', 'oleo'],
  },
  cultivadores: {
    id: 'cultivadores',
    label: 'Cultivadores',
    blurb: 'Planta, cuida, partilha.',
    patronRivalId: 'nami-solar',
    gearSetIds: ['mago-da-floresta', 'cientista-eco'],
    mapAffinity: ['granel', 'trocas'],
  },
  reparadores: {
    id: 'reparadores',
    label: 'Reparadores',
    blurb: 'Conserta antes de comprar.',
    patronRivalId: 'tiao-reuso',
    gearSetIds: ['aventureiro', 'capoeirista'],
    mapAffinity: ['reparo', 'trocas'],
  },
};

export const TRIBE_IDS: TribeId[] = ['guardioes', 'recicladores', 'cultivadores', 'reparadores'];

export function getTribe(id: string | null | undefined): TribeDef {
  if (id && id in TRIBES) return TRIBES[id as TribeId];
  return TRIBES.guardioes;
}

/**
 * Map a gear set id back to the tribe that "owns" it visually. Used during
 * v4→v5 user migration to deduce a tribe from the player's previously
 * equipped loadout when the field is still at its default 'guardioes'.
 */
export function tribeFromGearSetId(setId: string | null | undefined): TribeId | null {
  if (!setId) return null;
  for (const tribe of Object.values(TRIBES)) {
    if (tribe.gearSetIds.includes(setId)) return tribe.id;
  }
  return null;
}
