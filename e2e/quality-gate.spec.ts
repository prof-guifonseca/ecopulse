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

async function mockEsgPlaces(page: Page, opts: { source?: 'osm' | 'simulation' | 'cache'; gpsName?: string } = {}) {
  const source = opts.source ?? 'osm';
  const gpsName = opts.gpsName ?? 'Recicla Centro OSM';
  await page.route('**/api/esg/places**', async (route) => {
    const url = new URL(route.request().url());
    const isGps = url.searchParams.has('lat');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        source,
        generatedAt: new Date().toISOString(),
        reason: source === 'simulation' ? 'osm-error:test' : undefined,
        points: [
          {
            id: source === 'simulation' ? 'ldb-bat-centro' : 'osm:node:9001',
            source,
            sourceId: source === 'simulation' ? 'simulation:ldb-bat-centro' : 'node/9001',
            name: isGps ? gpsName : source === 'simulation' ? 'EcoPonto Pilhas Centro' : 'Recicla Centro OSM',
            category: 'batteries',
            categories: ['batteries', 'recycling'],
            address: 'Centro · Rua Sergipe, 489',
            openingHours: 'Mo-Fr 08:00-18:00',
            phone: '+55 43 99999-0000',
            lat: -23.311,
            lng: -51.161,
            confidence: source === 'simulation' ? 65 : 91,
            tags: { test: 'true' },
            sourceUrl: source === 'simulation' ? undefined : 'https://www.openstreetmap.org/node/9001',
          },
          {
            id: source === 'simulation' ? 'ldb-rep-centro' : 'osm:node:9002',
            source,
            sourceId: source === 'simulation' ? 'simulation:ldb-rep-centro' : 'node/9002',
            name: 'Conserta Tudo OSM',
            category: 'repair',
            categories: ['repair'],
            address: 'Centro · Rua Espírito Santo, 410',
            openingHours: 'Mo-Fr 09:00-18:00',
            lat: -23.3138,
            lng: -51.1608,
            confidence: source === 'simulation' ? 65 : 86,
            tags: { test: 'true' },
          },
        ],
      }),
    });
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
  await mockEsgPlaces(page);
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

test('map renders live ESG points, filters them, and restores modal focus', async ({ page }) => {
  await seedOnboardedState(page);
  await mockEsgPlaces(page);
  await gotoApp(page, '/map');

  await expect(page.getByTestId('maplibre-surface')).toBeVisible();
  await expect(page.getByText('Recicla Centro OSM').first()).toBeVisible();
  await expect(page.getByText(/OpenStreetMap/).first()).toBeVisible();

  await page.getByRole('button', { name: 'Reparo' }).click();
  await expect(page.getByText('Conserta Tudo OSM').first()).toBeVisible();
  await expect(page.getByText('Recicla Centro OSM')).toBeHidden();

  const placeButton = page
    .locator('li')
    .filter({ hasText: 'Conserta Tudo OSM' })
    .getByRole('button')
    .first();
  await placeButton.focus();
  await placeButton.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByText(/OpenStreetMap · 86%/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(placeButton).toBeFocused();
});

test('map falls back to simulated ESG points when the API reports simulation', async ({ page }) => {
  await seedOnboardedState(page);
  await mockEsgPlaces(page, { source: 'simulation' });
  await gotoApp(page, '/map');

  await expect(page.getByText('Simulado').first()).toBeVisible();
  await expect(page.getByText('Pontos simulados ativos enquanto a fonte aberta responde.')).toBeVisible();
  await expect(page.getByText('EcoPonto Pilhas Centro').first()).toBeVisible();
});

test('map can search near the mocked browser location', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: {
              latitude: -23.31,
              longitude: -51.16,
              accuracy: 25,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition),
        watchPosition: () => 1,
        clearWatch: () => undefined,
      },
    });
  });
  await seedOnboardedState(page);
  await mockEsgPlaces(page, { gpsName: 'Perto do GPS OSM' });
  await gotoApp(page, '/map');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: {
              latitude: -23.31,
              longitude: -51.16,
              accuracy: 25,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition),
        watchPosition: () => 1,
        clearWatch: () => undefined,
      },
    });
  });
  await expect(page.getByText('Recicla Centro OSM').first()).toBeVisible();

  await page.getByRole('button', { name: 'Usar localização' }).click();
  await expect(page.getByText('Perto de você')).toBeVisible();
  await expect(page.getByText('Perto do GPS OSM').first()).toBeVisible();
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
