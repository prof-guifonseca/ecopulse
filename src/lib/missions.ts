import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens } from './gameActions';
import { hapticSuccess } from './haptic';

export type DailyMissionCheckMap = {
  dm1: boolean;
  dm2: boolean;
  dm3: boolean;
};

export type DailyActionKind = 'scan' | 'social' | 'map' | 'bonus' | 'complete';

export interface DailyAction {
  kind: DailyActionKind;
  title: string;
  body: string;
  ctaLabel: string;
  href?: string;
  reward?: number;
  completedCount: number;
}

export interface DailyMissionStateSnapshot {
  scan: boolean;
  likes: number;
  map: boolean;
}

export function buildMissionChecks(dm: DailyMissionStateSnapshot): DailyMissionCheckMap {
  return {
    dm1: dm.scan,
    dm2: dm.likes >= 2,
    dm3: dm.map,
  };
}

export function missionChecks() {
  return buildMissionChecks(useGameStore.getState().dailyMissions);
}

export function resolveDailyAction(checks: DailyMissionCheckMap, bonusClaimed: boolean): DailyAction {
  const completedCount = Object.values(checks).filter(Boolean).length;

  if (!checks.dm1) {
    return {
      kind: 'scan',
      title: 'Escaneie 1 produto',
      body: 'Registre um item e avance o dia.',
      ctaLabel: 'Abrir scanner',
      href: '/scanner',
      reward: 10,
      completedCount,
    };
  }

  if (!checks.dm2) {
    return {
      kind: 'social',
      title: 'Dê 2 likes',
      body: 'Interaja com posts da comunidade.',
      ctaLabel: 'Ver comunidade',
      href: '/community',
      reward: 8,
      completedCount,
    };
  }

  if (!checks.dm3) {
    return {
      kind: 'map',
      title: 'Visite 1 ponto',
      body: 'Marque uma visita sustentável.',
      ctaLabel: 'Abrir mapa',
      href: '/map',
      reward: 7,
      completedCount,
    };
  }

  if (!bonusClaimed) {
    return {
      kind: 'bonus',
      title: 'Colete o bônus',
      body: 'As três missões estão completas.',
      ctaLabel: 'Coletar bônus diário',
      reward: 25,
      completedCount,
    };
  }

  return {
    kind: 'complete',
    title: 'Dia concluído',
    body: 'A Arena está livre para um treino.',
    ctaLabel: 'Ir para Arena',
    href: '/arena',
    completedCount,
  };
}

export function tryClaimDailyBonus() {
  const dm = useGameStore.getState().dailyMissions;
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  if (done === 3 && !dm.bonusClaimed) {
    useGameStore.getState().claimBonus();
    awardTokens(25);
  useUIStore.getState().showToast('Bônus diário · +25 tokens', 'reward');
    useUIStore.getState().fireConfetti();
    hapticSuccess();
  }
}
