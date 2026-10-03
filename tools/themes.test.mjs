// Tests for src/themes.mjs: the saved-theme migration (the same function the
// pre-paint script inlines), the generated scripts and CSS, and that every
// theme has its palette and logo files.
//
// Usage: npm test

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import {
  DEFAULT_THEME,
  RENAMED_THEMES,
  THEME_IDS,
  THEME_STORAGE_KEY,
  logoFile,
  migrateTheme,
  nextTheme,
  prePaintThemeScript,
  themeArtCss,
} from '../src/themes.mjs';

const root = (rel) => fileURLToPath(new URL(`../${rel}`, import.meta.url));
const migrate = (saved) => migrateTheme(saved, THEME_IDS, RENAMED_THEMES, DEFAULT_THEME);

test('migrateTheme keeps "nothing saved" as null', () => {
  assert.equal(migrate(null), null);
  assert.equal(migrate(''), null);
});

test('migrateTheme maps renamed ids to their new ids', () => {
  assert.equal(migrate('night-city'), 'redshift');
  assert.equal(migrate('blue'), 'blueshift');
});

test('migrateTheme keeps every current theme', () => {
  for (const id of THEME_IDS) assert.equal(migrate(id), id);
});

test('migrateTheme sends unknown values to BLUESHIFT', () => {
  assert.equal(DEFAULT_THEME, 'blueshift');
  for (const v of ['pink', 'matrix', 'BLUESHIFT', 'toString', '__proto__', 'hasOwnProperty']) {
    assert.equal(migrate(v), 'blueshift', v);
  }
});

// Runs the generated pre-paint script against a fake document and storage.
function runPrePaint(saved) {
  const store = new Map(saved === null ? [] : [[THEME_STORAGE_KEY, saved]]);
  const html = { dataset: { theme: DEFAULT_THEME } };
  const context = {
    document: { documentElement: html },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
    },
  };
  vm.runInNewContext(prePaintThemeScript(), context);
  return { theme: html.dataset.theme, stored: store.get(THEME_STORAGE_KEY) ?? null };
}

test('the pre-paint script applies and rewrites migrated themes', () => {
  assert.deepEqual(runPrePaint(null), { theme: 'blueshift', stored: null });
  assert.deepEqual(runPrePaint('redshift'), { theme: 'redshift', stored: 'redshift' });
  assert.deepEqual(runPrePaint('night-city'), { theme: 'redshift', stored: 'redshift' });
  assert.deepEqual(runPrePaint('blue'), { theme: 'blueshift', stored: 'blueshift' });
  assert.deepEqual(runPrePaint('pink'), { theme: 'blueshift', stored: 'blueshift' });
});

test('the pre-paint script survives blocked storage', () => {
  const html = { dataset: { theme: DEFAULT_THEME } };
  const context = {
    document: { documentElement: html },
    localStorage: {
      getItem() {
        throw new Error('blocked');
      },
    },
  };
  vm.runInNewContext(prePaintThemeScript(), context);
  assert.equal(html.dataset.theme, DEFAULT_THEME);
});

test('nextTheme cycles through every theme and wraps', () => {
  const seen = [];
  let id = DEFAULT_THEME;
  for (let i = 0; i < THEME_IDS.length; i++) {
    seen.push(id);
    id = nextTheme(id).id;
  }
  assert.equal(id, DEFAULT_THEME);
  assert.deepEqual([...seen].sort(), [...THEME_IDS].sort());
});

test('themeArtCss shows one image per theme, the default also without data-theme', () => {
  const css = themeArtCss();
  for (const id of THEME_IDS) assert.match(css, new RegExp(`\\[data-theme='${id}'\\]`));
  assert.match(css, new RegExp(`:not\\(\\[data-theme\\]\\)\\) \\.theme-art__img--${DEFAULT_THEME}`));
});

test('every theme has its logo files and a palette block in global.css', () => {
  const css = readFileSync(root('src/styles/global.css'), 'utf8');
  for (const id of THEME_IDS) {
    assert.ok(existsSync(root(`public/${logoFile('logo', id)}`)), logoFile('logo', id));
    assert.ok(existsSync(root(`public/${logoFile('mark', id)}`)), logoFile('mark', id));
    assert.ok(css.includes(`:root[data-theme='${id}'] {`), `palette block for ${id}`);
  }
  // The default palette is defined once, shared with the plain :root.
  assert.ok(css.includes(`:root,\n:root[data-theme='${DEFAULT_THEME}'] {`));
  assert.equal(css.match(/:not\(\[data-theme\]\)/g), null, 'no selector repeats the default');
});
