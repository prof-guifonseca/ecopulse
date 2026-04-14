import type { Tutorial } from '@/types';

export const TUTORIALS: Tutorial[] = [
  { id: 't1', title: 'Vaso de Plantas com Pote de Vidro', difficulty: 1, time: '20min', materials: ['Pote de vidro', 'Tinta acrílica', 'Terra', 'Sementes'], steps: 5, tokens: 15, emoji: '🪴', gradient: 'linear-gradient(135deg,#2d6a4f,#52b788)' },
  { id: 't2', title: 'Organizador de Caixas de Leite', difficulty: 1, time: '30min', materials: ['Caixas de leite', 'Tesoura', 'Cola', 'Tecido'], steps: 6, tokens: 15, emoji: '📦', gradient: 'linear-gradient(135deg,#3a86ff,#48bfe3)' },
  { id: 't3', title: 'Bolsa com Camiseta Velha', difficulty: 2, time: '45min', materials: ['Camiseta velha', 'Tesoura', 'Agulha', 'Linha'], steps: 8, tokens: 25, emoji: '👜', gradient: 'linear-gradient(135deg,#e76f51,#f4a261)' },
  { id: 't4', title: 'Luminária de Garrafa PET', difficulty: 2, time: '40min', materials: ['Garrafa PET', 'Estilete', 'Fio elétrico', 'Lâmpada LED'], steps: 7, tokens: 25, emoji: '💡', gradient: 'linear-gradient(135deg,#FFD166,#FFA94D)' },
  { id: 't5', title: 'Horta Vertical com Paletes', difficulty: 3, time: '90min', materials: ['Palete', 'Pregos', 'Vasos', 'Terra', 'Mudas'], steps: 10, tokens: 40, emoji: '🌱', gradient: 'linear-gradient(135deg,#006d77,#83c5be)' },
  { id: 't6', title: 'Banco de Pneu Reciclado', difficulty: 3, time: '120min', materials: ['Pneu velho', 'Corda sisal', 'Cola forte', 'Espuma', 'Tecido'], steps: 12, tokens: 50, emoji: '🛞', gradient: 'linear-gradient(135deg,#7b2cbf,#c77dff)' },
];
