// Fails when the brand copies drifted from the logos in public/logo/:
// src/assets/og-card.svg must be exactly what tools/og-card.mjs generates,
// and public/favicon.svg must be a byte copy of the Night City mark.
// Fix either with: npm run brand
//
// Usage: npm run check:brand

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CARD, LOGO, renderOgCard } from './og-card.mjs';

const file = (rel) => fileURLToPath(new URL(`../${rel}`, import.meta.url));
const problems = [];

if (readFileSync(CARD, 'utf8') !== renderOgCard(readFileSync(LOGO, 'utf8'))) {
  problems.push('src/assets/og-card.svg differs from what tools/og-card.mjs generates');
}
if (!readFileSync(file('public/favicon.svg')).equals(readFileSync(file('public/logo/nu11signal-mark-night-city.svg')))) {
  problems.push('public/favicon.svg differs from public/logo/nu11signal-mark-night-city.svg');
}

if (problems.length) {
  for (const p of problems) console.error(`check-brand: ${p}`);
  console.error('check-brand: run npm run brand');
  process.exit(1);
}
console.log('check-brand: og-card.svg and favicon.svg match the logos');
