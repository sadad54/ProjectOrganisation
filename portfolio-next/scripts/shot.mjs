// Screenshot helper for local design QA.
// Usage:
//   node scripts/shot.mjs <url> <outPrefix> [--w 1440] [--h 900] [--full]
//     [--reduce] [--scroll 0.0,0.25,0.5,1.0] [--click "#sel"] [--wait 400]
//
// Writes <outPrefix>-<tag>.png into scripts/shots/.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const url = args[0];
const outPrefix = args[1] || 'shot';
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = args[i + 1];
  return v && !v.startsWith('--') ? v : true;
};

const W = parseInt(flag('w', '1440'), 10);
const H = parseInt(flag('h', '900'), 10);
const full = flag('full', false) === true;
const reduce = flag('reduce', false) === true;
const waitMs = parseInt(flag('wait', '500'), 10);
const clickSel = flag('click', null);
const scrolls = String(flag('scroll', '') || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map(Number);

const outDir = path.join(process.cwd(), 'scripts', 'shots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  reducedMotion: reduce ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  [console.error]', m.text());
});
page.on('pageerror', (e) => console.log('  [pageerror]', e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(waitMs);

async function snap(tag) {
  const file = path.join(outDir, `${outPrefix}-${tag}.png`);
  await page.screenshot({ path: file, fullPage: full && tag === 'full' });
  console.log('  wrote', path.relative(process.cwd(), file));
}

if (clickSel) {
  await page.click(clickSel).catch((e) => console.log('  click failed:', e.message));
  await page.waitForTimeout(waitMs);
  await snap('click');
}

if (scrolls.length) {
  for (const frac of scrolls) {
    await page.evaluate((f) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * f));
    }, frac);
    await page.waitForTimeout(waitMs);
    await snap(`s${String(frac).replace('.', '_')}`);
  }
} else {
  await snap(full ? 'full' : 'top');
}

await browser.close();
console.log('done');
