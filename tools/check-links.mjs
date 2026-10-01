// Checks dist/ for broken internal links and assets.
//
// Every href/src/srcset in the built HTML that points inside the site (a
// relative path, or an absolute path under BASE_PATH, or a full URL on
// SITE_URL) must resolve to a file in dist/, and every #fragment on the same
// page must match an id. External URLs are skipped.
//
// Usage: npm run build && npm run check:links
//        (uses the same SITE_URL / BASE_PATH env as the build)

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const site = process.env.SITE_URL || 'https://wahh-22.github.io';
const base = (process.env.BASE_PATH || '/nu11signal-web').replace(/\/?$/, '/');
const origin = new URL(site).origin;

if (!existsSync(dist)) {
  console.error('check-links: dist/ not found; run npm run build first');
  process.exit(2);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const idsByFile = new Map();
const idsOf = (file) => {
  if (!idsByFile.has(file)) {
    const html = readFileSync(file, 'utf8');
    idsByFile.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsByFile.get(file);
};

/** Maps a site path (under base) to the dist file that serves it. */
function resolveFile(pathname) {
  if (!pathname.startsWith(base) && pathname + '/' !== base) return null;
  const rel = decodeURIComponent(pathname.slice(base.length));
  const candidates = [join(dist, rel), join(dist, rel, 'index.html'), join(dist, `${rel}.html`)];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
}

let checked = 0;
const broken = [];

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const pagePath = base + relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const pageUrl = new URL(pagePath, origin);
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) {
    for (const part of m[1].split(',')) refs.push(part.trim().split(/\s+/)[0]);
  }
  // og:image / twitter:image / og:url / canonical point at this site too.
  for (const m of html.matchAll(/<meta[^>]+content="(https?:\/\/[^"]+)"/g)) refs.push(m[1]);

  for (const ref of refs) {
    if (!ref || /^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
    const url = new URL(ref.replace(/&amp;/g, '&'), pageUrl);
    if (url.origin !== origin) continue; // external
    checked++;
    const target = resolveFile(url.pathname);
    if (!target) {
      broken.push(`${relative(dist, file)}: ${ref} (no file for ${url.pathname})`);
      continue;
    }
    if (url.hash && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(url.hash.slice(1)))) {
      broken.push(`${relative(dist, file)}: ${ref} (no element with id ${url.hash})`);
    }
  }
}

console.log(`check-links: base ${base}, ${htmlFiles.length} pages, ${checked} internal references checked`);
if (broken.length) {
  console.error(`check-links: ${broken.length} broken:\n  ${broken.join('\n  ')}`);
  process.exit(1);
}
console.log('check-links: no broken internal links or assets');
