// scroll to absolute Y positions: node scripts/shoty.mjs <url> <prefix> <y1,y2,...> [--reduce]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const [url, prefix, ysArg, ...rest] = process.argv.slice(2);
const reduce = rest.includes('--reduce');
const ys = ysArg.split(',').map(Number);
const outDir = path.join(process.cwd(), 'scripts', 'shots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: reduce ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('  [pageerror]', e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

for (const y of ys) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(650);
  const f = path.join(outDir, `${prefix}-y${y}.png`);
  await page.screenshot({ path: f });
  console.log('  wrote', path.relative(process.cwd(), f));
}
await browser.close();
