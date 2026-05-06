import type { Metadata } from 'next';
import { ArenaPage } from '@/components/arena/ArenaPage';

export const metadata: Metadata = {
  title: 'Arena — EcoPulse',
  description: 'Mini-RPG tático local por rounds contra rivais de IA.',
};

export default function Page() {
  return <ArenaPage />;
}
