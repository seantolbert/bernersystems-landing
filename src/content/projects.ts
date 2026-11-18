// Portfolio entries. To add a project: add an entry here and put its media in public/work/<slug>/.
// Media is produced by scripts/capture.mjs (390x844 recordings + poster).

export type ProjectMedia = {
  /** Poster frame shown before the recording plays. */
  poster?: string;
  mp4?: string;
  webm?: string;
  /** Describes what the recording shows, for screen readers and as the caption. */
  description: string;
  /** Desktop only: text shown in the browser frame's address bar. */
  address?: string;
  /** Desktop only: width / height of the image, e.g. '1440 / 735'. The browser window takes this shape. Default 16:10. */
  aspect?: string;
  /** Desktop only: which bottom corner of the browser the phone overlaps. Pick the side with less important content. Default 'right'. */
  phoneSide?: 'left' | 'right';
  /**
   * Phone only: true for a real phone screen recording that already includes the OS status bar.
   * The video then fills the screen and the drawn island grows to cover the real one (and its recording dot).
   */
  deviceRecording?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  kind: string;
  summary: string;
  details: string[];
  stack: string[];
  /** Phone recording (390x844). */
  media: ProjectMedia;
  /** Desktop recording (1440x900). Leave it out for phone-only projects (DuctLink); the showcase then shows the phone alone. */
  desktopMedia?: ProjectMedia;
  /** Public URL that can load inside the phone frame. Leave undefined to hide "Try it live". */
  liveUrl?: string;
  /** False when the deployment refuses to be framed; the button then opens a new tab instead. */
  embeddable: boolean;
  note?: string;
};

export const projects: Project[] = [
  {
    slug: 'ductlink',
    name: 'DuctLink',
    kind: 'Product',
    summary:
      'An ordering app for HVAC sheet-metal shops. Techs build elbows, transitions, and boxes on their phone with every dimension filled in, and the shop works the orders from one inbox.',
    details: [
      'A 3D model of each fitting updates as the tech types dimensions, with the dimension lines drawn on.',
      'Each shop gets its own order link and branding, so techs don’t have to create an account.',
      'Installs to the home screen like an app, with no app store needed.',
    ],
    stack: ['React', 'Vite PWA', 'Supabase', 'Stripe', 'Vercel'],
    media: {
      poster: '/work/ductlink/poster.webp',
      mp4: '/work/ductlink/demo.mp4',
      webm: '/work/ductlink/demo.webm',
      description: 'A tech changes a transition’s width and the 3D model of the fitting updates with every dimension labeled.',
      deviceRecording: true,
    },
    liveUrl: undefined, // TODO(Sean): demo shop link, e.g. https://app.ductlink.com/s/demo
    embeddable: true,
  },
  {
    slug: 'coolbreeze-hvac',
    name: 'CoolBreeze HVAC',
    kind: 'Client site concept',
    summary:
      'A mobile-first site for a Phoenix-area heating and cooling company. It puts the phone number, service area, and a quote request within one thumb’s reach.',
    details: [
      'The quote form checks for a service-area ZIP before anything is sent.',
      'Original cutaway illustrations of each unit instead of stock photos.',
      'Every business detail lives in one config file, so the build can be reused for the next client.',
    ],
    stack: ['Next.js', 'Tailwind', 'React Hook Form', 'Vercel'],
    media: {
      poster: '/work/coolbreeze-hvac/poster.webp',
      mp4: '/work/coolbreeze-hvac/demo.mp4',
      webm: '/work/coolbreeze-hvac/demo.webm',
      description: 'Scrolling the CoolBreeze home page on a phone and filling in the quote form.',
    },
    desktopMedia: {
      // Still image only (no desktop video).
      poster: '/work/coolbreeze-hvac/desktop-poster.webp',
      description: 'The same CoolBreeze site on a laptop, with the wider layout and the thermostat dial beside the headline.',
      address: 'coolbreeze-hvac.demo',
    },
    liveUrl: undefined, // TODO(Sean): deployed demo URL
    embeddable: true,
    note: 'CoolBreeze is a fictional business. I built this site as a portfolio piece.',
  },
  {
    slug: 'outreach-crm',
    name: 'Outreach CRM',
    kind: 'Internal tool',
    summary:
      'The CRM I run Berner Systems on. I call prospects from my phone, log the outcome in two taps, and the follow-ups and email sequences schedule themselves.',
    details: [
      'Installable PWA with an offline outbox, so nothing is lost in a dead zone.',
      'CSV lead imports with cleanup and de-duplication.',
      'Compliant email sequences through Resend, with unsubscribes honored automatically.',
    ],
    stack: ['Vanilla JS', 'PWA', 'Supabase', 'Resend', 'Vercel'],
    media: {
      poster: '/work/outreach-crm/poster.webp',
      mp4: '/work/outreach-crm/demo.mp4',
      webm: '/work/outreach-crm/demo.webm',
      description: 'Working through the day’s call list, opening a prospect’s call script, and logging the call as interested. Shown with demo data.',
      deviceRecording: true, // iPhone screen recording; set false if it has no OS status bar
    },
    desktopMedia: {
      // Still image only (no desktop video), like CoolBreeze.
      poster: '/work/outreach-crm/desktop-poster.webp',
      aspect: '1440 / 735',
      phoneSide: 'left', // keeps the call-outcome buttons on the right visible
      description:
        'The CRM on a laptop: the day’s follow-ups, the prospect, the call script, and the call log side by side. Shown with demo data.',
      // address: 'crm.bernersystems.com', // TODO(Sean): set if the CRM has a public address; left blank otherwise
    },
    embeddable: false,
    note: 'Private tool, shown with demo data.',
  },
];
