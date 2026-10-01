// Generates the brand files in public/ from the Braille emblem (src/emblem.ts):
//   public/favicon.svg  the compact emblem's dots on a dark tile
//   public/og.png       a 1200x630 social card
//
// Run with `npm run brand` (Node 22.18+/24 runs TypeScript directly). It uses
// only Node built-ins: the PNG is drawn into a pixel buffer and encoded with
// node:zlib, and its text uses a small 5x7 bitmap font defined below.
// The outputs are committed, so the site build does not run this.

import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import {
  BARS_ART,
  DOT_RADIUS,
  EMBLEM_LARGE,
  PALETTES,
  brailleDots,
  dotBounds,
  faviconSvg,
  type Dot,
} from '../src/emblem.ts';

const out = (name: string) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));

// ---- favicon --------------------------------------------------------------

writeFileSync(out('favicon.svg'), faviconSvg());

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

/** Fills a disc at (cx, cy) of radius r over the pixels, edges antialiased
 * against what is already there (4 x 4 samples per pixel). */
function disc(cx: number, cy: number, r: number, c: RGB): void {
  const S = 4;
  for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++) {
    for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
      if (i < 0 || j < 0 || i >= W || j >= H) continue;
      let hit = 0;
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const dx = i + (sx + 0.5) / S - cx;
          const dy = j + (sy + 0.5) / S - cy;
          if (dx * dx + dy * dy <= r * r) hit++;
        }
      }
      if (!hit) continue;
      const a = hit / (S * S);
      const o = (j * W + i) * 3;
      for (let k = 0; k < 3; k++) px[o + k] = Math.round((px[o + k] ?? 0) * (1 - a) + c[k]! * a);
    }
  }
}

/** Draws dots with their box's top left at (x, y), unit pixels per dot. */
function drawDots(dots: Dot[], x: number, y: number, unit: number, color: (d: Dot) => RGB): void {
  const b = dotBounds(dots);
  for (const d of dots) {
    disc(x + (d.x - b.x + 0.5) * unit, y + (d.y - b.y + 0.5) * unit, DOT_RADIUS * unit, color(d));
  }
}

// emblem: the large Braille emblem, one disc per dot
const emblemDots = brailleDots(EMBLEM_LARGE);
const unit = 12;
const ex = 110;
const ey = Math.round((480 - dotBounds(emblemDots).height * unit) / 2) + 40;
drawDots(emblemDots, ex, ey, unit, (d) => (d.part === 'ring' ? red : yellow));

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
const tx = ex + dotBounds(emblemDots).width * unit + 70;
text('N U 1 1', tx, 175, 9, red);
text('S I G N A L', tx, 275, 9, red);

// the five thin Braille bars under the name, 15 cells under the 11 of
// S I G N A L as in the app (clipped to the frame)
const barDots = brailleDots(BARS_ART);
const barUnit = Math.min(20, Math.floor((W - 60 - tx) / dotBounds(barDots).width));
drawDots(barDots, tx, 375, barUnit, () => yellow);

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
