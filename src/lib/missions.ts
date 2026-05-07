import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { getMissionTemplate } from '@/data';
import type { MissionTemplate } from '@/data/missionPool';
import { getTribe, type TribeId } from '@/data/tribes';
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

interface MissionResolverContext {
  templates: ReadonlyArray<MissionTemplate | null>;
  tribe: TribeId;
}

function resolverContext(): MissionResolverContext {
  const game = useGameStore.getState();
  const user = useUserStore.getState();
  const tribe = (user.tribe ?? 'guardioes') as TribeId;
  const templates = game.todaysMissionIds.map((id) => getMissionTemplate(id));
  return { templates, tribe };
}

function templateBySlot(
  templates: ReadonlyArray<MissionTemplate | null>,
  slot: 'scan' | 'map' | 'social'
): MissionTemplate | null {
  return templates.find((t): t is MissionTemplate => t?.slot === slot) ?? null;
}

function flavor(template: MissionTemplate, tribe: TribeId) {
  return template.flavorByTribe[tribe] ?? template.flavorByTribe.guardioes;
}

/**
 * Returns whether each of today's three slots is satisfied. Falls back to
 * the legacy fixed targets when no pool is populated.
 */
export function buildMissionChecks(
  dm: DailyMissionStateSnapshot,
  ctx: MissionResolverContext = resolverContext()
): DailyMissionCheckMap {
  const socialT = templateBySlot(ctx.templates, 'social');

  const dm1 = dm.scan; // scan is a one-shot per day regardless of target.
  const dm2 = dm.likes >= (socialT?.target ?? 2);
  const dm3 = dm.map;

  return { dm1, dm2, dm3 };
}

export function missionChecks() {
  return buildMissionChecks(useGameStore.getState().dailyMissions);
}

export function resolveDailyAction(
  checks: DailyMissionCheckMap,
  bonusClaimed: boolean,
  ctx: MissionResolverContext = resolverContext()
): DailyAction {
  const completedCount = Object.values(checks).filter(Boolean).length;
  const tribe = ctx.tribe;

  const scanT = templateBySlot(ctx.templates, 'scan');
  const mapT = templateBySlot(ctx.templates, 'map');
  const socialT = templateBySlot(ctx.templates, 'social');

  if (!checks.dm1) {
    const f = scanT
      ? flavor(scanT, tribe)
      : { title: 'Escaneie 1 produto', body: 'Registre um item e avance o dia.' };
    return {
      kind: 'scan',
      title: f.title,
      body: f.body,
      ctaLabel: 'Abrir scanner',
      href: '/scanner',
      reward: scanT?.reward ?? 10,
      completedCount,
    };
  }

  if (!checks.dm2) {
    const f = socialT
      ? flavor(socialT, tribe)
      : { title: 'Dê 2 likes', body: 'Interaja com posts da comunidade.' };
    return {
      kind: 'social',
      title: f.title,
      body: f.body,
      ctaLabel: 'Ver comunidade',
      href: '/community',
      reward: socialT?.reward ?? 8,
      completedCount,
    };
  }

  if (!checks.dm3) {
    const f = mapT
      ? flavor(mapT, tribe)
      : { title: 'Visite 1 ponto', body: 'Marque uma visita sustentável.' };
    return {
      kind: 'map',
      title: f.title,
      body: f.body,
      ctaLabel: 'Abrir mapa',
      href: '/map',
      reward: mapT?.reward ?? 7,
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
    title: 'Teste seu loadout',
    body: 'Seu ciclo do dia fechou. Ajuste o Vestiário e leve o conjunto para um treino.',
    ctaLabel: 'Abrir Vestiário',
    href: '/profile?tab=shop',
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

/** Re-export for components that build flavor on their own. */
export { flavor as missionFlavor, templateBySlot, getTribe };
