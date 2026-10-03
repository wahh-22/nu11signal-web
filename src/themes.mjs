// The site's color themes, in one place. Adding or removing a theme happens
// here, plus its palette block in src/styles/global.css and its two logo files
// in public/logo/ (nu11signal-<id>.svg and nu11signal-mark-<id>.svg).
//
// Used by Base.astro (the pre-paint script, the theme cycle and the per-theme
// artwork rules), Header.astro, StatusBar.astro, Immersive.astro,
// ThemeArt.astro, tools/og-card.mjs and tools/check-brand.mjs. Plain
// JavaScript so Node runs the tools and tests without a build step.

/**
 * The themes in toggle order: the button cycles through them and wraps.
 * `bg` is the page background (global.css --bg), used for <meta theme-color>.
 * @type {readonly { id: string; label: string; bg: string }[]}
 */
export const THEMES = Object.freeze([
  { id: 'blueshift', label: 'BLUESHIFT', bg: '#03050c' },
  { id: 'redshift', label: 'REDSHIFT', bg: '#070707' },
  { id: 'neon-rose', label: 'NEON ROSE', bg: '#060407' },
]);

export const THEME_IDS = Object.freeze(THEMES.map((t) => t.id));

/** The default theme: no saved choice, an unknown one, and <html> without data-theme. */
export const DEFAULT_THEME = 'blueshift';

/** Old theme ids still found in visitors' storage, mapped to their new ids. */
export const RENAMED_THEMES = Object.freeze({ 'night-city': 'redshift', blue: 'blueshift' });

/** The localStorage key that holds the visitor's theme. */
export const THEME_STORAGE_KEY = 'nu11signal:theme';

/** @param {string} id */
export function themeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[THEME_IDS.indexOf(DEFAULT_THEME)];
}

/** The theme after `id` in the toggle's cycle. @param {string} id */
export function nextTheme(id) {
  return THEMES[(THEME_IDS.indexOf(id) + 1) % THEMES.length];
}

/**
 * Maps a saved theme value to the theme to load: null stays null (nothing
 * saved, the page keeps its default), a renamed id becomes its new id, a known
 * id stays, and anything else becomes the fallback.
 *
 * Base.astro inlines this function's source into the pre-paint script, so it
 * must stay self-contained (everything it needs comes in as arguments) and
 * plain ES5.
 *
 * @param {string | null} saved
 * @param {readonly string[]} ids
 * @param {Readonly<Record<string, string>>} renamed
 * @param {string} fallback
 * @returns {string | null}
 */
export function migrateTheme(saved, ids, renamed, fallback) {
  if (saved === null || saved === undefined || saved === '') return null;
  if (Object.prototype.hasOwnProperty.call(renamed, saved)) saved = renamed[saved];
  return ids.indexOf(saved) >= 0 ? saved : fallback;
}

/**
 * The pre-paint script: applies (and rewrites, when migrated) the saved theme
 * before first paint. Built from migrateTheme's own source, so the page runs
 * exactly the function the tests cover.
 */
export function prePaintThemeScript() {
  const args = [THEME_IDS, RENAMED_THEMES, DEFAULT_THEME].map((v) => JSON.stringify(v)).join(',');
  const key = JSON.stringify(THEME_STORAGE_KEY);
  return (
    `(function(m){var d=document.documentElement;try{var s=localStorage.getItem(${key});` +
    `var t=m(s,${args});if(t&&t!==s)localStorage.setItem(${key},t);if(t)d.dataset.theme=t}catch(e){}})` +
    `(${migrateTheme.toString()});`
  );
}

/**
 * The logo files of a theme, relative to public/: kind "logo" is the full
 * 1650x520 logo, kind "mark" the 500x500 head mark.
 * @param {'logo' | 'mark'} kind
 * @param {string} [id]
 */
export function logoFile(kind, id = DEFAULT_THEME) {
  return `logo/${kind === 'logo' ? 'nu11signal' : 'nu11signal-mark'}-${id}.svg`;
}

/**
 * The .theme-art rules (ThemeArt.astro): only the image of the active theme
 * shows; the default theme's also shows when <html> has no data-theme.
 */
export function themeArtCss() {
  const selectors = THEME_IDS.map((id) =>
    id === DEFAULT_THEME
      ? `:root:is([data-theme='${id}'],:not([data-theme])) .theme-art__img--${id}`
      : `:root[data-theme='${id}'] .theme-art__img--${id}`,
  );
  return `${selectors.join(',')}{display:block}`;
}
