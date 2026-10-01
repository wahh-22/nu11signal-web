// The null emblem, copied cell for cell from the app
// (nu11signal/internal/radio/emblem.go, emblemLarge): a block-drawn Ø whose
// ring is drawn in the label color and whose slash is drawn in the accent
// color. Each row is a line of half-block glyphs; each mask names what every
// cell draws: r the ring, s the slash, a space nothing.
//
//	  ▄████▄▄▀
//	▄█▀   ▄▀█▄   N U 1 1
//	██  ▄▀  ██   S I G N A L
//	▀█▄▀   ▄█▀   ◢◤◢◤◢◤◢◤◢◤
//	▄▀▀████▀
//
// A terminal cell is about half as wide as it is tall, so each half-block is
// a square: the emblem is 10 cells wide and 5 cells (10 half rows) tall.

export const EMBLEM_ROWS: readonly string[] = [
  '  ▄████▄▄▀',
  '▄█▀   ▄▀█▄',
  '██  ▄▀  ██',
  '▀█▄▀   ▄█▀',
  '▄▀▀████▀  ',
];

export const EMBLEM_MASK: readonly string[] = [
  '  rrrrrrss',
  'rrr   srrr',
  'rr  ss  rr',
  'rrrs   rrr',
  'ssrrrrrr  ',
];

export const EMBLEM_NAME = ['N U 1 1', 'S I G N A L'] as const;
export const EMBLEM_MARK = '◢◤◢◤◢◤◢◤◢◤';

export type EmblemPart = 'ring' | 'slash';

/** One filled square of the emblem, in half-block units. */
export interface EmblemRect {
  x: number;
  y: number;
  width: number;
  height: number;
  part: EmblemPart;
}

export const EMBLEM_WIDTH = 10;
export const EMBLEM_HEIGHT = 10;

/**
 * The emblem as filled rectangles, one unit per half-block, with horizontal
 * runs of the same part merged so the SVG stays small and crisp.
 */
export function emblemRects(): EmblemRect[] {
  // Expand every cell into its top and bottom half.
  const grid: (EmblemPart | null)[][] = [];
  EMBLEM_ROWS.forEach((row, r) => {
    const cells = Array.from(row);
    const kinds = Array.from(EMBLEM_MASK[r] ?? '');
    const top: (EmblemPart | null)[] = [];
    const bottom: (EmblemPart | null)[] = [];
    cells.forEach((glyph, c) => {
      const kind = kinds[c];
      const part: EmblemPart | null = kind === 'r' ? 'ring' : kind === 's' ? 'slash' : null;
      top.push(part && (glyph === '█' || glyph === '▀') ? part : null);
      bottom.push(part && (glyph === '█' || glyph === '▄') ? part : null);
    });
    grid.push(top, bottom);
  });

  const rects: EmblemRect[] = [];
  grid.forEach((line, y) => {
    for (let x = 0; x < line.length; ) {
      const part = line[x];
      if (!part) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < line.length && line[end] === part) end++;
      rects.push({ x, y, width: end - x, height: 1, part });
      x = end;
    }
  });
  return rects;
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
 * A standalone SVG of the emblem on a dark tile, used as the favicon.
 * Colors are fixed to NIGHT CITY because a favicon cannot read page CSS.
 */
export function emblemSvg(options: { tile?: boolean; unit?: number } = {}): string {
  const unit = options.unit ?? 16;
  const pad = options.tile ? 2 * unit : 0;
  const size = EMBLEM_WIDTH * unit + 2 * pad;
  const { red, yellow, ink } = PALETTES.nightCity;
  const tile = options.tile
    ? `<rect width="${size}" height="${size}" rx="${unit * 2}" fill="${ink}"/>`
    : '';
  const body = emblemRects()
    .map(
      (r) =>
        `<rect x="${pad + r.x * unit}" y="${pad + r.y * unit}" width="${r.width * unit}" height="${r.height * unit}" fill="${r.part === 'ring' ? red : yellow}"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${tile}${body}</svg>\n`;
}
