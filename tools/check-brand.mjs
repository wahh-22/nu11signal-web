// Fails when the brand copies drifted from the logos in public/logo/:
// src/assets/og-card.svg must be exactly what tools/og-card.mjs generates,
// and public/favicon.svg must be a byte copy of the default theme's mark
// (src/themes.mjs, BLUESHIFT).
// Fix either with: npm run brand
//
// Usage: npm run check:brand

import { readFileSync } from 'node:fs';
import { CARD, FAVICON, LOGO, MARK, MARK_REL, renderOgCard } from './og-card.mjs';

const problems = [];

if (readFileSync(CARD, 'utf8') !== renderOgCard(readFileSync(LOGO, 'utf8'))) {
  problems.push('src/assets/og-card.svg differs from what tools/og-card.mjs generates');
}
if (!readFileSync(FAVICON).equals(readFileSync(MARK))) {
  problems.push(`public/favicon.svg differs from ${MARK_REL}`);
}

if (problems.length) {
  for (const p of problems) console.error(`check-brand: ${p}`);
  console.error('check-brand: run npm run brand');
  process.exit(1);
}
console.log('check-brand: og-card.svg and favicon.svg match the logos');
