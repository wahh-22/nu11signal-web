# Immersive terminal-style site

## Objective
Make the site feel like using nu11signal: professional, immersive and interactive, in the app's terminal style — without a command-line feature.

## Decisions (owner)
- Remove the FX toggle: effects always on (the OS "reduce motion" preference still disables motion, for accessibility).
- Boot sequence on entry (short, skippable, once per session).
- No interactive command terminal; terminal *style* only.
- Sections as framed panes like the app; a fixed bottom status bar (clock, SIG, NODE, theme, section, key hints); keyboard shortcuts.
- Data rain in the hero background.
- Section titles scramble in on scroll, like the app's content intros.
- Typography: Kode Mono everywhere, all uppercase.

## Tasks
- [ ] I1 (delegated writer): implement the above on the current simplified site (3 recordings, 3 themes, install toggle, 4 cards, install, support, footer).

## Checks
- build, check:links, check:brand, astro check; screenshots at 1280/375 in the three themes; keyboard-only pass; reduced-motion pass; performance (no layout shift, lazy videos, rain paused when hidden/offscreen).

## Progress
- I1 implemented (uncommitted, delegated writer): FX toggle removed; boot sequence (Boot.astro); panes (Pane.astro) around the hero, the recordings, the features, the install platforms and support; fixed status line (StatusBar.astro); keys `?`/`S`/`1-4` with KEYS dialog (KeysDialog.astro, Immersive.astro); hero data rain (DataRain.astro); scramble-in titles; hover/focus frames, button glitch, `▶` focus markers; Kode Mono everywhere, uppercase via CSS (commands keep their case); README updated.
- Checks: build, check:links, check:brand, astro check (0 errors) pass; headless Chrome: boot once per session, three themes via `s`, `?` open/close with focus restore, `2` jumps to SCREENS, COPY copies the lowercase command, ctrl+s ignored, no horizontal scroll at 360 px, reduced motion shows no boot/rain/scramble and paused videos with controls.
- Next: owner review of the screenshots, then commit on feat/immersive-site.
