# nu11signal-web

The website for [nu11signal](https://github.com/wahh-22/nu11signal), a neon car radio for Apple Music in your terminal (Apple Music and local files on macOS, local files on Linux).

It is a static [Astro](https://astro.build) site published on GitHub Pages:

- now: https://nu11signal.wahh.dev
- later: https://nu11signal.wahh.dev (see [Custom domain](#custom-domain))

## Local development

Requires Node.js 22.12 or later (CI uses Node 24).

```sh
npm install        # install dependencies (uses the committed package-lock.json)
npm run dev        # dev server at http://localhost:4321/nu11signal-web/
npm run build      # static build into dist/
npm run preview    # serve dist/ locally
npm run check      # astro check (TypeScript and .astro diagnostics)
npm run check:links  # after a build: find broken internal links and assets in dist/
```

### Base path and site URL

The build reads two environment variables (see `astro.config.mjs`):

| Variable    | Default                     | Custom domain                  |
|-------------|-----------------------------|--------------------------------|
| `SITE_URL`  | `https://wahh-22.github.io` | `https://nu11signal.wahh.dev`  |
| `BASE_PATH` | `/nu11signal-web`           | `/`                            |

Build for the custom domain locally with:

```sh
BASE_PATH=/ SITE_URL=https://nu11signal.wahh.dev npm run build
BASE_PATH=/ SITE_URL=https://nu11signal.wahh.dev npm run check:links
```

Internal links and assets go through `import.meta.env.BASE_URL`, so both work.

## Where things live

| Path | What |
|------|------|
| `src/config.ts` | Links, the macOS and Linux install commands, page title and description, **donation URLs** |
| `public/logo/` | The official vector logos, one per site theme — BLUESHIFT, REDSHIFT and NEON ROSE (`nu11signal-<theme>.svg`, 1650x520), and their head-only marks (`nu11signal-mark-<theme>.svg`, the same paths cropped to a 500x500 viewBox). The hero shows the full logo and the header, footer and 404 page the mark, all through `src/components/ThemeArt.astro`; global.css `.theme-art` shows the file for the active theme |
| `src/components/SignalGlitch.astro` | The periodic page glitch that also advances the theme |
| `src/components/` | Page sections: header, hero, screens, features, requirements, keys, support, footer |
| `src/styles/global.css` | Theme tokens and shared styles |
| `public/demo/` | The three recordings of the screens section, each as `<name>.webm`, `<name>.mp4` (encoded from the owner's GIFs with ffmpeg) and `<name>-poster.jpg`: `overview` (the main figure), `search` (SEARCH) and `themes` (switching themes in SETTINGS and quitting). The section shows recordings only, no still renders |
| `public/favicon.svg` | A copy of `public/logo/nu11signal-mark-blueshift.svg` |
| `public/og.png` | The 1200x630 social card, rendered from `src/assets/og-card.svg` (the Blueshift logo on the BLUESHIFT background), which `tools/og-card.mjs` generates from `public/logo/nu11signal-blueshift.svg`; do not edit the card by hand |
| `tools/check-links.mjs` | Internal link and asset checker for `dist/` |

If the logos change, replace the files in `public/logo/` (keep the marks in step) and run `npm run brand` (needs `rsvg-convert`, from librsvg) to refresh the favicon, regenerate `src/assets/og-card.svg` and render `public/og.png`. `npm run check:brand` fails when the card or the favicon no longer match the logos.

## Themes

The app has five themes; the site has three of them, the ones in the themes recording: **BLUESHIFT** (electric blue and violet, the default), **REDSHIFT** (neon red, cyan and yellow) and **NEON ROSE** (hot pinks with silver). The theme button in the header shows the current one and cycles BLUESHIFT → REDSHIFT → NEON ROSE → BLUESHIFT; the choice is saved per browser. A choice saved under an old theme id, `night-city` or `blue`, loads as its renamed theme (REDSHIFT or BLUESHIFT); any other saved value, including the app's themes the site does not show, loads BLUESHIFT and is rewritten. The palettes live as CSS tokens per `data-theme` in `src/styles/global.css`.

## Signal effects and accessibility

Like the app, the page now and then loses the signal: every 10 to 22 seconds a burst of 0.6 to 1 second tears a few bands of the page sideways, scatters noise cells (blocks and Braille) in the theme's colors, and one burst in four flashes `NO SIGNAL`. Midway through each burst the theme advances one step, saved like a click on the theme button.

- No bursts and no automatic theme switch when the visitor prefers reduced motion (`prefers-reduced-motion: reduce`) or turns the effects off (**FX OFF**, saved per browser).
- Nothing flashes faster than three times a second: burst frames last 110 to 140 ms and change only small areas, and the `NO SIGNAL` sign stays up for the whole burst (WCAG 2.3.1).
- A manual theme click cancels a running burst and restarts the wait; the next burst continues the rotation from the chosen theme, so bursts rotate through all three. The wait pauses while the tab is hidden.
- Add `?glitch=now` to the URL to see the first burst after 300 ms.

## Donation links

Edit `DONATIONS` in `src/config.ts`:

```ts
export const DONATIONS = {
  coffee: 'https://buymeacoffee.com/<handle>',
  sponsors: 'https://github.com/sponsors/<handle>',
};
```

While a URL is an empty string, its button shows "coming soon" instead of a link; with both empty, the "Support the signal" section says donations are coming soon.

## Deploy

`.github/workflows/deploy.yml` builds with [`withastro/action`](https://github.com/withastro/action) and deploys with `actions/deploy-pages` on every push to `main` (or a manual run).

One-time setup in the GitHub repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Custom domain

The site is ready for `nu11signal.wahh.dev` but does not claim it yet. To switch:

1. **DNS:** at the `wahh.dev` DNS provider, add a `CNAME` record `nu11signal` → `wahh-22.github.io`.
2. **Verify the domain** (recommended, prevents takeovers): GitHub → your account or org **Settings → Pages → Add a domain**, add `nu11signal.wahh.dev`, and create the TXT record it shows.
3. **Point the build at the domain:** in this repo, **Settings → Secrets and variables → Actions → Variables**, add `SITE_URL=https://nu11signal.wahh.dev` and `BASE_PATH=/`.
4. **Add `public/CNAME`** containing the single line `nu11signal.wahh.dev`, commit, and push to `main`.
5. **Settings → Pages → Custom domain:** enter `nu11signal.wahh.dev`, wait for the DNS check, then tick **Enforce HTTPS**.

The github.io URL then redirects to the custom domain.

## License

MIT, see [LICENSE](LICENSE). nu11signal is not affiliated with Apple.
