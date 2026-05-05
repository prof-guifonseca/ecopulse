import type { Story } from '@/types';

export const STORIES: Story[] = [
  {
    user: 'Marina',
    avatar: '👩‍🎨',
    imageKey: 'upcyclingCrafts',
    text: 'Organizador novo, lixo zero.',
    poll: { q: 'Qual material você mais reutiliza?', opts: ['Vidro', 'Plástico', 'Tecido', 'Papel'], pcts: [35, 25, 20, 20] },
  },
  {
    user: 'Pedro',
    avatar: '🧑‍💻',
    imageKey: 'recyclingBins',
    text: 'Pilhas levam 500 anos pra decompor.',
    poll: { q: 'Sabe onde descartar pilhas?', opts: ['Sim, uso o Mapa', 'Não sabia', 'Guardo em casa'], pcts: [45, 30, 25] },
  },
  {
    user: 'Julia',
    avatar: '👩‍🌾',
    imageKey: 'urbanGarden',
    text: 'Tomate da minha horta hoje.',
    poll: { q: 'O que plantaria primeiro?', opts: ['Temperos', 'Tomates', 'Flores', 'Alface'], pcts: [40, 30, 15, 15] },
  },
  {
    user: 'Rafael',
    avatar: '🧑‍🎤',
    imageKey: 'bulkShopping',
    text: 'A granel com pote próprio. Zero lixo.',
    poll: { q: 'Já comprou a granel?', opts: ['Sim, sempre', 'Já experimentei', 'Nunca, mas quero', 'Não tenho onde'], pcts: [20, 35, 30, 15] },
  },
  {
    user: 'Camila',
    avatar: '👩‍🔬',
    imageKey: 'composting',
    text: 'Composteira caseira: 5kg de adubo.',
    poll: { q: 'O que te impede de compostar?', opts: ['Falta de espaço', 'Não sei como', 'Cheiro', 'Já faço'], pcts: [30, 35, 15, 20] },
  },
];
