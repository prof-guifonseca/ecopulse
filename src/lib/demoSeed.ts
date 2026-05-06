import { ARENA_OPPONENTS, AVATAR_OUTFITS, PRODUCTS, SKIN_PACKS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useArenaStore } from '@/store/arenaStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import {
  createPlayerFighter,
  opponentToFighter,
  simulateBattle,
} from '@/lib/battle/rules';
import { scanRecordFromProduct } from '@/lib/simulatedScan';

/**
 * One-shot demo state seeder. Idempotent via the `ecopulse:seeded:v1`
 * sentinel in localStorage — running a second time on the same device is a
 * no-op so a real return visit doesn't get clobbered.
 *
 * Persona: Arthur, "Guardião Verde", level 7, 480 tokens, 12-day streak,
 * 23 scans, 8 badges, 6 SkinPacks unlocked, 5 visited points, 1 challenge in
 * progress, 4 tutorials done. The shape of someone who's been using the app
 * for a couple of weeks — populated enough that no screen feels empty in the
 * first 5 seconds of a stakeholder demo.
 */

const SEED_SENTINEL = 'ecopulse:seeded:v1';

export function isDemoSeeded(): boolean {
  if (typeof window === 'undefined') return true; // SSR: pretend seeded
  return localStorage.getItem(SEED_SENTINEL) === '1';
}

export function clearDemoSeed(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SEED_SENTINEL);
  localStorage.removeItem('ecopulse:user');
  localStorage.removeItem('ecopulse:game');
  localStorage.removeItem('ecopulse:arena');
  localStorage.removeItem('ecopulse:scanHistory');
  localStorage.removeItem('ecopulse:social');
  // Force a reload so all stores re-hydrate fresh.
  window.location.reload();
}

export function seedDemoStateIfEmpty(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEED_SENTINEL) === '1') {
    seedArenaDemoIfEmpty();
    return;
  }

  // Pick 23 products spanning the full A–E range so the history feels
  // diverse (Arthur's a real shopper, not a saint).
  const sampledProducts = pickDiverseProducts(23);

  // Spread the scans across the past 6 days so the timeline reads as
  // organic rotina vs a single binge session.
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const records = sampledProducts.map((product, index) => {
    const ageDays = (index / sampledProducts.length) * 6; // 0–6 days back
    const scannedAt = new Date(now - ageDays * dayMs).toISOString();
    return scanRecordFromProduct(product, 'seed', scannedAt);
  });

  // Drop the seeded scans into the history store. We push from oldest to
  // newest so the most recent entry ends up at the top.
  const recordScan = useScanHistoryStore.getState().recordScan;
  for (let i = records.length - 1; i >= 0; i--) {
    recordScan(records[i]);
  }

  // User profile — Arthur, level 7.
  // xpToNext at level 7 follows 100 * 1.4^(level-1) ≈ 750.
  useUserStore.getState().setProfile({
    name: 'Arthur',
    tribe: 'guardioes',
    level: 7,
    xp: 320,
    xpToNext: 750,
    tokens: 480,
    tokensToday: 30,
    streak: 12,
    onboarded: true,
    firstScanCompleted: true,
    avatarBase: 'base2', // Musgo — deep moss green
    avatarOutfits: {
      hat: 'hat2', // Coroa de Flores
      glasses: 'glass2', // Óculos Eco-Tech
      shirt: 'shirt2', // Colete Nature
      accessory: 'acc1', // Mochila Eco
      background: 'bg1', // Aura Verde
      weapon: null,
      hairstyle: null,
    },
    ownedOutfits: ['hat1', 'hat2', 'hat3', 'glass1', 'glass2', 'shirt1', 'shirt2', 'acc1', 'acc2', 'bg1'],
    equippedSkinPack: 'cyber-reciclador',
    ownedSkinPacks: [
      'ciclista-verde',
      'cyber-reciclador',
      'cientista-eco',
      'ninja-eco',
      'pirata-recicla',
      'capoeirista',
    ],
  });

  // Game state — 8 badges, scans synced with history, mid-flight challenge.
  const game = useGameStore.getState();

  for (const id of [
    'first-scan',
    'upcycler-1',
    'week-streak',
    'map-explorer',
    'social-star',
    'challenge-1',
    'scanner-5',
    'token-100',
  ]) {
    game.unlockBadge(id);
  }

  for (const product of sampledProducts) {
    game.addScannedProduct(product.id);
  }

  for (const id of [
    'ldb-bat-centro',
    'ldb-granel-empório',
    'ldb-troca-feira',
    'ldb-rep-centro',
    'ldb-bat-aurora',
  ]) {
    game.addVisitedPoint(id);
  }

  for (const id of ['shop-garden', 'shop-frame']) {
    game.addOwnedShopItem(id);
  }

  game.completeChallenge('c2'); // Mutirão de Limpeza
  game.completeChallenge('c3'); // Scan 10 Produtos
  game.joinChallenge('c1'); // 7 Dias Sem Plástico — in flight
  game.advanceChallenge('c1', 7);
  game.advanceChallenge('c1', 7);
  game.advanceChallenge('c1', 7); // 3/7 days

  for (const id of ['t1', 't2', 't3', 't4']) {
    game.completeTutorial(id);
  }

  // Today's daily missions — Arthur already scanned today, the rest are open.
  game.markMission('scan', true);
  const today = new Date().toISOString().slice(0, 10);
  game.setLastMissionDay(today);

  seedArenaDemoIfEmpty();

  localStorage.setItem(SEED_SENTINEL, '1');
}

