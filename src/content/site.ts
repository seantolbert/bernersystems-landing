// All page copy lives here so components stay generic. Voice rules: intake/bernersystems.direction.json.

export const site = {
  name: 'Berner Systems',
  url: 'https://bernersystems.com',
  // TODO(Sean): confirm this inbox exists (or forwards) before launch. It is the mailto fallback.
  email: 'hello@bernersystems.com',
  owner: 'Sean',
  description:
    'Berner Systems is a one-person studio that designs and builds mobile-first websites for local service businesses and web apps for founders.',
  social: [] as { label: string; href: string }[], // TODO(Sean): GitHub / LinkedIn

  nav: [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  primaryCta: { label: 'Start a project', href: '#contact' },

  hero: {
    headline: 'Websites and web apps built for the phone in your customer’s hand.',
    body: 'I’m Sean, and Berner Systems is my studio. I build fast sites for local service businesses, and web apps and internal tools for founders. I design them for mobile first, ship them on Next.js and Supabase, and hand you the keys when they’re done.',
    secondary: { label: 'See the work', href: '#work' },
  },

  work: {
    heading: 'Recent work',
    intro: 'Each of these runs in a phone’s browser. The recordings are real sessions, and where an app is public you can try it right here.',
  },

  services: {
    heading: 'What I build',
    items: [
      {
        name: 'Websites for local businesses',
        for: 'Trades, shops, and service businesses that get most of their calls from a phone search.',
        includes: [
          'A fast, mobile-first site with your services, area, and hours',
          'Tap-to-call, quote or booking requests that land in your inbox',
          'Search basics: page titles, Google Business details, and a sitemap',
          'Hosting and domain set up in your name',
        ],
      },
      {
        name: 'Web apps and MVPs',
        for: 'Founders who need a working product in front of real users.',
        includes: [
          'Accounts, payments (Stripe), and email (Resend)',
          'A Postgres database with row-level security (Supabase)',
          'Installable on a phone as a PWA, with no app store needed',
          'Preview links for every change, so you see progress as it happens',
        ],
      },
      {
        name: 'Internal tools',
        for: 'Teams running part of the business out of spreadsheets, texts, and memory.',
        includes: [
          'Order intake, job tracking, and simple CRMs',
          'Imports from the spreadsheets you already have',
          'Works on the phone your crew already carries',
        ],
      },
    ],
  },

  process: {
    heading: 'How a project goes',
    steps: [
      { name: 'A short call', body: 'You tell me what the business needs and what is getting in the way. I tell you honestly whether I’m the right fit.' },
      { name: 'A written scope', body: 'One page covering what gets built, what doesn’t, the timeline, and the price. Nothing starts until you agree to it.' },
      { name: 'Build in the open', body: 'You get a preview link from the first week, and it updates as the work moves.' },
      { name: 'Launch and handoff', body: 'Your domain, your hosting account, and your code. I stay on for fixes and changes if you want me to.' },
    ],
  },

  about: {
    heading: 'About',
    // TODO(Sean): replace with your own words; keep it short and specific.
    paragraphs: [
      'I’m Sean, a developer who works directly with the people who use what I build. When you work with Berner Systems, you’re working with me from the first call to launch.',
      'I care most about software that holds up on a phone in a truck, a shop, or a client’s living room. That means fast pages, big tap targets, and forms that don’t lose your work.',
    ],
    photoAlt: 'Portrait of Sean',
    photo: null as string | null, // e.g. '/about/sean.webp'
  },

  contact: {
    heading: 'Tell me about your project',
    body: 'A few sentences is plenty. I reply within one business day.',
    projectTypes: ['Website', 'Web app or MVP', 'Internal tool', 'Not sure yet'],
    budgets: ['Not sure yet', 'Under $3k', '$3k–$10k', '$10k–$25k', '$25k+'],
    success: 'Thanks, your message is in. I’ll reply within one business day.',
    failure: 'Something went wrong sending that. Please email me directly at',
  },
} as const;
