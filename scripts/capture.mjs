// Records each portfolio app at phone size and writes media to public/work/<slug>/.
//
//   node scripts/capture.mjs [slug ...]
//
// Outputs per app:  poster.webp (always), demo.webm + demo.mp4 (only when ffmpeg is on PATH:
// `brew install ffmpeg`). The page picks up whatever files exist; missing ones show a placeholder.
//
// URLs come from env so nothing private is committed:
//   COOLBREEZE_URL  default http://localhost:3301   (cd ../../portfolio/detailing_demo && npx next dev -p 3301)
//   DUCTLINK_URL    a demo shop order link, e.g. http://localhost:5173/s/demo
//   CRM_URL         the CRM signed in to a DEMO account with fake prospects only. Never record real data.
//   CRM_STORAGE     optional Playwright storageState JSON for that demo session

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const W = 390;
const H = 844;
const MAX_SECONDS = 14;

const hasFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0;
const pause = (page, ms) => page.waitForTimeout(ms);

/** Smooth, human-looking scroll by `px`. */
async function scroll(page, px, steps = 24) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await pause(page, 30);
  }
}

const apps = {
  'coolbreeze-hvac': {
    url: process.env.COOLBREEZE_URL ?? 'http://localhost:3301',
    async run(page) {
      await pause(page, 1200);
      await scroll(page, 700);
      await pause(page, 900);
      await scroll(page, 900);
      await pause(page, 900);
      const zip = page.locator('input[name="zip"]').first();
      if (await zip.count()) {
        await zip.scrollIntoViewIfNeeded();
        await pause(page, 600);
        const name = page.locator('input[name="name"]').first();
        if (await name.count()) await name.pressSequentially('Jordan', { delay: 70 });
        await zip.pressSequentially('85281', { delay: 90 });
        await pause(page, 1200);
      }
    },
  },
  ductlink: {
    url: process.env.DUCTLINK_URL,
    async run(page) {
      // Generic walk-through: tap the first few obvious choices, then scroll. Tune once the demo shop exists.
      await pause(page, 1500);
      for (let i = 0; i < 3; i++) {
        const target = page.locator('button:visible, a[href]:visible').nth(1);
        if (!(await target.count())) break;
        await target.click({ trial: false }).catch(() => {});
        await pause(page, 1400);
      }
      await scroll(page, 500);
      await pause(page, 1000);
    },
  },
  'outreach-crm': {
    url: process.env.CRM_URL,
    storage: process.env.CRM_STORAGE,
    async run(page) {
      await pause(page, 1500);
      await scroll(page, 600);
      await pause(page, 1200);
      await scroll(page, -600);
      await pause(page, 800);
    },
  },
};

const only = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });

for (const [slug, app] of Object.entries(apps)) {
  if (only.length && !only.includes(slug)) continue;
  if (!app.url) {
    console.log(`skip ${slug}: set its URL env var (see header of this file)`);
    continue;
  }
  const outDir = path.join('public', 'work', slug);
  const rawDir = path.join('.capture', slug);
  mkdirSync(outDir, { recursive: true });
  rmSync(rawDir, { recursive: true, force: true });

  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'no-preference',
    storageState: app.storage,
    recordVideo: { dir: rawDir, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  const t0 = Date.now();
  try {
    await page.goto(app.url, { waitUntil: 'networkidle', timeout: 30_000 });
  } catch (err) {
    console.log(`skip ${slug}: could not load ${app.url} (${err.message.split('\n')[0]})`);
    await context.close();
    continue;
  }
  // Hide dev-server overlays (Next.js indicator, Vite error overlay) so they never land in a recording.
  await page.addStyleTag({ content: 'nextjs-portal, vite-error-overlay { display: none !important; }' });
  await page.evaluate(() => document.fonts?.ready);
  const loadedAt = (Date.now() - t0) / 1000;

  // Poster: the first settled screen, at 2x for sharpness.
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).webp({ quality: 82 }).toFile(path.join(outDir, 'poster.webp'));

  await app.run(page);
  const video = page.video();
  await context.close();
  const raw = video ? await video.path() : null;

  if (raw && hasFfmpeg) {
    const trim = ['-y', '-ss', String(Math.max(0, loadedAt - 0.1)), '-i', raw, '-t', String(MAX_SECONDS), '-an'];
    execFileSync('ffmpeg', [...trim, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', path.join(outDir, 'demo.webm')], { stdio: 'ignore' });
    execFileSync('ffmpeg', [...trim, '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(outDir, 'demo.mp4')], { stdio: 'ignore' });
    console.log(`ok ${slug}: poster.webp, demo.webm, demo.mp4`);
  } else {
    console.log(`ok ${slug}: poster.webp (install ffmpeg for demo.webm/demo.mp4; raw recording kept in ${rawDir})`);
  }
}

await browser.close();
