// Gera os ícones PNG do PWA a partir do SVG de marca (public/icons/icon.svg).
//
// Saídas:
//   public/icons/icon-192.png       (purpose: any)
//   public/icons/icon-512.png       (purpose: any)
//   public/icons/icon-180.png       (apple-touch-icon)
//   public/icons/maskable-512.png   (purpose: maskable, full-bleed + safe zone)
//
// Uso: `node scripts/gen-icons.mjs`. Requer `sharp` disponível no node_modules
// (transitivo do Next). Os PNGs são versionados; este script só precisa rodar
// quando o SVG da marca mudar.

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = resolve(root, 'public/icons');
mkdirSync(iconsDir, { recursive: true });

const sourceSvg = readFileSync(resolve(iconsDir, 'icon.svg'));

// Variante maskable: fundo full-bleed (sem cantos arredondados transparentes) e
// folha reduzida para caber na zona de segurança (inner ~80%) que o SO recorta.
const maskableSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8ddb98"/>
      <stop offset="100%" stop-color="#5fb47a"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a140e"/>
      <stop offset="100%" stop-color="#13271b"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(0.78)">
    <path d="M -120 40 C -120 -60, -40 -140, 120 -120 C 140 40, 60 120, -40 120 C -100 120, -120 90, -120 40 Z" fill="url(#leaf)"/>
    <path d="M -80 80 C -60 20, 0 -40, 80 -80" stroke="#8ddb98" stroke-width="10" stroke-linecap="round" fill="none"/>
  </g>
</svg>`,
);

async function emit(svg, size, name) {
  const out = resolve(iconsDir, name);
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${name} (${size}x${size})`);
}

await emit(sourceSvg, 192, 'icon-192.png');
await emit(sourceSvg, 512, 'icon-512.png');
await emit(sourceSvg, 180, 'icon-180.png');
await emit(maskableSvg, 512, 'maskable-512.png');

console.log('Ícones do PWA gerados.');
