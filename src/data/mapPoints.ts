import type { MapPoint, MapPointType } from '@/types';

export const MAP_TYPE_ICON: Record<MapPointType, string> = {
  baterias: 'battery',
  eletronicos: 'cpu',
  oleo: 'droplet',
  trocas: 'shirt',
  granel: 'leaf',
  reparo: 'hammer',
};

export const MAP_POINTS: MapPoint[] = [
  { id: 'm1', name: 'EcoPonto Baterias Centro', type: 'baterias', address: 'Rua das Flores, 123', hours: 'Seg-Sex 8h-18h', distance: '350m', x: 25, y: 40 },
  { id: 'm2', name: 'Recicla Eletrônicos', type: 'eletronicos', address: 'Av. Brasil, 456', hours: 'Seg-Sáb 9h-17h', distance: '800m', x: 60, y: 25 },
  { id: 'm3', name: 'Coleta de Óleo Usado', type: 'oleo', address: 'Rua Esperança, 78', hours: 'Seg-Sex 7h-16h', distance: '500m', x: 15, y: 70 },
  { id: 'm4', name: 'Feira de Trocas Sábado', type: 'trocas', address: 'Praça Central', hours: 'Sáb 8h-14h', distance: '1.2km', x: 37, y: 36 },
  { id: 'm5', name: 'Empório a Granel', type: 'granel', address: 'Rua Verde, 200', hours: 'Seg-Sáb 8h-20h', distance: '600m', x: 45, y: 56 },
  { id: 'm6', name: 'Conserta Tudo', type: 'reparo', address: 'Rua dos Artesãos, 15', hours: 'Seg-Sex 9h-18h', distance: '900m', x: 82, y: 72 },
  { id: 'm7', name: 'EcoPonto Pilhas Sul', type: 'baterias', address: 'Av. Sul, 890', hours: 'Seg-Sex 8h-17h', distance: '1.5km', x: 78, y: 85 },
  { id: 'm8', name: 'Brechó Sustentável', type: 'trocas', address: 'Rua Nova, 45', hours: 'Ter-Sáb 10h-19h', distance: '400m', x: 35, y: 14 },
];

export const MAP_TYPE_LABELS: Record<string, string> = {
  todos: 'Todos',
  baterias: 'Baterias',
  eletronicos: 'Eletrônicos',
  oleo: 'Óleo',
  trocas: 'Trocas',
  granel: 'Granel',
  reparo: 'Reparo',
};

export const MAP_DETAIL_LABELS: Record<string, string> = {
  baterias: 'Descarte de Baterias',
  eletronicos: 'Reciclagem Eletrônica',
  oleo: 'Coleta de Óleo',
  trocas: 'Troca/Brechó',
  granel: 'Compra a Granel',
  reparo: 'Reparo/Conserto',
};
