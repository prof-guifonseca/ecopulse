import type { Metadata } from 'next';
import { ProfilePage } from '@/components/profile/ProfilePage';

export const metadata: Metadata = {
  title: 'Perfil — EcoPulse',
  description: 'Seu impacto, seu vestiário, suas conquistas.',
};

type ProfileSearchParams = {
  tab?: string | string[] | undefined;
};

type ProfileTab = 'impact' | 'shop' | 'badges';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<ProfileSearchParams>;
}) {
  const tab = (await searchParams).tab;
  const initialTab = parseProfileTab(tab);

  return <ProfilePage initialTab={initialTab} />;
}

function parseProfileTab(tab: ProfileSearchParams['tab']): ProfileTab | undefined {
  if (tab === 'impact' || tab === 'shop' || tab === 'badges') return tab;
  return undefined;
}
