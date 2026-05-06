import type { Metadata } from 'next';
import { CommunityPage } from '@/components/community/CommunityPage';

export const metadata: Metadata = {
  title: 'Comunidade — EcoPulse',
  description: 'Comunidade EcoPulse Londrina.',
};

export default function Page() {
  return <CommunityPage />;
}
