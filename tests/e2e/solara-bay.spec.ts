import { expect, test } from '@playwright/test';

test('Solara Bay loads a WebGL world and its local simulation controls work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('SOLARA BAY', { exact: true })).toBeVisible();
  await expect(page.getByText('A day in', { exact: false })).toBeVisible();

  const renderer = await page.locator('canvas').evaluate((canvas) => {
    const element = canvas as HTMLCanvasElement;
    const context = element.getContext('webgl2') || element.getContext('webgl');
    return {
      width: element.width,
      height: element.height,
      context: context?.constructor.name ?? null,
      cssWidth: element.clientWidth,
      cssHeight: element.clientHeight,
    };
  });
  expect(renderer.width).toBeGreaterThan(0);
  expect(renderer.height).toBeGreaterThan(0);
  expect(renderer.context).not.toBeNull();

  await page.getByRole('button', { name: 'Change weather' }).click();
  await expect(page.getByText('Light rain')).toBeVisible();

  await page.getByRole('button', { name: 'Open world map' }).click();
  await expect(page.getByText('Vesper City')).toBeVisible();
  await expect(page.getByText('Verdant Highlands')).toBeVisible();
  await page.locator('.world-map-panel .close-button').click();

  await page.keyboard.down('w');
  await page.waitForTimeout(900);
  await page.keyboard.up('w');
  await page.keyboard.down('a');
  await page.waitForTimeout(900);
  await page.keyboard.up('a');
  expect(errors).toEqual([]);
});