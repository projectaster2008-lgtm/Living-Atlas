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
  expect(errors.filter((error) => !error.includes('404 (Not Found)'))).toEqual([]);
});
test('mobile viewport exposes touch controls and the joystick moves the player', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.virtual-joystick')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hold to run' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Interact' })).toBeVisible();

  const marker = page.locator('.map-player');
  const initialLeft = await marker.evaluate((element) => element.style.left);
  const joystick = page.locator('.virtual-joystick');
  const bounds = await joystick.boundingBox();
  if (!bounds) throw new Error('Virtual joystick has no layout box');

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 34, bounds.y + bounds.height / 2, { steps: 5 });
  await page.waitForTimeout(900);
  await page.mouse.up();
  await expect.poll(() => marker.evaluate((element) => element.style.left)).not.toBe(initialLeft);

  const cameraZone = page.locator('.touch-camera-zone');
  const cameraBounds = await cameraZone.boundingBox();
  if (!cameraBounds) throw new Error('Camera look zone has no layout box');
  const initialYaw = await cameraZone.getAttribute('data-camera-yaw');
  await page.mouse.move(cameraBounds.x + cameraBounds.width / 2, cameraBounds.y + cameraBounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(cameraBounds.x + cameraBounds.width / 2 + 48, cameraBounds.y + cameraBounds.height / 2, { steps: 4 });
  await page.mouse.up();
  await expect.poll(() => cameraZone.getAttribute('data-camera-yaw')).not.toBe(initialYaw);

  const runButton = page.getByRole('button', { name: 'Hold to run' });
  const runBounds = await runButton.boundingBox();
  if (!runBounds) throw new Error('Run control has no layout box');
  await page.mouse.move(runBounds.x + runBounds.width / 2, runBounds.y + runBounds.height / 2);
  await page.mouse.down();
  await expect(runButton).toHaveClass(/active/);
  await page.mouse.up();
  await expect(runButton).not.toHaveClass(/active/);
  expect(errors.filter((error) => !error.includes('404 (Not Found)'))).toEqual([]);
});
