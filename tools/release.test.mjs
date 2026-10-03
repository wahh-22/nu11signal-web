// Tests for src/release.mjs: tag validation and the badge script's request,
// cache and fallback behavior, run against fake DOM, storage and fetch.
//
// Usage: npm test

import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { RELEASE_CACHE_KEY, parseReleaseTag, releaseBadgeScript } from '../src/release.mjs';

const API = 'https://api.github.com/repos/wahh-22/nu11signal/releases/latest';
const TAG_BASE = 'https://github.com/wahh-22/nu11signal/releases/tag/';
const FALLBACK_HREF = 'https://github.com/wahh-22/nu11signal/releases/latest';

test('parseReleaseTag accepts only vMAJOR.MINOR.PATCH', () => {
  for (const ok of ['v0.7.1', 'v1.0.0', 'v10.20.30']) assert.equal(parseReleaseTag(ok), ok);
  for (const bad of [
    undefined,
    null,
    7,
    '',
    '0.7.1',
    'v0.7',
    'v0.7.1-rc.1',
    'v0.7.1 ',
    'V0.7.1',
    '<img src=x onerror=alert(1)>',
    'v0.7.1\n',
  ]) {
    assert.equal(parseReleaseTag(bad), null, String(bad));
  }
});

// A page with the badge, session storage and a scripted fetch.
function page({ cached, respond, storageBlocked = false } = {}) {
  const store = new Map(cached === undefined ? [] : [[RELEASE_CACHE_KEY, cached]]);
  const value = { textContent: 'release' };
  const attrs = { href: FALLBACK_HREF };
  const badge = {
    querySelector: (sel) => (sel === '[data-release-version]' ? value : null),
    setAttribute: (k, v) => (attrs[k] = v),
  };
  const calls = [];
  const storage = {
    getItem(k) {
      if (storageBlocked) throw new Error('blocked');
      return store.has(k) ? store.get(k) : null;
    },
    setItem(k, v) {
      if (storageBlocked) throw new Error('blocked');
      store.set(k, String(v));
    },
  };
  const context = {
    document: { querySelector: (sel) => (sel === '[data-release-badge]' ? badge : null) },
    sessionStorage: storage,
    fetch: (url, opts) => {
      calls.push({ url, opts });
      return respond();
    },
    AbortController,
    setTimeout,
    clearTimeout,
  };
  return {
    run: async () => {
      vm.runInNewContext(releaseBadgeScript(API, TAG_BASE), context);
      await new Promise((r) => setTimeout(r, 10));
    },
    calls,
    store,
    value,
    attrs,
  };
}

const ok = (body) => () => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
const status = (code) => () => Promise.resolve({ ok: false, status: code, json: () => Promise.resolve({}) });

test('a valid tag shows LATEST vX.Y.Z linking to its release, cached for the session', async () => {
  const p = page({ respond: ok({ tag_name: 'v0.7.1' }) });
  await p.run();
  assert.equal(p.calls.length, 1);
  assert.equal(p.calls[0].url, API);
  assert.equal(p.value.textContent, 'v0.7.1');
  assert.equal(p.attrs.href, `${TAG_BASE}v0.7.1`);
  assert.equal(p.store.get(RELEASE_CACHE_KEY), 'v0.7.1');
});

test('a cached tag shows without any request', async () => {
  const p = page({ cached: 'v0.8.0', respond: ok({ tag_name: 'v9.9.9' }) });
  await p.run();
  assert.equal(p.calls.length, 0);
  assert.equal(p.value.textContent, 'v0.8.0');
});

test('a rate limit keeps the fallback and is not retried this session', async () => {
  for (const code of [403, 429, 500]) {
    const p = page({ respond: status(code) });
    await p.run();
    assert.equal(p.value.textContent, 'release');
    assert.equal(p.attrs.href, FALLBACK_HREF);
    assert.equal(p.store.get(RELEASE_CACHE_KEY), '');
  }
  const again = page({ cached: '', respond: ok({ tag_name: 'v0.7.1' }) });
  await again.run();
  assert.equal(again.calls.length, 0);
  assert.equal(again.value.textContent, 'release');
});

test('a network error or an invalid tag keeps the fallback', async () => {
  const offline = page({ respond: () => Promise.reject(new TypeError('Failed to fetch')) });
  await offline.run();
  assert.equal(offline.value.textContent, 'release');
  assert.equal(offline.store.get(RELEASE_CACHE_KEY), '');

  const bad = page({ respond: ok({ tag_name: '<b>v1</b>' }) });
  await bad.run();
  assert.equal(bad.value.textContent, 'release');
  assert.equal(bad.attrs.href, FALLBACK_HREF);
});

test('a poisoned cache value is ignored', async () => {
  const p = page({ cached: '<script>', respond: ok({ tag_name: 'v0.7.1' }) });
  await p.run();
  assert.equal(p.calls.length, 0);
  assert.equal(p.value.textContent, 'release');
});

test('blocked session storage still shows the tag', async () => {
  const p = page({ storageBlocked: true, respond: ok({ tag_name: 'v0.7.1' }) });
  await p.run();
  assert.equal(p.calls.length, 1);
  assert.equal(p.value.textContent, 'v0.7.1');
});
