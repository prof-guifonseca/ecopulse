import type { MapPointType, Score } from '@/types';
import type { TribeId } from './tribes';

export type MissionSlot = 'scan' | 'social' | 'map';

export interface MissionFlavor {
  title: string;
  body: string;
}

export interface MissionTemplate {
  id: string;
  slot: MissionSlot;
  iconName: string;
  reward: number;
  /** target count (e.g., likes ≥ target). For boolean slots use 1. */
  target: number;
  /** Optional eligibility filters narrow when the slot can be marked done. */
  filter?: {
    minScore?: Score;
    mapTypes?: MapPointType[];
  };
  /** Per-tribe copy. Always provide all 4 — fall back to guardioes if missing. */
  flavorByTribe: Record<TribeId, MissionFlavor>;
}

const SCORE_RANK: Record<Score, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

const MISSION_POOL: MissionTemplate[] = [
  // ---------- SCAN ----------
  {
    id: 'scan-any',
    slot: 'scan',
    iconName: 'camera',
    reward: 10,
    target: 1,
    flavorByTribe: {
      guardioes: { title: 'Escaneie 1 produto', body: 'Registre um item e avance o dia.' },
      recicladores: { title: 'Escaneie 1 produto', body: 'Comece o ciclo: reconheça o que entra.' },
      cultivadores: { title: 'Escaneie 1 produto', body: 'Veja a origem antes de levar.' },
      reparadores: { title: 'Escaneie 1 produto', body: 'Mapeie o que cuidamos diariamente.' },
    },
  },
  {
    id: 'scan-quality-b',
    slot: 'scan',
    iconName: 'camera',
    reward: 12,
    target: 1,
    filter: { minScore: 'B' },
    flavorByTribe: {
      guardioes: {
        title: 'Escaneie 1 produto A ou B',
        body: 'Confirme uma escolha sólida do dia.',
      },
      recicladores: {
        title: 'Escaneie 1 produto A ou B',
        body: 'Embalagem boa fecha o ciclo melhor.',
      },
      cultivadores: {
        title: 'Escaneie 1 produto local',
        body: 'A ou B — valoriza quem produz perto.',
      },
      reparadores: {
        title: 'Escaneie 1 produto durável',
        body: 'Boa nota = item que aguenta mais.',
      },
    },
  },

  // ---------- MAP ----------
  {
    id: 'map-any',
    slot: 'map',
    iconName: 'mapPin',
    reward: 7,
    target: 1,
    flavorByTribe: {
      guardioes: { title: 'Visite 1 ponto', body: 'Uma volta marca o território.' },
      recicladores: { title: 'Visite 1 ponto', body: 'Conheça onde fechamos o ciclo.' },
      cultivadores: { title: 'Visite 1 ponto', body: 'Apareça num lugar que respeita o tempo.' },
      reparadores: { title: 'Visite 1 ponto', body: 'Veja quem conserta perto de você.' },
    },
  },
  {
    id: 'map-affinity',
    slot: 'map',
    iconName: 'mapPin',
    reward: 9,
    target: 1,
    filter: { mapTypes: [] /* overridden by tribe-specific clones below */ },
    flavorByTribe: {
      guardioes: {
        title: 'Visite 1 ponto de Baterias',
        body: 'Um EcoPonto cuida do que mais polui.',
      },
      recicladores: {
        title: 'Visite 1 ponto de Eletrônicos',
        body: 'E-lixo bem encaminhado é vitória.',
      },
      cultivadores: {
        title: 'Visite 1 Empório a Granel',
        body: 'Granel reduz embalagem na raiz.',
      },
      reparadores: {
        title: 'Visite 1 ponto de Reparo',
        body: 'Antes de comprar, conserta.',
      },
    },
  },

  // ---------- SOCIAL ----------
  {
    id: 'social-likes-2',
    slot: 'social',
    iconName: 'heart',
    reward: 8,
    target: 2,
    flavorByTribe: {
      guardioes: { title: 'Dê 2 likes', body: 'Reconheça quem está fazendo.' },
      recicladores: { title: 'Dê 2 likes', body: 'Apoie ideias que fecham o ciclo.' },
      cultivadores: { title: 'Dê 2 likes', body: 'Apoie quem cultiva hábito.' },
      reparadores: { title: 'Dê 2 likes', body: 'Apoie quem conserta antes de comprar.' },
    },
  },
  {
    id: 'social-replicate',
    slot: 'social',
    iconName: 'heart',
    reward: 9,
    target: 1,
    flavorByTribe: {
      guardioes: { title: 'Diga "Vou tentar" em 1 post', body: 'Promessa simulada · prototype.' },
      recicladores: { title: 'Diga "Vou tentar" em 1 post', body: 'Promessa simulada · prototype.' },
      cultivadores: { title: 'Diga "Vou tentar" em 1 post', body: 'Promessa simulada · prototype.' },
      reparadores: { title: 'Diga "Vou tentar" em 1 post', body: 'Promessa simulada · prototype.' },
    },
  },
];

export { MISSION_POOL };

export function getMissionTemplate(id: string | null | undefined): MissionTemplate | null {
  if (!id) return null;
  return MISSION_POOL.find((t) => t.id === id) ?? null;
}

/**
 * Pick today's three templates — one per slot — given tribe and chapter.
 * `chapterId` is used to gate higher-quality templates: scan-quality-b is
 * skipped when the player is still in 'semente'.
 */
export function pickTodaysMissions(opts: {
  tribe: TribeId;
  chapterId: string;
  /** Stable seed so the same day always picks the same three. */
  seed: string;
}): string[] {
  const { tribe, chapterId, seed } = opts;
  const earlyChapter = chapterId === 'semente';

  const picks: string[] = [];
  for (const slot of ['scan', 'map', 'social'] as const) {
    const candidates = MISSION_POOL.filter((t) => t.slot === slot).filter((t) => {
      if (earlyChapter && t.id === 'scan-quality-b') return false;
      return true;
    });
    const idx = hashStringToIndex(`${seed}|${slot}|${tribe}`, candidates.length);
    picks.push(candidates[idx].id);
  }
  return picks;
}

function hashStringToIndex(s: string, mod: number): number {
  if (mod <= 1) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

/**
 * Resolve the active map-type filter for a given mission template + tribe.
 * The 'map-affinity' template inherits its mapTypes from the tribe; other
 * templates use whatever is on the template directly.
 */
import { TRIBES } from './tribes';
export function effectiveMapTypes(
  template: MissionTemplate,
  tribe: TribeId
): MapPointType[] | undefined {
  if (template.id === 'map-affinity') return TRIBES[tribe].mapAffinity;
  return template.filter?.mapTypes;
}

export function scanMeetsTemplate(template: MissionTemplate, score: Score): boolean {
  const min = template.filter?.minScore;
  if (!min) return true;
  return SCORE_RANK[score] >= SCORE_RANK[min];
}

export function visitMeetsTemplate(
  template: MissionTemplate,
  type: MapPointType,
  tribe: TribeId
): boolean {
  const types = effectiveMapTypes(template, tribe);
  if (!types || types.length === 0) return true;
  return types.includes(type);
}
