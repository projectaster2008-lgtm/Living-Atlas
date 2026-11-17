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
await page.waitForTimeout(2500);

const readPosition = async () => {
  const style = await page.locator('.map-player').getAttribute('style');
  const left = Number(style?.match(/left:\s*([\d.]+)%/)?.[1] ?? 50);
  const top = Number(style?.match(/top:\s*([\d.]+)%/)?.[1] ?? 63.7);
  return { left, top, x: (left - 50) / 1.6, z: (top - 56) / 1.1, style };
};

const before = await readPosition();
const frameTiming = await page.evaluate(() => {
  const samples = Array.from(window.__livingAtlasFrameSamples ?? []).filter((value) => value > 0);
  const sorted = [...samples].sort((a, b) => a - b);
  const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))] ?? 0;
  const averageFrameMs = samples.length
    ? samples.reduce((total, value) => total + value, 0) / samples.length
    : 0;
  const stats = window.__livingAtlasRenderStats;

  return {
    sampledFrames: samples.length,
    totalFrames: stats?.frames ?? 0,
    averageFps: averageFrameMs ? Number((1000 / averageFrameMs).toFixed(1)) : 0,
    medianFrameMs: Number(percentile(0.5).toFixed(2)),
    p95FrameMs: Number(percentile(0.95).toFixed(2)),
    worstFrameMs: Number((sorted.at(-1) ?? 0).toFixed(2)),
    drawCalls: stats?.drawCalls ?? null,
    triangles: stats?.triangles ?? null,
    geometries: stats?.geometries ?? null,
    textures: stats?.textures ?? null,
    programs: stats?.programs ?? null,
  };
});

await page.locator('canvas').click({ position: { x: 500, y: 300 } });
await page.keyboard.down('w');
await page.keyboard.down('a');
await page.waitForTimeout(2200);
await page.keyboard.up('w');
await page.keyboard.up('a');
await page.waitForTimeout(500);
const after = await readPosition();

await page.keyboard.press('e');
await page.waitForTimeout(500);
const nearbyPrompt = await page.locator('.interact-prompt').isVisible().catch(() => false);
const dialogueVisible = await page.locator('.dialogue-panel').isVisible().catch(() => false);

fs.mkdirSync('artifacts', { recursive: true });
await page.screenshot({ path: 'artifacts/solara-bay-motion-diagnostic.png', fullPage: true });

console.log(JSON.stringify({
  frameTiming,
  browserState: await page.evaluate(() => ({ visibility: document.visibilityState, hasFocus: document.hasFocus() })),
  before,
  after,
  movementWorldUnits: Number(Math.hypot(after.x - before.x, after.z - before.z).toFixed(3)),
  nearbyPrompt,
  dialogueVisible,
  errors,
  screenshot: 'artifacts/solara-bay-motion-diagnostic.png',
}, null, 2));

await browser.close();
