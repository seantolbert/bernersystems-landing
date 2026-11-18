# bernersystems.com

The landing page and portfolio for Berner Systems: one static Next.js page with a contact form that emails through Resend.

Design direction, palette contrast checks, and the motion concept are in `intake/bernersystems.direction.json`.

## Run

```bash
npm install
cp .env.example .env.local   # fill in to test the contact form locally
npm run dev
```

## Where things live

| What | File |
|---|---|
| All page copy | `src/content/site.ts` |
| Portfolio projects | `src/content/projects.ts` |
| Project media | `public/work/<slug>/poster.webp, demo.webm, demo.mp4` |
| Contact form server action | `src/app/actions/contact.ts` |
| Phone + browser stage (pinned showcase, reduced motion) | `src/components/devices/DeviceStage.tsx` |
| Single phone (mobile, hero) | `src/components/devices/PhoneDemo.tsx` |
| Bezels, media layers, live iframe, controls | `src/components/devices/parts.tsx` |
| Pinned showcase | `src/components/work/WorkShowcase.tsx` |
| Lenis + ScrollTrigger (registered once) | `src/components/motion/` |

**Media per project** (`public/work/<slug>/`, lowercase names, since Vercel is case-sensitive):

| File | Shows in |
|---|---|
| `poster.webp`, `demo.mp4`, `demo.webm` | the phone (390×844) |
| `desktop-poster.webp` | the browser window (still image, 1440 wide), desktop only. If it isn't 16:10, set `aspect` (e.g. `'1440 / 735'`) so nothing is cropped |

A project with no `desktopMedia` entry (DuctLink, which is mobile-only) shows the phone by itself. For a real phone screen recording that includes the OS status bar, set `deviceRecording: true` on its `media`. The video then fills the screen, and the drawn island covers the real one and its recording dot.

**To add a project:** add an entry to `projects.ts` and run the capture script for it. Media files that don't exist yet show a labeled placeholder automatically. Set `liveUrl` to show "Try it live", and set `embeddable: false` if that site refuses to load in an iframe.

## Your own screen recordings

Keep originals out of `public/` (`.capture/originals/` is git-ignored). Then either:
- **With ffmpeg** (best, about 1.5 MB for 14 s): `ffmpeg -i in.MP4 -t 14 -an -vf "scale=720:-2" -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/work/<slug>/demo.mp4`
- **Without ffmpeg** (built into macOS, larger files): `avconvert -s in.MP4 -p Preset960x540 -o public/work/<slug>/demo.mp4 --start 0 --duration 14`

Poster: `node scripts/poster-from-video.mjs public/work/<slug>/demo.mp4 public/work/<slug>/poster.webp`

## Recording the apps automatically

```bash
brew install ffmpeg                          # needed for demo.webm / demo.mp4 (posters work without it)
COOLBREEZE_URL=http://localhost:3301 node scripts/capture.mjs coolbreeze-hvac
DUCTLINK_URL=<demo shop link> node scripts/capture.mjs ductlink
CRM_URL=<demo account URL> node scripts/capture.mjs outreach-crm   # demo data only, never real prospects
```

Phone recordings are 390×844, and desktop recordings 1440×900 (CoolBreeze and the CRM). Both are trimmed to 14 s with no audio. Use `--phone-only` or `--desktop-only` to run one pass. The script drives your installed Chrome.

## Checks

```bash
npm run build && npm run lint && npm audit --omit=dev --audit-level=high
node scripts/screens.mjs http://localhost:3000 screens     # 375 / 768 / 1440 + reduced motion; flags overflow and <16px text
BASE_URL=http://localhost:3000 node scripts/check-pin.mjs /tmp      # pinned phone swaps; reduced motion turns it off
BASE_URL=http://localhost:3000 node scripts/check-form.mjs          # bot trap, inline errors, failure fallback
```

## Deploy (Vercel)

1. Push to a private GitHub repo and import it in Vercel.
2. Email: `vercel integration add resend` (or create a key in Resend). In Resend, add the domain **`notify.bernersystems.com`**, which is separate from `mail.bernersystems.com`, the outreach domain the CRM uses. Add its SPF, DKIM, and DMARC (`p=none`) records and wait for "Verified".
3. Env vars (Production and Preview): `RESEND_API_KEY`, `CONTACT_TO`, and `CONTACT_FROM="Berner Systems <hello@notify.bernersystems.com>"`.
4. Domain: add `bernersystems.com` and `www.bernersystems.com` (redirect www to the apex). Add the A/CNAME records at your DNS host **without removing the existing `mail.` Resend records**.
5. Firewall: add a rate-limit rule for `POST /` (for example, 5 requests per minute per IP) to slow down form spam.
6. Previews are `noindex` automatically. Only production is indexed.
