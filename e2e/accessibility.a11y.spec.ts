import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/home', '/scanner', '/map', '/community', '/profile', '/arena', '/onboarding'] as const;

async function resetState(page: Page) {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('ecopulse:seeded:v1', '1');
  });
}

for (const route of routes) {
  test(`has no critical or serious accessibility violations on ${route}`, async ({ page }) => {
    await resetState(page);
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter((violation) =>
      ['critical', 'serious'].includes(violation.impact ?? '')
    );

    expect(blockingViolations).toEqual([]);
  });
}
