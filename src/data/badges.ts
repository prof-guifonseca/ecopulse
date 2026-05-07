import type { Badge } from '@/types';

export const BADGES: Badge[] = [
  { id: 'first-scan', name: 'Primeiro Scan', iconName: 'camera', desc: 'Escaneou seu primeiro produto', tier: 'bronze' },
  { id: 'upcycler-1', name: 'Artesão Eco', iconName: 'scissors', desc: 'Completou um tutorial de upcycling', tier: 'bronze' },
  { id: 'week-streak', name: '7 Dias Firme', iconName: 'flame', desc: 'Manteve 7 dias de sequência', tier: 'bronze' },
  { id: 'map-explorer', name: 'Explorador', iconName: 'mapPin', desc: 'Visitou 3 pontos no mapa', tier: 'silver' },
  { id: 'social-star', name: 'Influencer Eco', iconName: 'star', desc: 'Publicou no feed social', tier: 'bronze' },
  { id: 'challenge-1', name: 'Desafiante', iconName: 'trophy', desc: 'Completou seu primeiro desafio', tier: 'silver' },
  { id: 'scanner-5', name: 'Scanner', iconName: 'package', desc: 'Escaneou 5 produtos', tier: 'silver' },
  { id: 'scanner-10', name: 'Scanner Pro', iconName: 'package', desc: 'Escaneou 10 produtos', tier: 'gold' },
  { id: 'token-100', name: 'Colecionador', iconName: 'coins', desc: 'Acumulou 100+ Eco-Tokens', tier: 'silver' },
  { id: 'tribe-member', name: 'Tribo Unida', iconName: 'users', desc: 'Entrou em uma tribo', tier: 'bronze' },
  { id: 'tree-grown', name: 'Árvore Madura', iconName: 'trees', desc: 'Jardim Eco atingiu estágio árvore', tier: 'epic' },
  { id: 'chat-first', name: 'Conversador', iconName: 'messageCircle', desc: 'Enviou sua primeira mensagem', tier: 'bronze' },
  { id: 'fashionista', name: 'Fashionista Eco', iconName: 'shirt', desc: 'Equipou 3 itens de outfit', tier: 'silver' },
  { id: 'arena-first', name: 'Primeira Vitória', iconName: 'trophy', desc: 'Venceu um treino de loadout', tier: 'silver' },
  { id: 'arena-trio', name: 'Trio Imbatível', iconName: 'target', desc: 'Venceu 3 treinos de loadout', tier: 'gold' },
];
