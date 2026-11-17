import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9223');
const context = browser.contexts()[0];
const page = context.pages()[0] ?? await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});

await page.goto('http://localhost:4173', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('canvas', { timeout: 20000 });
await page.waitForTimeout(4500);

const graphics = await page.locator('canvas').evaluate((canvas) => {
  const element = canvas;
  const gl = element.getContext('webgl2') || element.getContext('webgl');
  if (!gl) return { context: null };
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    context: gl.constructor.name,
    renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    drawingBuffer: [element.width, element.height],
    cssSize: [element.clientWidth, element.clientHeight],
  };
});

fs.mkdirSync('artifacts', { recursive: true });
await page.screenshot({ path: 'artifacts/solara-bay-hardware-initial.png', fullPage: true });

await page.getByRole('button', { name: 'Change weather' }).click();
await page.waitForTimeout(1200);
const weatherVisible = await page.getByText('Light rain').isVisible();

await page.getByRole('button', { name: 'Open world map' }).click();
const mapVisible = await page.getByText('Vesper City').isVisible();
await page.locator('.world-map-panel .close-button').click();

await page.evaluate(() => {
  window.__atlasKeys = [];
  window.addEventListener('keydown', (event) => window.__atlasKeys.push(event.code), true);
});
await page.locator('canvas').click({ position: { x: 500, y: 300 } });
await page.keyboard.down('w');
await page.waitForTimeout(1750);
await page.keyboard.up('w');
await page.keyboard.down('a');
await page.waitForTimeout(950);
await page.keyboard.up('a');
const capturedKeys = await page.evaluate(() => window.__atlasKeys);
const mapMarkerStyle = await page.locator('.map-player').getAttribute('style');
await page.waitForTimeout(700);
const nearbyPrompt = await page.locator('.interact-prompt').isVisible().catch(() => false);
const nearbyLabel = nearbyPrompt ? await page.locator('.interact-prompt').innerText() : null;
if (nearbyPrompt) await page.locator('.interact-prompt').click();
await page.waitForTimeout(700);
const dialogueVisible = await page.locator('.dialogue-panel').isVisible().catch(() => false);
await page.screenshot({ path: 'artifacts/solara-bay-hardware-interaction.png', fullPage: true });

console.log(JSON.stringify({
  title: await page.title(),
  graphics,
  weatherControl: weatherVisible,
  worldMap: mapVisible,
  capturedKeys,
  mapMarkerStyle,
  nearbyPrompt,
  nearbyLabel,
  residentDialogue: dialogueVisible,
  errors,
  screenshots: ['artifacts/solara-bay-hardware-initial.png', 'artifacts/solara-bay-hardware-interaction.png'],
}, null, 2));

process.exit(errors.length ? 1 : 0);
