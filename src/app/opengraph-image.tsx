import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = 'Berner Systems: mobile-first websites and web apps';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: '#f4f4f1',
          color: '#15181d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 36 }}>
          <svg width="48" height="48" viewBox="0 0 512 512">
            <circle cx="256" cy="256" r="200" fill="none" stroke="#15181d" strokeWidth="64" />
            <circle cx="256" cy="256" r="62" fill="#2a62c9" />
          </svg>
          {site.name}
        </div>
        <div style={{ fontSize: 68, lineHeight: 1.1, maxWidth: 980, letterSpacing: -1 }}>{site.hero.headline}</div>
        <div style={{ fontSize: 28, color: '#535a65' }}>bernersystems.com</div>
      </div>
    ),
    size,
  );
}
