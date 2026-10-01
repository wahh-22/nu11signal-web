// @ts-check
import { defineConfig } from 'astro/config';

// The site is served first at https://wahh-22.github.io/nu11signal-web and
// later at https://nu11signal.wahh.dev. SITE_URL is the origin and BASE_PATH
// the path the site lives under; both default to the github.io project page.
// For the custom domain: SITE_URL=https://nu11signal.wahh.dev BASE_PATH=/
const site = process.env.SITE_URL || 'https://wahh-22.github.io';
const base = process.env.BASE_PATH || '/nu11signal-web';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
});
