import type { Metadata } from 'next';
import { ArenaPage } from '@/components/arena/ArenaPage';

export const metadata: Metadata = {
  title: 'Teste de Loadout — EcoPulse',
  description: 'Treino tático local para validar conjuntos e equipamentos do Vestiário.',
};

export default function Page() {
  return <ArenaPage />;
}
