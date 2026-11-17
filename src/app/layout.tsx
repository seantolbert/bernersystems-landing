import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from 'next/font/google';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { site } from '@/content/site';
import './globals.css';

const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', weight: ['600'] });
const sans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-plex-sans', weight: ['400', '500'] });
const mono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-plex-mono', weight: ['400'] });

const title = 'Berner Systems: mobile-first websites and web apps';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
  title: { default: title, template: '%s · Berner Systems' },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: site.name,
    title,
    description: site.description,
  },
  twitter: { card: 'summary_large_image', title, description: site.description },
  // Keep previews out of search; only production on bernersystems.com is indexed.
  robots: process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production' ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = { themeColor: '#f4f4f1' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
