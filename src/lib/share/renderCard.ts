// Geração de cartão compartilhável 100% no cliente: monta um SVG de marca
// (cores inline em hex, sem var() nem foreignObject), rasteriza via
// <img>+<canvas> e devolve um PNG. Sem backend, funciona offline.

export interface ShareStat {
  value: string;
  label: string;
}

export interface ShareCardData {
  eyebrow: string;
  title: string;
  stats: ShareStat[];
  caption: string;
  accent?: 'green' | 'gold';
}

const W = 1080;
const H = 1350;
const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

function buildSvg(data: ShareCardData): string {
  const accent = data.accent === 'gold' ? '#e7c66b' : '#8ddb98';
  const stats = data.stats.slice(0, 3);
  const n = Math.max(1, stats.length);
  const valueSize = n >= 3 ? 116 : n === 2 ? 140 : 168;
  const statsSvg = stats
    .map((stat, index) => {
      const cx = 80 + ((W - 160) / n) * (index + 0.5);
      return `
    <text x="${cx}" y="850" text-anchor="middle" font-family="${FONT}" font-size="${valueSize}" font-weight="800" fill="#f3f7f4">${esc(
      truncate(stat.value, 12),
    )}</text>
    <text x="${cx}" y="915" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="600" fill="#9fb4a6">${esc(
      truncate(stat.label, 16),
    )}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#0b1410"/>
      <stop offset="100%" stop-color="#13271b"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8ddb98"/>
      <stop offset="100%" stop-color="#5fb47a"/>
    </linearGradient>
    <linearGradient id="leafdark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a140e"/>
      <stop offset="100%" stop-color="#13271b"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g transform="translate(80 80)">
    <g transform="scale(0.234)">
      <rect width="512" height="512" rx="112" fill="url(#mark)"/>
      <g transform="translate(256 256)">
        <path d="M -120 40 C -120 -60, -40 -140, 120 -120 C 140 40, 60 120, -40 120 C -100 120, -120 90, -120 40 Z" fill="url(#leafdark)"/>
        <path d="M -80 80 C -60 20, 0 -40, 80 -80" stroke="#8ddb98" stroke-width="10" stroke-linecap="round" fill="none"/>
      </g>
    </g>
  </g>
  <text x="220" y="162" font-family="${FONT}" font-size="62" font-weight="800" fill="#f3f7f4">EcoPulse</text>
  <text x="80" y="338" font-family="${FONT}" font-size="42" font-weight="700" fill="${accent}">${esc(
    truncate(data.eyebrow, 32),
  )}</text>
  <text x="80" y="416" font-family="${FONT}" font-size="58" font-weight="800" fill="#f3f7f4">${esc(
    truncate(data.title, 26),
  )}</text>
  <line x1="80" y1="486" x2="${W - 80}" y2="486" stroke="#27392e" stroke-width="2"/>
  ${statsSvg}
  <text x="80" y="1232" font-family="${FONT}" font-size="32" font-weight="500" fill="#9fb4a6">${esc(
    truncate(data.caption, 52),
  )}</text>
  <text x="80" y="1288" font-family="${FONT}" font-size="30" font-weight="600" fill="${accent}">sustentabilidade é lifestyle</text>
</svg>`;
}

/** Rasteriza um SVG (string) num PNG Blob via canvas. Mesma origem (blob URL),
 *  sem recursos externos → canvas não fica "tainted". */
function svgToPngBlob(svg: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D indisponível'));
          return;
        }
        ctx.drawImage(img, 0, 0, W, H);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('toBlob falhou'))),
          'image/png',
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar o SVG'));
    };
    img.src = url;
  });
}

export function renderShareCardBlob(data: ShareCardData): Promise<Blob> {
  return svgToPngBlob(buildSvg(data));
}
