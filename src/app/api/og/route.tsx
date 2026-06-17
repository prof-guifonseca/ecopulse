import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

/**
 * Server-rendered Open Graph image for link unfurls (WhatsApp/Twitter/etc.).
 * Reads the card data from query params so it works with no DB and no client
 * state: /api/og?eyebrow=...&title=...&caption=...&accent=green&stat=1|árvores
 * (repeat `stat` up to 3x, each "value|label"). Satori = flexbox-only + inline
 * styles; every multi-child element declares display:flex.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eyebrow = (searchParams.get('eyebrow') ?? 'EcoPulse').slice(0, 40);
  const title = (searchParams.get('title') ?? 'Sustentabilidade é lifestyle').slice(0, 40);
  const caption = (searchParams.get('caption') ?? 'Impacto real, medido e compartilhável').slice(
    0,
    64,
  );
  const accent = searchParams.get('accent') === 'gold' ? '#e7c66b' : '#8ddb98';
  const stats = searchParams
    .getAll('stat')
    .slice(0, 3)
    .map((raw) => {
      const [value, label] = raw.split('|');
      return { value: (value ?? '').slice(0, 12), label: (label ?? '').slice(0, 16) };
    });

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: 'linear-gradient(135deg, #0b1410, #13271b)',
        color: '#f3f7f4',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #8ddb98, #5fb47a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="68" height="68" viewBox="-140 -140 280 280">
            <path
              d="M -120 40 C -120 -60, -40 -140, 120 -120 C 140 40, 60 120, -40 120 C -100 120, -120 90, -120 40 Z"
              fill="#0a140e"
            />
            <path
              d="M -80 80 C -60 20, 0 -40, 80 -80"
              stroke="#8ddb98"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800 }}>EcoPulse</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 38, fontWeight: 700, color: accent }}>{eyebrow}</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
      </div>

      {stats.length > 0 ? (
        <div style={{ display: 'flex', gap: 56 }}>
          {stats.map((stat, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 76, fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: 30, color: '#9fb4a6' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex' }} />
      )}

      <div style={{ fontSize: 30, fontWeight: 600, color: accent }}>{caption}</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
