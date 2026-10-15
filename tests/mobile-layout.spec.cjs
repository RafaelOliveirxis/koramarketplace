const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.FLASHMARKET_TEST_URL || 'https://koramarketplace.vercel.app/';

test.describe('FlashMarket — validação visual responsiva publicada', () => {
  test('mobile 390px: cabeçalho, busca, menu, navegação e quatro produtos sem overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await expect(page.locator('body.reference-home')).toBeVisible();
    await expect(page.locator('#searchInput')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav a')).toHaveCount(4);

    const trigger = page.locator('#categoryTrigger');
    const panel = page.locator('#categoryPanel');
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.locator('a').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      searchWidth: Math.round(document.querySelector('.search').getBoundingClientRect().width),
      navHeight: Math.round(document.querySelector('.mobile-bottom-nav').getBoundingClientRect().height),
      productColumns: getComputedStyle(document.querySelector('.products')).gridTemplateColumns,
    }));
    expect(dimensions.page, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.searchWidth).toBeGreaterThan(250);
    expect(dimensions.navHeight).toBeLessThan(100);
    expect(dimensions.productColumns.split(' ').length).toBe(4);
    await page.screenshot({ path: 'test-results/flashmarket-mobile-390.png', fullPage: true });
  });

  test('mobile estreito 320px: não cria rolagem horizontal e mantém busca utilizável', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      search: document.querySelector('.search').getBoundingClientRect().width,
      input: document.querySelector('#searchInput').getBoundingClientRect().width,
    }));
    expect(dimensions.page, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.search).toBeGreaterThan(260);
    expect(dimensions.input).toBeGreaterThan(150);
    const productColumns = await page.locator('.products').first().evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(productColumns).toBe(4);
    await page.screenshot({ path: 'test-results/flashmarket-mobile-320.png', fullPage: true });
  });

  test('desktop 1440px: barra mobile permanece oculta e viewport sem overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await expect(page.locator('body.reference-home')).toBeVisible();
    await expect(page.locator('.mobile-bottom-nav')).toBeHidden();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
    }));
    expect(dimensions.page, JSON.stringify(dimensions)).toBeLessThanOrEqual(dimensions.viewport);
    await page.screenshot({ path: 'test-results/flashmarket-desktop-1440.png', fullPage: true });
  });
});
