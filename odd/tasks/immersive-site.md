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
- Review follow-up (uncommitted, on top of 0e72d8e): R3-glitch-arm-during-boot — Boot.astro sets `<html data-booting>` and fires `nu11signal:boot-end`; SignalGlitch arms only after it and never fires while booting (before, the glitch was never armed on a booting visit). R3-keys-dialog-position — `.pane` overrode the modal's `position: fixed` (dialog anchored to the document); now fixed, centered, max-height 100dvh-2rem with the list scrolling in `.keys__body`. R3-rain-respawn-units — drop y/len/speed in rows throughout, `gone()` helper, pointer respawn on the grid, backing store redone on devicePixelRatio change. R3-single-key-shortcuts — editable guard covers ARIA text roles and contenteditable ancestors, key repeat ignored, and a SHORTCUTS ON/OFF switch in KEYS (WCAG 2.1.4, `nu11signal:shortcuts`).
- Checks: build, check:links, astro check (0 errors) pass; CDP: no glitch/theme change during the boot and `?glitch=now` fires after it; KEYS fully visible and centered at 1280x800, 360x640 and 1280x420 with the page scrolled; textbox guard and off switch work; rain draws; the earlier suite and the reduced-motion suite still pass.
- Fit-sections (uncommitted, feat/fit-sections, delegated writer): owner feedback "each section seen complete and fit to the screen". Fit mode (min-width 52.0625rem and min-height 35rem): every section is one screen (`--screen-h` = 100svh minus the measured header and status line), content scaled to fit (hero logo absorbs the shortfall via a flex chain; overview video in its own screen and the two recordings side by side in the next, both sized to the screen height at 1278:702; SUPPORT shares the last screen with the footer via measured `--footer-h`); `scroll-snap-type: y proximity` with `scroll-padding` for the header, off with reduced motion; phones and short windows keep natural heights. Screens heading texts removed (sr-only h2); FEATURES/INSTALL/SUPPORT big titles removed, their kicker frames are now the h2 and scramble in; ledes with content (install links, support note) kept. README updated.
- Checks: build, check:links, check:brand, astro check (0 errors) pass; CDP fit table at 1280x720, 1440x900, 1920x1080, 1000x600, 1000x560: all six screens land at the header bottom and fit above the status line, panes contain their content; 390x844 falls back (no snap); no horizontal scroll at 360 px; reduced motion: no snap, rain, scramble, paused videos.
