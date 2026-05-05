import type { Metadata } from 'next';
import { MapPage } from '@/components/map/MapPage';

export const metadata: Metadata = {
  title: 'Mapa · Londrina — EcoPulse',
  description: 'Pontos de coleta, brechós e reparo no centro de Londrina.',
};

export default function Page() {
  return <MapPage />;
}
