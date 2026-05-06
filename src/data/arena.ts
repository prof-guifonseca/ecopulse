import type { ArenaOpponent } from '@/types';

export const ARENA_OPPONENTS: ArenaOpponent[] = [
  {
    id: 'nami-solar',
    name: 'Nami Solar',
    title: 'Aprendiz da compostagem',
    difficulty: 1,
    quote: 'Minha energia vem do sol. Vamos ver se a sua vem do hábito.',
    skinPackId: 'ciclista-verde',
    stats: { hp: 92, attack: 18, defense: 12, speed: 14, focus: 11 },
  },
  {
    id: 'tiao-reuso',
    name: 'Tião Reuso',
    title: 'Mestre das gambiarras boas',
    difficulty: 2,
    quote: 'Nada se perde. Nem esse round.',
    skinPackId: 'aventureiro',
    stats: { hp: 104, attack: 21, defense: 15, speed: 12, focus: 13 },
  },
  {
    id: 'luna-circuito',
    name: 'Luna Circuito',
    title: 'Estrategista dos recicláveis',
    difficulty: 3,
    quote: 'Meu plano tem três etapas: reduzir, reutilizar e vencer.',
    skinPackId: 'cyber-reciclador',
    stats: { hp: 112, attack: 23, defense: 16, speed: 16, focus: 18 },
  },
  {
    id: 'mestra-ginga',
    name: 'Mestra Ginga',
    title: 'Guardião do movimento limpo',
    difficulty: 4,
    quote: 'Quem cuida do corpo também cuida do caminho.',
    skinPackId: 'capoeirista',
    stats: { hp: 124, attack: 27, defense: 18, speed: 20, focus: 17 },
  },
  {
    id: 'raiz-antiga',
    name: 'Raiz Antiga',
    title: 'Campeão da floresta',
    difficulty: 5,
    quote: 'Cresci devagar. Luto do mesmo jeito: firme.',
    skinPackId: 'guardiao-da-floresta',
    stats: { hp: 150, attack: 31, defense: 24, speed: 15, focus: 22 },
  },
];
