// The null emblem, copied cell for cell from the app
// (nu11signal/internal/radio/emblem.go): a Braille slashed zero whose ring is
// drawn in the label color and whose slash, crossing the whole 0 and sticking
// out top right and bottom left, is drawn in the accent color, with the name
// beside it over five thin accent bars.
//
//	         ⢀⣦⡀
//	  ⢀⣴⣿⠿⠿⣿⣶⣿⠟
//	  ⣾⡿⠁ ⢀⣼⣿⣷     N U 1 1
//	 ⢸⣿⡇ ⣠⣿⠟⢹⣿⡇    S I G N A L
//	 ⢸⣿⣇⣴⣿⠋ ⢸⣿⡇    ⣠⡾⠋⣠⡾⠋⣠⡾⠋⣠⡾⠋⣠⡾⠋
//	  ⢿⣿⡟⠁ ⢀⣾⡿
//	 ⣴⣿⠿⣿⣶⣶⣿⠟⠁
//	⠈⠻⠁
//
// Each row is a line of one-cell Braille patterns (U+2800..U+28FF), each a
// 2 x 4 dot grid; each mask names what every cell draws: r the ring, s the
// slash, a space nothing. A terminal cell is about half as wide as it is
// tall, so the dots sit on a square grid: the site draws one circle per
// raised dot (see brailleDots).

export interface BrailleArt {
  rows: readonly string[];
  mask: readonly string[];
}

/** The large emblem (12 x 8 cells, 24 x 32 dots), emblemLarge in the app. */
export const EMBLEM_LARGE: BrailleArt = {
  rows: [
    '         ⢀⣦⡀',
    '  ⢀⣴⣿⠿⠿⣿⣶⣿⠟ ',
    '  ⣾⡿⠁ ⢀⣼⣿⣷  ',
    ' ⢸⣿⡇ ⣠⣿⠟⢹⣿⡇ ',
    ' ⢸⣿⣇⣴⣿⠋ ⢸⣿⡇ ',
    '  ⢿⣿⡟⠁ ⢀⣾⡿  ',
    ' ⣴⣿⠿⣿⣶⣶⣿⠟⠁  ',
    '⠈⠻⠁         ',
  ],
  mask: [
    '         sss',
    '  rrrrrrrss ',
    '  rrr ssrr  ',
    ' rrr sssrrr ',
    ' rrrsss rrr ',
    '  rrss rrr  ',
    ' ssrrrrrrr  ',
    'sss         ',
  ],
};

/** The compact emblem (8 x 6 cells, 16 x 24 dots), emblemCompact in the app. */
export const EMBLEM_COMPACT: BrailleArt = {
  rows: [
    '   ⣀⣀ ⢠⣤',
    ' ⣠⣾⠟⠻⣷⣿⠁',
    ' ⣿⠃⢠⣾⠟⣿ ',
    ' ⣿⣴⡿⠃⢠⣿ ',
    '⢀⣿⢿⣦⣴⡿⠋ ',
    '⠛⠃ ⠉⠉   ',
  ],
  mask: [
    '   rr ss',
    ' rrrrrss',
    ' rrsssr ',
    ' rsssrr ',
    'ssrrrrr ',
    'ss rr   ',
  ],
};

export const EMBLEM_NAME = ['N U 1 1', 'S I G N A L'] as const;

/** The five thin bars under the name, in the accent color (emblemMark). */
export const EMBLEM_BARS = '⣠⡾⠋⣠⡾⠋⣠⡾⠋⣠⡾⠋⣠⡾⠋';

/** The bars as one-row art, every cell drawn in the accent color. */
export const BARS_ART: BrailleArt = {
  rows: [EMBLEM_BARS],
  mask: ['m'.repeat(Array.from(EMBLEM_BARS).length)],
};

export type DotPart = 'ring' | 'slash' | 'mark';

/** One raised Braille dot, in dot units (one unit between dot centers). */
export interface Dot {
  x: number;
  y: number;
  part: DotPart;
}

