/**
 * Doutrinas — passivos leves duradouros adotados ao vencer rivais da Arena
 * pela primeira vez. Aplicação acontece em pontos de seam existentes
 * (tokensFromScan, ritual de doação) — nada altera mecânica de battle.
 */

export const DOCTRINE_BY_RIVAL: Record<string, string> = {
  'nami-solar': 'nami-solar:sol-firme',
  'tiao-reuso': 'tiao-reuso:mao-conserta',
  'luna-circuito': 'luna-circuito:circuito-limpo',
  'mestra-ginga': 'mestra-ginga:ritmo',
  'raiz-antiga': 'raiz-antiga:raiz-funda',
};

export const DOCTRINE_LABEL: Record<string, string> = {
  'nami-solar:sol-firme': 'Sol firme',
  'tiao-reuso:mao-conserta': 'Mão que conserta',
  'luna-circuito:circuito-limpo': 'Circuito limpo',
  'mestra-ginga:ritmo': 'Ritmo',
  'raiz-antiga:raiz-funda': 'Raiz funda',
};

export const DOCTRINE_DESCRIPTION: Record<string, string> = {
  'nami-solar:sol-firme': '+1 token base no scan entre 8h e 16h.',
  'tiao-reuso:mao-conserta': '+10% tokens em desafios cooperativos.',
  'luna-circuito:circuito-limpo':
    'Visita a Eletrônicos vale como scan virtual B no índice de qualidade.',
  'mestra-ginga:ritmo': '+1 token base no scan quando streak > 7 dias.',
  'raiz-antiga:raiz-funda': '+1 árvore extra na próxima doação.',
};
