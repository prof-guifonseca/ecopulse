import type { DailyMission } from '@/types';

export const DAILY_MISSIONS: DailyMission[] = [
  { id: 'dm1', title: 'Escaneie 1 produto', reward: 10, check: 'scan', emoji: '📱', iconName: 'camera' },
  { id: 'dm2', title: 'Dê like em 2 posts', reward: 8, check: 'likes', target: 2, emoji: '💚', iconName: 'heart' },
  { id: 'dm3', title: 'Visite um ponto no mapa', reward: 7, check: 'map', emoji: '🗺️', iconName: 'mapPin' },
];
