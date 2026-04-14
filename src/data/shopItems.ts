import type { ShopItem } from '@/types';

export const SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: 'Flor Rara', emoji: '🌺', desc: 'Decore seu jardim', price: 50, type: 'garden' },
  { id: 's2', name: 'Borboleta', emoji: '🦋', desc: 'Animação no jardim', price: 80, type: 'garden' },
  { id: 's3', name: 'Joaninha', emoji: '🐞', desc: 'Visitante do jardim', price: 60, type: 'garden' },
  { id: 's4', name: 'Moldura Ouro', emoji: '🖼️', desc: 'Moldura de perfil', price: 100, type: 'frame' },
  { id: 's5', name: 'Boost 2x', emoji: '⚡', desc: '2x tokens por 24h', price: 120, type: 'boost' },
  { id: 's6', name: 'Plantar Árvore', emoji: '🌳', desc: 'Doação: 1 árvore real', price: 500, type: 'donation' },
];
