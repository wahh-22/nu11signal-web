// Site-wide settings. Edit this file to change links shown on the site.

export const REPO = 'wahh-22/nu11signal';
export const REPO_URL = `https://github.com/${REPO}`;

export const LINKS = {
  repo: REPO_URL,
  releases: `${REPO_URL}/releases`,
  latestRelease: `${REPO_URL}/releases/latest`,
  issues: `${REPO_URL}/issues`,
  license: `${REPO_URL}/blob/main/LICENSE`,
  docs: `${REPO_URL}#documentation`,
  usage: `${REPO_URL}/blob/main/docs/usage.md`,
  siteRepo: 'https://github.com/wahh-22/nu11signal-web',
} as const;

export const INSTALL_COMMAND = 'brew install --cask wahh-22/tap/nu11signal';

export const SITE = {
  title: 'nu11signal — a cyberpunk car radio for Apple Music, in your terminal',
  shortTitle: 'nu11signal',
  description:
    'nu11signal is a cyberpunk car radio for Apple Music, in your terminal: library playlists on a pseudo FM dial, catalog search, favorites, and data rain that plays the music. macOS 14+.',
} as const;

// ---------------------------------------------------------------------------
// Support the signal (donations)
//
// PLACEHOLDERS: set each URL to enable its button. While a URL is an empty
// string its button shows "coming soon" instead of a link, and while both are
// empty the whole section reads "coming soon".
//
//   coffee:   e.g. 'https://buymeacoffee.com/<your-handle>' or a Ko-fi link
//   sponsors: e.g. 'https://github.com/sponsors/<your-handle>'
// ---------------------------------------------------------------------------
export const DONATIONS = {
  coffee: '', // TODO(placeholder): Buy Me a Coffee URL
  sponsors: '', // TODO(placeholder): GitHub Sponsors URL
} as const;
