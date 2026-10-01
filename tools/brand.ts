// Generates the brand files in public/ from the emblem grid (src/emblem.ts):
//   public/favicon.svg  the emblem on a dark tile
//   public/og.png       a 1200x630 social card
//
// Run with `npm run brand` (Node 22.18+/24 runs TypeScript directly). It uses
// only Node built-ins: the PNG is drawn into a pixel buffer and encoded with
// node:zlib, and its text uses a small 5x7 bitmap font defined below.
// The outputs are committed, so the site build does not run this.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { EMBLEM_WIDTH, PALETTES, emblemRects, emblemSvg } from '../src/emblem.ts';

const out = (name: string) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));

// ---- favicon --------------------------------------------------------------

writeFileSync(out('favicon.svg'), emblemSvg({ tile: true, unit: 16 }));

// ---- og.png ---------------------------------------------------------------

const W = 1200;
const H = 630;
const px = Buffer.alloc(W * H * 3);

type RGB = [number, number, number];
const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) {
    for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) {
      const o = (j * W + i) * 3;
      px[o] = c[0];
      px[o + 1] = c[1];
      px[o + 2] = c[2];
    }
  }
}

const P = PALETTES.nightCity;
const bg = hex('#070707');
const red = hex(P.red);
const yellow = hex(P.yellow);
const cyan = hex(P.cyan);
const dim = hex(P.dim);
const muted = hex(P.muted);

rect(0, 0, W, H, bg);
// frame
const t = 4;
rect(24, 24, W - 48, t, dim);
rect(24, H - 24 - t, W - 48, t, dim);
rect(24, 24, t, H - 48, dim);
rect(W - 24 - t, 24, t, H - 48, dim);
// accent ticks on the frame's top-left corner
rect(24, 24, 120, t, yellow);
rect(24, 24, t, 60, yellow);

// emblem
const unit = 30;
const ex = 110;
const ey = 150;
for (const r of emblemRects()) {
  rect(ex + r.x * unit, ey + r.y * unit, r.width * unit, r.height * unit, r.part === 'ring' ? red : yellow);
}

// 5x7 bitmap font: each glyph is 7 rows of 5 bits, most significant first.
const FONT: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0, 0, 0],
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x11, 0x19, 0x15, 0x13, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '+': [0x00, 0x04, 0x04, 0x1f, 0x04, 0x04, 0x00],
  ',': [0x00, 0x00, 0x00, 0x00, 0x0c, 0x04, 0x08],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  '/': [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
};

/** Draws text at (x, y), each glyph cell 6x8 font pixels of size s. */
function text(str: string, x: number, y: number, s: number, c: RGB): void {
  let cx = x;
  for (const ch of str.toUpperCase()) {
    const g = FONT[ch];
    if (!g) throw new Error(`brand: no glyph for ${JSON.stringify(ch)}`);
    g.forEach((bits, row) => {
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) rect(cx + col * s, y + row * s, s, s, c);
      }
    });
    cx += 6 * s;
  }
}
const textWidth = (str: string, s: number) => str.length * 6 * s - s;

// name beside the emblem, as in the app: N U 1 1 / S I G N A L
const tx = ex + EMBLEM_WIDTH * unit + 70;
text('N U 1 1', tx, 175, 9, red);
text('S I G N A L', tx, 275, 9, red);

// the slants ◢◤ x10 under the name
const sw = 28;
const sh = 34;
const sy = 375;
for (let k = 0; k < 10; k++) {
  const x0 = tx + k * sw;
  for (let j = 0; j < sh; j++) {
    const f = (j + 1) / sh; // 0..1 down the glyph
    const w = Math.round(f * sw);
    if (k % 2 === 0) {
      // ◢ lower-right triangle
      rect(x0 + sw - w, sy + j, w, 1, yellow);
    } else {
      // ◤ upper-left triangle
      rect(x0, sy + j, Math.round((1 - f) * sw) + 1, 1, yellow);
    }
  }
}

// tagline and install line across the bottom, centered
const tagline = 'A CYBERPUNK CAR RADIO FOR APPLE MUSIC, IN YOUR TERMINAL';
text(tagline, Math.round((W - textWidth(tagline, 3)) / 2), 505, 3, cyan);
const meta = 'MACOS 14+  /  BREW INSTALL --CASK WAHH-22/TAP/NU11SIGNAL';
text(meta, Math.round((W - textWidth(meta, 2)) / 2), 555, 2, muted);

// ---- PNG encoding ---------------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = (CRC_TABLE[(c ^ b) & 0xff] ?? 0) ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // truecolor RGB
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0; // filter: none
  px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
}
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);
writeFileSync(out('og.png'), png);

console.log(`brand: wrote public/favicon.svg and public/og.png (${png.length} bytes)`);
