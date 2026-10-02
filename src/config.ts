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
  installLinux: `${REPO_URL}/blob/main/docs/install.md#linux`,
  localFiles: `${REPO_URL}/blob/main/docs/usage.md#local-files`,
  siteRepo: 'https://github.com/wahh-22/nu11signal-web',
} as const;

// Homebrew install commands. The cask is macOS-only (it also installs the
// Kode Mono font); Linux uses the formula through Homebrew on Linux.
export const INSTALL_COMMANDS = {
  macos: 'brew install --cask wahh-22/tap/nu11signal',
  linux: 'brew install wahh-22/tap/nu11signal',
} as const;

export const LINUX_FONT_COMMAND = 'brew install --cask font-kode-mono';

export const SITE = {
  title: 'nu11signal — a cyberpunk car radio for Apple Music, in your terminal',
  shortTitle: 'nu11signal',
  description:
    'nu11signal is a cyberpunk car radio for Apple Music, in your terminal: playlists on a pseudo FM dial, catalog search, favorites, your own music files, and data rain that plays the music. Apple Music and local files on macOS 14+, local files on Linux.',
} as const;

// ---------------------------------------------------------------------------
// Support the signal (donations)
//
// Each URL enables its button; an empty string shows "coming soon" instead,
// and with both empty the whole section reads "coming soon".
// ---------------------------------------------------------------------------
export const DONATIONS = {
  coffee: 'https://buymeacoffee.com/wahh.dev',
  sponsors: 'https://github.com/sponsors/wahh-22',
} as const;
