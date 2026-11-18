// Grabs a poster frame from a local video using Chrome (no ffmpeg needed) and prints its size.
//   node scripts/poster-from-video.mjs <video.mp4> <poster.webp> [seconds=0.2] [width=780]
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import sharp from 'sharp';

const [src, out, at = '0.2', width = '780'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
const dataUrl = `data:video/mp4;base64,${readFileSync(src).toString('base64')}`;
const result = await p.evaluate(
  async ({ dataUrl, at }) => {
    const v = document.createElement('video');
    v.muted = true;
    v.src = dataUrl;
    await new Promise((r, j) => ((v.onloadeddata = r), (v.onerror = () => j(new Error('cannot decode')))));
    v.currentTime = at;
    await new Promise((r) => (v.onseeked = r));
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    return { w: v.videoWidth, h: v.videoHeight, d: v.duration, png: c.toDataURL('image/png') };
  },
  { dataUrl, at: Number(at) },
);
await b.close();
const png = Buffer.from(result.png.split(',')[1], 'base64');
await sharp(png).resize({ width: Math.min(Number(width), result.w) }).webp({ quality: 82 }).toFile(out);
console.log(`video ${result.w}x${result.h}, ${result.d.toFixed(1)}s → ${out}`);
