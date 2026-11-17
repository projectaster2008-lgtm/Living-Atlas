import { chromium } from 'playwright';
import fs from 'node:fs';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--disable-gpu-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('404 (Not Found)')) errors.push(message.text()); });
await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForSelector('.virtual-joystick', { timeout: 15000 });
await page.waitForTimeout(4500);
fs.mkdirSync('artifacts', { recursive: true });
await page.screenshot({ path: 'artifacts/checkpoint-04A-mobile.png' });
await page.setViewportSize({ width: 667, height: 375 });
await page.waitForTimeout(700);
await page.screenshot({ path: 'artifacts/checkpoint-04A-landscape.png' });
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(700);
await page.screenshot({ path: 'artifacts/checkpoint-04A-desktop.png' });
await page.setViewportSize({ width: 390, height: 844 });
const result = await page.evaluate(() => {
  const canvas = document.querySelector('canvas');
  const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
  return {
    viewport: [innerWidth, innerHeight],
    joystick: !!document.querySelector('.virtual-joystick'),
    run: !!document.querySelector('[aria-label="Hold to run"]'),
    interact: !!document.querySelector('[aria-label="Interact"]'),
    canvas: canvas ? [canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight] : null,
    renderer: gl ? gl.getParameter(gl.RENDERER) : null,
    dpr: gl ? gl.drawingBufferWidth / Math.max(1, canvas.clientWidth) : null,
    overflow: document.documentElement.scrollWidth > innerWidth,
  };
});
console.log(JSON.stringify({ ...result, errors }, null, 2));
await browser.close();
if (errors.length) process.exit(1);