// Bit k of a Braille pattern (codepoint - U+2800) raises dot k+1:
// dots 1-3 down the left column, 4-6 down the right, 7 bottom left, 8 bottom
// right. Each entry is [column, row] in the cell's 2 x 4 grid.
const DOT_POS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 0],
  [1, 1],
  [1, 2],
  [0, 3],
  [1, 3],
];

const PARTS: Record<string, DotPart> = { r: 'ring', s: 'slash', m: 'mark' };

/** Every raised dot of art, its cell's mask naming its part. */
export function brailleDots(art: BrailleArt): Dot[] {
  const dots: Dot[] = [];
  art.rows.forEach((row, r) => {
    const kinds = Array.from(art.mask[r] ?? '');
    Array.from(row).forEach((glyph, c) => {
      const part = PARTS[kinds[c] ?? ''];
      const bits = (glyph.codePointAt(0) ?? 0) - 0x2800;
      if (!part || bits <= 0 || bits > 0xff) return;
      DOT_POS.forEach(([dx, dy], k) => {
        if (bits & (1 << k)) dots.push({ x: 2 * c + dx, y: 4 * r + dy, part });
      });
    });
  });
  return dots;
}

/** The tight box around a set of dots, in dot units, each dot a 1 x 1 square. */
export function dotBounds(dots: readonly Dot[]): { x: number; y: number; width: number; height: number } {
  const xs = dots.map((d) => d.x);
  const ys = dots.map((d) => d.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) + 1 - x, height: Math.max(...ys) + 1 - y };
}

/** Dot radius, in dot units: a little gap between neighbors, as in a terminal. */
export const DOT_RADIUS = 0.4;

/**
 * An SVG path drawing every dot of part as a circle of radius r (two arcs
 * each), shifted so the box at (ox, oy) starts at 0; one path per part keeps
 * the markup small.
 */
export function dotsPath(dots: readonly Dot[], part: DotPart, ox = 0, oy = 0, r = DOT_RADIUS): string {
  const n = (v: number) => Number(v.toFixed(3));
  return dots
    .filter((d) => d.part === part)
    .map((d) => {
      const cx = d.x - ox + 0.5;
      const cy = d.y - oy + 0.5;
      return `M${n(cx - r)} ${n(cy)}a${r} ${r} 0 1 0 ${n(2 * r)} 0a${r} ${r} 0 1 0 ${n(-2 * r)} 0`;
    })
    .join('');
}

/** The NIGHT CITY and BLUE palettes (nu11signal/internal/radio/theme.go). */
export const PALETTES = {
  nightCity: {
    red: '#FF5F57',
    deep: '#E8554E',
    cyan: '#5EF6FF',
    yellow: '#FCEE0A',
    muted: '#9A3B37',
    dim: '#5A1E1E',
    ink: '#0A0A0A',
    select: '#0E2A2F',
  },
  blue: {
    red: '#347AFF',
    deep: '#2A62CC',
    cyan: '#5CE1FF',
    yellow: '#7C5CFF',
    muted: '#4A5578',
    dim: '#1C2C54',
    ink: '#05070F',
    select: '#10182E',
  },
} as const;

/**
 * A standalone square SVG of the compact emblem on a dark tile, used as the
 * favicon. Colors are fixed to NIGHT CITY because a favicon cannot read page
 * CSS; the dots are a little fatter so they hold together at 16 px.
 */
export function faviconSvg(): string {
  const dots = brailleDots(EMBLEM_COMPACT);
  const b = dotBounds(dots);
  const pad = 2;
  const size = Math.max(b.width, b.height) + 2 * pad;
  const ox = b.x - (size - b.width) / 2;
  const oy = b.y - (size - b.height) / 2;
  const { red, yellow, ink } = PALETTES.nightCity;
  const r = 0.46;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" rx="${size / 8}" fill="${ink}"/>` +
    `<path fill="${red}" d="${dotsPath(dots, 'ring', ox, oy, r)}"/>` +
    `<path fill="${yellow}" d="${dotsPath(dots, 'slash', ox, oy, r)}"/>` +
    `</svg>\n`
  );
}
