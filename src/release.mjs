// The hero's latest-release badge (Hero.astro). The page ships with a plain
// link, "LATEST RELEASE" to the releases/latest page; a small inline script
// asks the GitHub API for the latest tag once per browser session, caches the
// answer in sessionStorage (a failure too, as an empty string, so a rate limit
// or an outage is not retried on every page view) and, for a valid tag, shows
// "LATEST vX.Y.Z" linking to that release. The tag is validated before use and
// only ever set as textContent.

/** sessionStorage key: the validated tag, or '' after a failed lookup. */
export const RELEASE_CACHE_KEY = 'nu11signal:latest-release';

/**
 * Returns the tag when it is exactly vMAJOR.MINOR.PATCH, else null.
 * Inlined into the page by releaseBadgeScript(): keep it self-contained ES5.
 * @param {unknown} tag
 * @returns {string | null}
 */
export function parseReleaseTag(tag) {
  return typeof tag === 'string' && /^v\d{1,5}\.\d{1,5}\.\d{1,5}$/.test(tag) ? tag : null;
}

/**
 * Runs in the page. Inlined into the page by releaseBadgeScript(): keep it
 * self-contained ES5.
 * @param {(tag: unknown) => string | null} parse
 * @param {string} api the GitHub API URL of the latest release
 * @param {string} tagBase the release page URL prefix (the tag is appended)
 * @param {string} key the sessionStorage key
 */
export function runReleaseBadge(parse, api, tagBase, key) {
  var badge = document.querySelector('[data-release-badge]');
  var out = badge && badge.querySelector('[data-release-version]');
  if (!badge || !out) return;
  function show(tag) {
    var t = parse(tag);
    if (!t) return;
    out.textContent = t;
    badge.setAttribute('href', tagBase + t);
    badge.setAttribute('data-release', '');
  }
  function remember(value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {}
  }
  var cached = null;
  try {
    cached = sessionStorage.getItem(key);
  } catch (e) {}
  if (cached !== null) {
    show(cached);
    return;
  }
  if (typeof fetch !== 'function') return;
  var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  var timer = ctrl
    ? setTimeout(function () {
        ctrl.abort();
      }, 8000)
    : 0;
  fetch(api, { signal: ctrl ? ctrl.signal : undefined, credentials: 'omit' })
    .then(function (r) {
      // 403/429 (rate limited) and any other error status keep the fallback.
      return r.ok ? r.json() : null;
    })
    .then(function (data) {
      var t = parse(data && data.tag_name);
      remember(t || '');
      show(t);
    })
    .catch(function () {
      remember('');
    })
    .then(function () {
      clearTimeout(timer);
    });
}

/**
 * The badge's inline script, built from the two functions above so the page
 * runs exactly the code the tests cover.
 * @param {string} api
 * @param {string} tagBase
 */
export function releaseBadgeScript(api, tagBase) {
  const args = [api, tagBase, RELEASE_CACHE_KEY].map((v) => JSON.stringify(v)).join(',');
  return `(${runReleaseBadge.toString()})(${parseReleaseTag.toString()},${args});`;
}
