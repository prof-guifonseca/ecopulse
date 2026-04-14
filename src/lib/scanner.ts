import type { Product, Score } from '@/types';

export const SCORE_COLORS: Record<Score, string> = {
  A: 'var(--accent-green)',
  B: 'var(--accent-cyan)',
  C: 'var(--accent-gold)',
  D: 'var(--accent-orange)',
  E: 'var(--accent-red)',
};

export const BREAKDOWN_LABELS: Record<string, string> = {
  carbono: 'Pegada de Carbono',
  embalagem: 'Embalagem',
  reciclabilidade: 'Reciclabilidade',
  origem: 'Origem/Cadeia',
};

const ORDER: Score[] = ['A', 'B', 'C', 'D', 'E'];

export function findAlternatives(product: Product, all: Product[]): Product[] {
  const pIdx = ORDER.indexOf(product.score);
  if (pIdx < 2) return [];
  const sameCategory = all
    .filter((x) => ORDER.indexOf(x.score) < pIdx && x.category === product.category)
    .slice(0, 3);
  if (sameCategory.length > 0) return sameCategory;
  return all.filter((x) => ORDER.indexOf(x.score) < 2 && x.id !== product.id).slice(0, 2);
}
