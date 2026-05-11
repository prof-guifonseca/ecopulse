import { expect, test, type Page } from '@playwright/test';

async function resetAppState(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
  });
}

async function seedOnboardedState(page: Page) {
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
          avatarLoadout: {
            baseId: 'base2',
            equippedGear: {},
            activeSetId: null,
          },
        },
        version: 5,
      })
    );
    localStorage.setItem(
      'ecopulse:game',
      JSON.stringify({
        state: {
          dailyMissions: { scan: false, likes: 0, map: false, bonusClaimed: false },
          lastMissionDay: today,
          todaysMissionIds: ['scan-any', 'social-replicate', 'map-any'],
          scannedProducts: [],
          visitedPoints: [],
          activeChallenges: [],
          completedChallenges: [],
          challengeProgress: {},
          badges: [],
          completedTutorials: [],
          ownedShopItems: [],
          realImpact: {
            treesPlanted: 0,
            batteriesKgEstimated: 0,
            oilLitersEstimated: 0,
            repairsCount: 0,
            exchangesCount: 0,
          },
        },
        version: 2,
      })
    );
    localStorage.setItem(
      'ecopulse:scanHistory',
      JSON.stringify({ state: { history: [] }, version: 1 })
    );
    localStorage.setItem(
      'ecopulse:social',
      JSON.stringify({ state: { likedPosts: [], following: [] }, version: 1 })
    );
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
      })
    );
    localStorage.setItem(
      'ecopulse:simulation',
      JSON.stringify({
        state: {
          config: {
            scenario: 'new-user',
            seed: 'e2e-new-user',
            regionId: 'londrina',
            startedAt: `${today}T09:00:00.000Z`,
            currentDay: today,
          },
          events: [],
          cursor: 0,
        },
        version: 1,
      })
    );
  });
}

async function gotoApp(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}

async function activateTab(page: Page, name: string, url: RegExp) {
  const tab = page.getByRole('tab', { name });
  await expect(tab).toBeVisible();
  await tab.focus();
  await expect(tab).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForURL(url, { waitUntil: 'domcontentloaded' });
}

test('root redirects a fresh install to onboarding', async ({ page }) => {
  await resetAppState(page);
  await gotoApp(page, '/');

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole('heading', { name: 'Sustentabilidade na rotina.' })).toBeVisible();
});

test('bottom navigation reaches the primary screens', async ({ page }) => {
  await seedOnboardedState(page);
  await gotoApp(page, '/home');

  const routes = [
    { tab: 'Scan', url: /\/scanner$/, heading: 'Scanner' },
    { tab: 'Mapa', url: /\/map$/, heading: 'Mapa' },
    { tab: 'Social', url: /\/community$/, heading: 'Comunidade' },
  ] as const;

  for (const route of routes) {
    await activateTab(page, route.tab, route.url);
    await expect(page.getByRole('heading', { name: route.heading, level: 1 })).toBeVisible();
  }

  await activateTab(page, 'Perfil', /\/profile$/);
  await expect(page.getByRole('heading', { name: 'Lia', level: 1 })).toBeVisible();
});

test('arena route renders the loadout test surface', async ({ page }) => {
  await seedOnboardedState(page);
  await gotoApp(page, '/arena');

  await expect(page.getByRole('heading', { name: 'Teste de Loadout', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /Testar loadout|Treino bloqueado/ })).toBeVisible();
});

test('scanner can search, simulate a scan, and restore modal focus', async ({ page }) => {
  await seedOnboardedState(page);
  await gotoApp(page, '/scanner');

  await expect(page.getByRole('heading', { name: 'Scanner', level: 1 })).toBeVisible();

  const search = page.getByRole('textbox', { name: 'Buscar produtos' });
  await search.fill('arroz');
  await expect(page.getByText(/arroz/i).first()).toBeVisible();
  await search.fill('');

  const scanButton = page.getByRole('button', { name: 'Simular scan' });
  await scanButton.click();
  await expect(page.getByRole('button', { name: /Lendo/ })).toBeVisible();

  const scanDialog = page.getByRole('dialog');
  await expect(scanDialog).toBeVisible({ timeout: 7_000 });
  await page.keyboard.press('Escape');
  await expect(scanDialog).toBeHidden();

  const firstCatalogItem = page
    .locator('section')
    .filter({ hasText: 'Catálogo' })
    .getByRole('button')
    .first();
  await firstCatalogItem.focus();
  await firstCatalogItem.press('Enter');

  const catalogDialog = page.getByRole('dialog');
  await expect(catalogDialog).toBeVisible();
  await expect(page.getByLabel('Fechar').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(catalogDialog).toBeHidden();
  await expect(firstCatalogItem).toBeFocused();
});

test('onboarding works when the demo seed is neutralized', async ({ page }) => {
  await resetAppState(page);
  await gotoApp(page, '/onboarding');

  await expect(page.getByRole('heading', { name: 'Sustentabilidade na rotina.' })).toBeVisible();
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: 'Três gestos.' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('heading', { name: 'Onde você se reconhece?' })).toBeVisible();
  await page.getByRole('button', { name: /Recicladores/ }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('textbox', { name: 'Seu primeiro nome' }).fill('Lia');
  await page.getByRole('button', { name: 'Começar' }).click();

  await expect(page).toHaveURL(/\/scanner\?welcome=1$/);
  await expect(page.getByText('Faça um scan para liberar a Home.')).toBeVisible();

  await page.getByRole('button', { name: 'Simular scan' }).click();
  const firstRunDialog = page.getByRole('dialog');
  await expect(firstRunDialog).toBeVisible({ timeout: 7_000 });
  await page.keyboard.press('Escape');
  await expect(firstRunDialog).toBeHidden();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText(/Hoje · rotina diária/)).toBeVisible();
});
