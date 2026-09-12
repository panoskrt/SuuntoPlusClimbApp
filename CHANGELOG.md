# Changelog

VeloClimb changes

## 2026-09-12

- Fixed the heart-rate icon on the climb screen not rendering on-device: it was declared as a `<span>` with absolute positioning, which the on-watch renderer doesn't support the way the browser-based emulator does. Changed to a `<div>`, matching every other positioned icon in the app.

## 2026-09-11

- Minor colouring tweaks.

## 2026-09-10

- Added remaining route ascent to the profile screen (`t2.html`); minor UI colouring.
- Updated README to match the two-screen layout.
- Merged the second-screen work (`feat/secondPage`) into `main`.

## 2026-08-06

- UI fixes.

## 2026-08-04

- Removed the unfinished altitude-profile graph from the profile screen (kept commented out for reference) and added remaining route ascent in its place; minor UI tweaks.
- Updated README.

## 2026-07-30

- Added a live heart-rate field to the climb screen; simplified some UI bits; added a cadence field for testing.

## 2026-07-26

- Refactored the climb-category corona gauge and introduced a dedicated Descent category, so negative gradients are no longer lumped into Flat.

## 2026-07-25

- Added the animated corona gauge with a needle pointing at the current climb category (first working version).

## 2026-07-24

- Added the second (profile) screen with climb duration and average gradient; various UI fixes.

## 2026-07-23

- Reworked VAM into a genuine 30-second rolling-window calculation instead of using raw vertical speed directly.
- Removed unused code/manifest entries; small JSON fix.

## 2026-07-22

- Added an early, untested climb-arc visualization on the climb screen.
- Fixed total-ascent output formatting.
- Replaced manual rounding with format-based rounding for summary outputs.

## 2026-07-21

- Introduced an altitude-profile graph on a second screen and a five-field screen layout (both later reworked/removed); rounded total ascent and VAM for display; various UI fixes.

## 2026-07-20

- Initial app commit: gradient, VAM, and climb-category logic in `main.js`, first climb-screen template, manifest, and license.
- Added max-gradient tracking, debug fixes, simulator-only button behaviour, a 5-second update interval, and early UI polish (title, category font size).

