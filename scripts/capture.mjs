// Records each portfolio app at phone and desktop size and writes media to public/work/<slug>/.
//
//   node scripts/capture.mjs [slug ...] [--phone-only | --desktop-only]
//
// Outputs per app:
//   phone:   poster.webp,         demo.webm,    demo.mp4      (390x844)
//   desktop: desktop-poster.webp, desktop.webm, desktop.mp4   (1440x900, video scaled to 1280 wide)
// Posters always; videos only when ffmpeg is on PATH (`brew install ffmpeg`).
// The page picks up whatever files exist; missing ones show a labeled placeholder.
//
// URLs come from env so nothing private is committed:
//   COOLBREEZE_URL       default http://localhost:3301   (cd ../../portfolio/hvac_landing_demo && CI=1 npx next dev -p 3301)
//   DUCTLINK_URL         a demo shop order link, e.g. http://localhost:5173/s/demo (phone only; DuctLink is mobile-only)
//   CRM_URL / CRM_STORAGE  the CRM signed in to a DEMO account with fake prospects only. Never record real data.
//                          Used for both the phone and desktop passes.
//
// Make a storageState file: npx playwright open --save-storage=.capture/crm-auth.json <url>, sign in, close.

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

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

const browseSite = async (page) => {
  await pause(page, 1200);
  await scroll(page, 700);
  await pause(page, 900);
  await scroll(page, 900);
  await pause(page, 1200);
};

const apps = {
  'coolbreeze-hvac': {
    phone: {
      url: process.env.COOLBREEZE_URL ?? 'http://localhost:3301',
      async run(page) {
        await browseSite(page);
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
    desktop: {
      url: process.env.COOLBREEZE_URL ?? 'http://localhost:3301',
      run: browseSite,
    },
  },
  ductlink: {
    phone: {
      url: process.env.DUCTLINK_URL,
      async run(page) {
        // Generic walk-through: tap the first obvious choices, then scroll. Tune once the demo shop exists.
        await pause(page, 1500);
        for (let i = 0; i < 3; i++) {
          const target = page.locator('button:visible, a[href]:visible').nth(1);
          if (!(await target.count())) break;
          await target.click().catch(() => {});
          await pause(page, 1400);
        }
        await scroll(page, 500);
        await pause(page, 1000);
      },
    },
  },
  'outreach-crm': {
    phone: {
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
    desktop: {
      url: process.env.CRM_URL,
      storage: process.env.CRM_STORAGE,
      async run(page) {
        await pause(page, 1500);
        await scroll(page, 500);
        await pause(page, 1500);
        await scroll(page, -500);
        await pause(page, 1000);
      },
    },
  },
};

const formats = {
  phone: { width: 390, height: 844, scale: 2, isMobile: true, prefix: '', posterWidth: 780, videoWidth: 780 },
  desktop: { width: 1440, height: 900, scale: 1, isMobile: false, prefix: 'desktop-', posterWidth: 1440, videoWidth: 1280 },
};

const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith('--'));
const kinds = args.includes('--phone-only') ? ['phone'] : args.includes('--desktop-only') ? ['desktop'] : ['phone', 'desktop'];

const browser = await chromium.launch({ channel: 'chrome' });

for (const [slug, app] of Object.entries(apps)) {
  if (only.length && !only.includes(slug)) continue;
  for (const kind of kinds) {
    const target = app[kind];
    if (!target) continue;
    const label = `${slug} (${kind})`;
    if (!target.url) {
      console.log(`skip ${label}: set its URL env var (see header of this file)`);
      continue;
    }
    const f = formats[kind];
    const outDir = path.join('public', 'work', slug);
    const rawDir = path.join('.capture', `${slug}-${kind}`);
    mkdirSync(outDir, { recursive: true });
    rmSync(rawDir, { recursive: true, force: true });

    const context = await browser.newContext({
      viewport: { width: f.width, height: f.height },
      deviceScaleFactor: f.scale,
      isMobile: f.isMobile,
      hasTouch: f.isMobile,
      reducedMotion: 'no-preference',
      storageState: target.storage,
      recordVideo: { dir: rawDir, size: { width: f.width, height: f.height } },
    });
    const page = await context.newPage();
    const t0 = Date.now();
    try {
      await page.goto(target.url, { waitUntil: 'networkidle', timeout: 30_000 });
    } catch (err) {
      console.log(`skip ${label}: could not load ${target.url} (${err.message.split('\n')[0]})`);
      await context.close();
      continue;
    }
    // Hide dev-server overlays (Next.js indicator, Vite error overlay) so they never land in a recording.
    await page.addStyleTag({ content: 'nextjs-portal, vite-error-overlay { display: none !important; }' });
    await page.evaluate(() => document.fonts?.ready);
    const loadedAt = (Date.now() - t0) / 1000;

    const png = await page.screenshot({ type: 'png' });
    await sharp(png).resize({ width: f.posterWidth }).webp({ quality: 82 }).toFile(path.join(outDir, `${f.prefix}poster.webp`));

    await target.run(page);
    const video = page.video();
    await context.close();
    const raw = video ? await video.path() : null;

    const name = f.prefix ? 'desktop' : 'demo';
    if (raw && hasFfmpeg) {
      const trim = ['-y', '-ss', String(Math.max(0, loadedAt - 0.1)), '-i', raw, '-t', String(MAX_SECONDS), '-an', '-vf', `scale=${f.videoWidth}:-2`];
      execFileSync('ffmpeg', [...trim, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '38', '-row-mt', '1', path.join(outDir, `${name}.webm`)], { stdio: 'ignore' });
      execFileSync('ffmpeg', [...trim, '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(outDir, `${name}.mp4`)], { stdio: 'ignore' });
      console.log(`ok ${label}: ${f.prefix}poster.webp, ${name}.webm, ${name}.mp4`);
    } else {
      console.log(`ok ${label}: ${f.prefix}poster.webp (install ffmpeg for video; raw recording kept in ${rawDir})`);
    }
  }
}

await browser.close();
