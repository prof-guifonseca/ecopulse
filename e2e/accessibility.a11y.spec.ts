import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/home', '/scanner', '/map', '/community', '/profile', '/arena', '/onboarding'] as const;

async function mockEsgPlaces(page: Page) {
  await page.route('**/api/esg/places**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        source: 'osm',
        generatedAt: new Date().toISOString(),
        points: [
          {
            id: 'osm:node:9001',
            source: 'osm',
            sourceId: 'node/9001',
            name: 'Recicla Centro OSM',
            category: 'batteries',
            categories: ['batteries', 'recycling'],
            address: 'Centro · Rua Sergipe, 489',
            openingHours: 'Mo-Fr 08:00-18:00',
            lat: -23.311,
            lng: -51.161,
            confidence: 91,
            tags: { test: 'true' },
          },
        ],
      }),
    });
  });
}

async function resetState(page: Page) {
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
    localStorage.setItem('ecopulse:scanHistory', JSON.stringify({ state: { history: [] }, version: 1 }));
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
      })
    );
    localStorage.setItem(
      'ecopulse:simulation',
      JSON.stringify({
        state: {
          config: {
            scenario: 'new-user',
            seed: 'a11y-new-user',
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

for (const route of routes) {
  test(`has no critical or serious accessibility violations on ${route}`, async ({ page }) => {
    if (route === '/onboarding') {
      await page.addInitScript(() => localStorage.clear());
    } else {
      await resetState(page);
    }
    if (route === '/map') await mockEsgPlaces(page);
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? '')
    );

    expect(blockingViolations).toEqual([]);
  });
}
