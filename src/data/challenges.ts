import type { Challenge } from '@/types';

export const CHALLENGES: Challenge[] = [
  { id: 'c1', title: '7 Dias Sem Plástico Descartável', type: 'individual', duration: 7, currentDay: 3, tokens: 50, participants: 1284, emoji: '🚫' },
  { id: 'c2', title: 'Mutirão de Limpeza do Bairro', type: 'cooperativo', duration: 1, currentDay: 0, tokens: 100, participants: 47, emoji: '🧹' },
  { id: 'c3', title: 'Scan 10 Produtos Esta Semana', type: 'individual', duration: 10, currentDay: 2, tokens: 30, participants: 856, emoji: '📱' },
  { id: 'c4', title: 'Troca de Roupas com Amigos', type: 'cooperativo', duration: 3, currentDay: 1, tokens: 60, participants: 192, emoji: '👕' },
];
