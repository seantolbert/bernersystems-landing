// Design review screenshots (premium-site-design review loop).
// Usage: node scripts/screens.mjs [baseUrl] [outDir]
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3000';
const out = process.argv[3] ?? 'screens';
mkdirSync(out, { recursive: true });

const sizes = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const browser = await chromium.launch({ channel: 'chrome' });
for (const motion of ['no-preference', 'reduce']) {
  for (const s of sizes) {
    if (motion === 'reduce' && s.name !== 'desktop') continue;
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height }, reducedMotion: motion });
    await page.goto(base, { waitUntil: 'networkidle' });
    const tag = `${s.name}${motion === 'reduce' ? '-reduced' : ''}`;
    await page.screenshot({ path: path.join(out, `${tag}-first.png`) });
    await page.screenshot({ path: path.join(out, `${tag}-full.png`), fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('p, li, a, label, button, input, textarea, select')]
        .filter((el) => el.offsetParent && parseFloat(getComputedStyle(el).fontSize) < 16 && el.textContent.trim())
        .map((el) => `${el.tagName.toLowerCase()} ${parseFloat(getComputedStyle(el).fontSize)}px "${el.textContent.trim().slice(0, 30)}"`),
    );
    console.log(`${tag}: horizontal overflow ${overflow}px; text under 16px: ${small.length}`);
    if (small.length) console.log('  ' + [...new Set(small)].slice(0, 12).join('\n  '));
    await page.close();
  }
}
await browser.close();
