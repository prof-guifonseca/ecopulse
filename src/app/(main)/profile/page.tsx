import type { Metadata } from 'next';
import { ProfilePage } from '@/components/profile/ProfilePage';

export const metadata: Metadata = {
  title: 'Perfil — EcoPulse',
  description: 'Seu impacto, sua loja, suas conquistas.',
};

export default function Page() {
  return <ProfilePage />;
}
