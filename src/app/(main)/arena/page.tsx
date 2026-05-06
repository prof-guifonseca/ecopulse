import type { Metadata } from 'next';
import { ArenaPage } from '@/components/arena/ArenaPage';

export const metadata: Metadata = {
  title: 'Arena — EcoPulse',
  description: 'Batalhas simuladas entre personagens e rivais de IA.',
};

export default function Page() {
  return <ArenaPage />;
}
