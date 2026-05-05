import type { Metadata } from 'next';
import { HomePage } from '@/components/home/HomePage';

export const metadata: Metadata = {
  title: 'Início — EcoPulse',
  description: 'Seu painel diário: missões, desafios e atalhos do dia.',
};

export default function Page() {
  return <HomePage />;
}
