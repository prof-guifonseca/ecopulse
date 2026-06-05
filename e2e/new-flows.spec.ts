import { expect, test, type Page } from '@playwright/test';

// Seeds an onboarded user that already has some verified impact (a couple of
// logged visits) and one product scan in history, so the profile honesty labels
// and the share surfaces are present without driving the full flow.
async function seedOnboardedWithActivity(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(
      'ecopulse:user',
      JSON.stringify({
        state: {
          name: 'Lia',
          tribe: 'recicladores',
          regionId: 'londrina',
          onboarded: true,
          firstScanCompleted: true,
          avatarBase: 'base2',
          avatarLoadout: { baseId: 'base2', equippedGear: {}, activeSetId: null },
        },
        version: 5,
      }),
    );
    localStorage.setItem(
      'ecopulse:game',
      JSON.stringify({
        state: {
          dailyMissions: { scan: false, likes: 0, map: false, bonusClaimed: false },
          lastMissionDay: today,
          todaysMissionIds: ['scan-any', 'social-replicate', 'map-any'],
          scannedProducts: ['off:7891000000001'],
          visitedPoints: [],
          activeChallenges: [],
          completedChallenges: [],
          challengeProgress: {},
          badges: [],
          completedTutorials: [],
          ownedShopItems: [],
          realImpact: {
            treesPlanted: 1,
            batteriesKgEstimated: 0.5,
            oilLitersEstimated: 1,
            repairsCount: 1,
            exchangesCount: 1,
          },
        },
        version: 2,
      }),
    );
    localStorage.setItem(
      'ecopulse:scanHistory',
      JSON.stringify({
        state: {
          history: [
            {
              id: 'off:7891000000001',
              source: 'provider',
              barcode: '7891000000001',
              productId: 'off:7891000000001',
              name: 'Arroz Integral OSM',
              brand: 'Cooperativa Teste',
              category: 'Alimentos',
              emoji: '🍚',
              score: 'B',
              breakdown: { carbono: 70, embalagem: 80, reciclabilidade: 80, origem: 75 },
              tip: 'Boa escolha para o ciclo diário.',
              rationale: ['Open Food Facts', 'Origem nacional'],
              confidence: 82,
              evidence: {
                packagingTags: ['paper'],
                countriesTags: ['brazil'],
                novaGroup: 1,
                ecoscoreGrade: 'b',
                image: true,
                fields: ['packaging', 'nova_group', 'ecoscore_grade', 'countries_tags'],
              },
              scannedAt: `${today}T10:00:00.000Z`,
            },
          ],
        },
        version: 1,
      }),
    );
    localStorage.setItem('ecopulse:social', JSON.stringify({ state: { likedPosts: [], following: [] }, version: 1 }));
    localStorage.setItem(
      'ecopulse:arena',
      JSON.stringify({
        state: {
          wins: 0,
          losses: 0,
          defeatedOpponents: [],
          lastBattle: null,
          history: [],
          arenaXp: 0,
          arenaLevel: 1,
          winStreak: 0,
          bestStreak: 0,
          rivalMastery: {},
        },
        version: 2,
      }),
    );
    localStorage.setItem(
      'ecopulse:simulation',
      JSON.stringify({
        state: {
          config: {
            scenario: 'new-user',
            seed: 'e2e-new-flows',
            regionId: 'londrina',
            startedAt: `${today}T09:00:00.000Z`,
            currentDay: today,
          },
          events: [],
          cursor: 0,
        },
        version: 1,
      }),
    );
  });
}

test('profile separates estimated from verified impact', async ({ page }) => {
  await seedOnboardedWithActivity(page);
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Floresta EcoPulse' })).toBeVisible();
  // Honesty labels: verified actions (visits) vs estimated magnitudes (kg/L) and
  // the scan-derived impact panel.
  await expect(page.getByText('Verificado').first()).toBeVisible();
  await expect(page.getByText('Estimado').first()).toBeVisible();
  await expect(page.getByText('impacto estimado por evidências dos produtos')).toBeVisible();
  await expect(
    page.getByText('massas (kg/L) são estimativas por visita, não medições.'),
  ).toBeVisible();
});

test('a scanned product can be shared as a score card', async ({ page }) => {
  await seedOnboardedWithActivity(page);
  await page.goto('/scanner', { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Scanner', level: 1 })).toBeVisible();

  const recentScan = page
    .locator('section')
    .filter({ hasText: 'Scans recentes' })
    .getByRole('button')
    .first();
  await recentScan.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Arroz Integral OSM' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Compartilhar nota' })).toBeVisible();
});
