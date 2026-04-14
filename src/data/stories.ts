import type { Story } from '@/types';

export const STORIES: Story[] = [
  {
    user: 'Marina',
    avatar: '👩‍🎨',
    emoji: '📦',
    text: 'Meu organizador ficou lindo! Valeu o tutorial do app.',
    poll: { q: 'Qual material você mais reutiliza?', opts: ['Vidro', 'Plástico', 'Tecido', 'Papel'], pcts: [35, 25, 20, 20] },
  },
  {
    user: 'Pedro',
    avatar: '🧑‍💻',
    emoji: '🔋',
    text: 'Sabia que pilhas levam 500 anos pra se decompor? Descarte certo!',
    poll: { q: 'Você sabe onde descartar pilhas?', opts: ['Sim, uso o Mapa Vivo!', 'Não sabia onde', 'Guardo em casa ainda'], pcts: [45, 30, 25] },
  },
  {
    user: 'Julia',
    avatar: '👩‍🌾',
    emoji: '🌱',
    text: 'Colhi tomates da minha horta vertical hoje! Nada melhor que comida fresca.',
    poll: { q: 'O que você plantaria primeiro?', opts: ['Temperos', 'Tomates', 'Flores', 'Alface'], pcts: [40, 30, 15, 15] },
  },
  {
    user: 'Rafael',
    avatar: '🧑‍🎤',
    emoji: '🫙',
    text: 'Dica: compre a granel e leve seus próprios potes. Economiza e gera zero lixo!',
    poll: { q: 'Já comprou a granel alguma vez?', opts: ['Sim, sempre!', 'Já experimentei', 'Nunca, mas quero', 'Não tenho onde'], pcts: [20, 35, 30, 15] },
  },
  {
    user: 'Camila',
    avatar: '👩‍🔬',
    emoji: '🧪',
    text: 'Minha composteira caseira já produziu 5kg de adubo!',
    poll: { q: 'O que te impede de compostar?', opts: ['Falta de espaço', 'Não sei como', 'Cheiro', 'Nada, já faço!'], pcts: [30, 35, 15, 20] },
  },
];
