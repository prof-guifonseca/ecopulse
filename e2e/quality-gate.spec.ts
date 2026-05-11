import { expect, test, type Page } from '@playwright/test';

async function resetAppState(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
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

async function mockEsgPlaces(page: Page, opts: { source?: 'osm' | 'official' | 'cache'; gpsName?: string } = {}) {
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
        reason: source === 'official' ? 'osm-error:test' : undefined,
        points: [
          {
            id: source === 'official' ? 'ldb-bat-centro' : 'osm:node:9001',
            source,
            sourceId: source === 'official' ? 'official:ldb-bat-centro' : 'node/9001',
            name: isGps ? gpsName : source === 'official' ? 'Multicoisas Catuaí - coleta de pilhas' : 'Recicla Centro OSM',
            category: 'batteries',
            categories: ['batteries', 'recycling'],
            address: 'Centro · Rua Sergipe, 489',
            openingHours: 'Mo-Fr 08:00-18:00',
            phone: '+55 43 99999-0000',
            lat: -23.311,
            lng: -51.161,
            confidence: source === 'official' ? 84 : 91,
            tags: { test: 'true' },
            sourceName: source === 'official' ? 'Prefeitura de Londrina / OpenStreetMap' : 'OpenStreetMap',
            sourceUrl:
              source === 'official'
                ? 'https://portal.londrina.pr.gov.br/gestao-de-residuos-ambiente/destinacao-de-residuos'
                : 'https://www.openstreetmap.org/node/9001',
          },
          {
            id: source === 'official' ? 'ldb-rep-centro' : 'osm:node:9002',
            source,
            sourceId: source === 'official' ? 'official:ldb-rep-centro' : 'node/9002',
            name: source === 'official' ? 'Ateliê de Costura' : 'Conserta Tudo OSM',
            category: 'repair',
            categories: ['repair'],
            address: 'Centro · Rua Espírito Santo, 410',
            openingHours: 'Mo-Fr 09:00-18:00',
            lat: -23.3138,
            lng: -51.1608,
            confidence: source === 'official' ? 78 : 86,
            tags: { test: 'true' },
          },
        ],
      }),
    });
  });
}

async function mockProductLookup(page: Page) {
  await page.route('**/api/products/lookup**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'off:7891000000001',
        barcode: '7891000000001',
        found: true,
        source: 'provider',
        provider: 'openfoodfacts',
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
        sourceUrl: 'https://world.openfoodfacts.org/product/7891000000001',
        lastFetchedAt: new Date().toISOString(),
        checkedAt: new Date().toISOString(),
      }),
    });
  });
}

async function gotoApp(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}

async function activateButton(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name });
  await expect(button).toBeVisible();
  await button.focus();
  await expect(button).toBeFocused();
  await page.keyboard.press('Enter');
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
  await expect(dialog.getByText(/OpenStreetMap · confiança 86%/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(placeButton).toBeFocused();
});

test('map falls back to the curated Londrina ESG snapshot when the API reports official data', async ({ page }) => {
  await seedOnboardedState(page);
  await mockEsgPlaces(page, { source: 'official' });
  await gotoApp(page, '/map');

  await expect(page.getByText('Snapshot oficial').first()).toBeVisible();
  await expect(page.getByText('Snapshot oficial/curado ativo enquanto a fonte aberta responde.')).toBeVisible();
  await expect(page.getByText('Multicoisas Catuaí - coleta de pilhas').first()).toBeVisible();
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

test('community opens comments for real feed posts and records a local comment', async ({ page }) => {
  await seedOnboardedState(page);
  await gotoApp(page, '/community');

  await expect(page.getByRole('heading', { name: 'Comunidade', level: 1 })).toBeVisible();
  const commentsButton = page.getByRole('button', { name: /Comentários/ }).first();
  await commentsButton.focus();
  await expect(commentsButton).toBeFocused();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Nenhum comentário ainda.')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Novo comentário' }).fill('Fonte conferida e útil para Londrina.');
  await dialog.getByRole('button', { name: 'Enviar' }).click();
  await expect(dialog.getByText('Fonte conferida e útil para Londrina.')).toBeVisible();
});

test('scanner can search, lookup a barcode, use a real sample, and restore modal focus', async ({ page }) => {
  await seedOnboardedState(page);
  await mockProductLookup(page);
  await gotoApp(page, '/scanner');

  await expect(page.getByRole('heading', { name: 'Scanner', level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Demo scan' })).toHaveCount(0);

  const search = page.getByRole('textbox', { name: 'Buscar produtos' });
  await search.fill('coca');
  await expect(page.getByText(/coca/i).first()).toBeVisible();
  await search.fill('');

  const barcodeInput = page.getByRole('textbox', { name: 'Barcode do produto' });
  await barcodeInput.fill('7891000000001');
  await barcodeInput.press('Enter');
  const lookupDialog = page.getByRole('dialog');
  await expect(lookupDialog).toBeVisible({ timeout: 7_000 });
  await expect(lookupDialog.getByRole('heading', { name: 'Arroz Integral OSM' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lookupDialog).toBeHidden();

  const scanButton = page.getByRole('button', { name: 'Amostra real' });
  await scanButton.focus();
  await expect(scanButton).toBeFocused();
  await page.keyboard.press('Enter');

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
  await expect(firstCatalogItem).toBeFocused();
  await page.keyboard.press('Enter');

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
  await activateButton(page, 'Continuar');
  await expect(page.getByRole('heading', { name: 'Três gestos.' })).toBeVisible();
  await activateButton(page, 'Continuar');
  await expect(page.getByRole('heading', { name: 'Onde você se reconhece?' })).toBeVisible();
  await activateButton(page, /Recicladores/);
  await activateButton(page, 'Continuar');
  await page.getByRole('textbox', { name: 'Seu primeiro nome' }).fill('Lia');
  await activateButton(page, 'Começar');

  await expect(page).toHaveURL(/\/scanner\?welcome=1$/);
  await expect(page.getByText('Faça um scan para liberar a Home.')).toBeVisible();

  await mockProductLookup(page);
  await activateButton(page, 'Amostra real');
  const firstRunDialog = page.getByRole('dialog');
  await expect(firstRunDialog).toBeVisible({ timeout: 7_000 });
  await page.keyboard.press('Escape');
  await expect(firstRunDialog).toBeHidden();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText(/Hoje · rotina diária/)).toBeVisible();
});
