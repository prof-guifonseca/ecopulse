import type { ArenaStageTheme } from '@/types';

export type ArenaPropKind =
  | 'solarPanels'
  | 'toolRack'
  | 'recycleCore'
  | 'drumArc'
  | 'ancientRoots'
  | 'leafTotem'
  | 'circuitTower'
  | 'workbench'
  | 'trainingBanner';

export interface ArenaStageVisual {
  id: ArenaStageTheme;
  name: string;
  ambience: string;
  floorLabel: string;
  palette: {
    skyTop: string;
    skyMid: string;
    skyBottom: string;
    floor: string;
    floorLine: string;
    accent: string;
    accent2: string;
    glow: string;
    text: string;
    shadow: string;
  };
  particles: Array<{
    cx: number;
    cy: number;
    r: number;
    opacity: number;
    color: 'accent' | 'accent2' | 'glow';
  }>;
  props: Array<{
    kind: ArenaPropKind;
    side: 'left' | 'right';
    x: number;
    y: number;
    scale: number;
  }>;
}

export const ARENA_STAGE_VISUALS: Record<ArenaStageTheme, ArenaStageVisual> = {
  solar: {
    id: 'solar',
    name: 'Pátio Solar',
    ambience: 'luz quente · vento leve',
    floorLabel: 'Placas vivas',
    palette: {
      skyTop: '#263a28',
      skyMid: '#18251b',
      skyBottom: '#0d1611',
      floor: '#223321',
      floorLine: '#e0c27a',
      accent: '#e0c27a',
      accent2: '#8ddb98',
      glow: '#f4dd9b',
      text: '#f2f4ef',
      shadow: 'rgba(5, 9, 7, 0.58)',
    },
    particles: [
      { cx: 50, cy: 55, r: 3, opacity: 0.7, color: 'glow' },
      { cx: 185, cy: 78, r: 2, opacity: 0.45, color: 'accent' },
      { cx: 136, cy: 38, r: 2, opacity: 0.38, color: 'accent2' },
    ],
    props: [
      { kind: 'solarPanels', side: 'left', x: 18, y: 196, scale: 0.88 },
      { kind: 'leafTotem', side: 'right', x: 197, y: 176, scale: 0.74 },
    ],
  },
  workshop: {
    id: 'workshop',
    name: 'Oficina Reuso',
    ambience: 'metal limpo · faísca boa',
    floorLabel: 'Bancada de treino',
    palette: {
      skyTop: '#3a2f25',
      skyMid: '#1e231d',
      skyBottom: '#0d1410',
      floor: '#2a241d',
      floorLine: '#e0a576',
      accent: '#e0a576',
      accent2: '#8ddb98',
      glow: '#f0c08f',
      text: '#f2f4ef',
      shadow: 'rgba(6, 7, 5, 0.62)',
    },
    particles: [
      { cx: 43, cy: 82, r: 2, opacity: 0.54, color: 'accent' },
      { cx: 172, cy: 48, r: 3, opacity: 0.38, color: 'glow' },
      { cx: 122, cy: 101, r: 2, opacity: 0.36, color: 'accent2' },
    ],
    props: [
      { kind: 'toolRack', side: 'left', x: 20, y: 158, scale: 0.86 },
      { kind: 'workbench', side: 'right', x: 184, y: 188, scale: 0.88 },
    ],
  },
  circuit: {
    id: 'circuit',
    name: 'Circuito Recicla',
    ambience: 'neon baixo · leitura fria',
    floorLabel: 'Circuito fechado',
    palette: {
      skyTop: '#113942',
      skyMid: '#0f2729',
      skyBottom: '#071311',
      floor: '#102c2f',
      floorLine: '#7ec5d8',
      accent: '#7ec5d8',
      accent2: '#8ddb98',
      glow: '#a2efff',
      text: '#f2f4ef',
      shadow: 'rgba(2, 9, 10, 0.66)',
    },
    particles: [
      { cx: 67, cy: 48, r: 2, opacity: 0.52, color: 'accent' },
      { cx: 189, cy: 92, r: 2, opacity: 0.42, color: 'accent2' },
      { cx: 141, cy: 66, r: 3, opacity: 0.38, color: 'glow' },
    ],
    props: [
      { kind: 'circuitTower', side: 'left', x: 24, y: 147, scale: 0.88 },
      { kind: 'recycleCore', side: 'right', x: 186, y: 164, scale: 0.86 },
    ],
  },
  ginga: {
    id: 'ginga',
    name: 'Roda Ginga',
    ambience: 'ritmo circular · chão vivo',
    floorLabel: 'Roda tática',
    palette: {
      skyTop: '#2d3423',
      skyMid: '#1b2418',
      skyBottom: '#0b120d',
      floor: '#263024',
      floorLine: '#8ddb98',
      accent: '#8ddb98',
      accent2: '#e0c27a',
      glow: '#c4ffca',
      text: '#f2f4ef',
      shadow: 'rgba(4, 8, 4, 0.62)',
    },
    particles: [
      { cx: 36, cy: 60, r: 2, opacity: 0.48, color: 'accent2' },
      { cx: 116, cy: 42, r: 3, opacity: 0.42, color: 'accent' },
      { cx: 198, cy: 84, r: 2, opacity: 0.36, color: 'glow' },
    ],
    props: [
      { kind: 'drumArc', side: 'left', x: 27, y: 178, scale: 0.82 },
      { kind: 'trainingBanner', side: 'right', x: 192, y: 138, scale: 0.9 },
    ],
  },
  forest: {
    id: 'forest',
    name: 'Clareira Guardiã',
    ambience: 'raiz antiga · bruma verde',
    floorLabel: 'Raízes firmes',
    palette: {
      skyTop: '#203e2a',
      skyMid: '#14261a',
      skyBottom: '#08100b',
      floor: '#1a3222',
      floorLine: '#8ddb98',
      accent: '#8ddb98',
      accent2: '#e0c27a',
      glow: '#a9f0ad',
      text: '#f2f4ef',
      shadow: 'rgba(2, 8, 4, 0.68)',
    },
    particles: [
      { cx: 52, cy: 74, r: 2, opacity: 0.54, color: 'accent' },
      { cx: 162, cy: 44, r: 3, opacity: 0.4, color: 'glow' },
      { cx: 204, cy: 101, r: 2, opacity: 0.34, color: 'accent2' },
    ],
    props: [
      { kind: 'ancientRoots', side: 'left', x: 16, y: 168, scale: 0.94 },
      { kind: 'leafTotem', side: 'right', x: 195, y: 150, scale: 0.9 },
    ],
  },
};

export function arenaStageVisual(theme: ArenaStageTheme) {
  return ARENA_STAGE_VISUALS[theme];
}