function seedArenaDemoIfEmpty(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('ecopulse:arena')) return;

  const user = useUserStore.getState();
  const opponent = ARENA_OPPONENTS[0];
  if (!opponent) return;

  const result = simulateBattle({
    player: createPlayerFighter({
      name: user.name,
      title: 'Cyber Reciclador',
      level: user.level,
      skinPackId: user.equippedSkinPack,
      avatarBase: user.avatarBase,
      avatarOutfits: user.avatarOutfits,
      skinPacks: SKIN_PACKS,
      outfits: AVATAR_OUTFITS,
    }),
    opponent: opponentToFighter(opponent),
    opponentId: opponent.id,
    seed: 'demo-arena-arthur-v1',
    playedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  });

  useArenaStore.getState().setDemoProgress({
    wins: result.outcome === 'win' ? 1 : 0,
    losses: result.outcome === 'loss' ? 1 : 0,
    defeatedOpponents: result.outcome === 'win' ? [opponent.id] : [],
    lastBattle: result,
    history: [result],
  });
}

/**
 * Distribute the picks across the full score range so the seeded history
 * doesn't look like a saint or a sinner — it looks like real shopping.
 * Order roughly: A B C D E B A C C D B A E C ... — diversity first, repeats fine.
 */
function pickDiverseProducts(count: number) {
  const byScore = {
    A: PRODUCTS.filter((p) => p.score === 'A'),
    B: PRODUCTS.filter((p) => p.score === 'B'),
    C: PRODUCTS.filter((p) => p.score === 'C'),
    D: PRODUCTS.filter((p) => p.score === 'D'),
    E: PRODUCTS.filter((p) => p.score === 'E'),
  };
  // Realistic shopper mix: ~30% A/B (intentional), ~50% C (default), ~20% D/E (slips).
  const targets: Array<keyof typeof byScore> = [
    'C', 'B', 'A', 'C', 'D', 'B', 'C', 'A', 'C', 'B',
    'D', 'B', 'C', 'C', 'A', 'B', 'E', 'C', 'B', 'A',
    'C', 'D', 'B',
  ];
  const out: typeof PRODUCTS = [];
  const cursor: Record<keyof typeof byScore, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (let i = 0; i < count; i++) {
    const grade = targets[i % targets.length];
    const pool = byScore[grade];
    if (pool.length === 0) continue;
    out.push(pool[cursor[grade] % pool.length]);
    cursor[grade] += 1;
  }
  return out;
}
