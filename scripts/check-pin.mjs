import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const motion of ['no-preference', 'reduce']) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: motion });
  await p.goto('' + (process.env.BASE_URL ?? 'http://localhost:3000') + '', { waitUntil: 'networkidle' });
  const n = await p.$$eval('[data-case]', (els) => els.length);
  for (let i = 0; i < n; i++) {
    const y = await p.$$eval(
      '[data-case]',
      (els, i) => {
        const el = els[i];
        return el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2 - innerHeight / 2;
      },
      i,
    );
    await p.mouse.move(400, 400);
    await p.mouse.wheel(0, y - (await p.evaluate(() => scrollY)));
    await p.waitForTimeout(1800);
    const state = await p.evaluate(() => ({
      lenis: document.documentElement.classList.contains('lenis'),
      active: [...document.querySelectorAll('[data-case]')].findIndex((e) => e.dataset.active === 'true'),
      showing: document.querySelector('[aria-live="polite"]')?.textContent,
      stickyVisible: !!document.querySelector('[aria-live="polite"]')?.offsetParent,
    }));
    console.log(motion, i, JSON.stringify(state));
    if (motion === 'no-preference') await p.screenshot({ path: `${out}/pin-${i}.png` });
  }
  await p.close();
}
await b.close();
