# SuuntoPlusClimbApp

A SuuntoPlus feature app that shows live climb data — gradient, VAM, and a climb category — while cycling, plus averages in the post-exercise summary.

## Features

- **Gradient** — instantaneous climbing gradient (%), smoothed to filter out GPS/barometer noise.
- **VAM** — Vertical Ascent Meters per hour, averaged over time spent ascending.
- **Category** — the current gradient classified into a Tour-de-France-style climb rating, color-coded on screen.

## How it works

Gradient is computed as vertical speed over ground speed (`vSpeed / speed * 100`), sourced from `Fusion/Altitude/VerticalSpeed` and `Activity/Current/Speed`. Below 0.3 m/s ground speed the value is frozen rather than recomputed, since GPS/barometer noise dominates at low speed. The raw gradient is clamped to ±60% and smoothed with an exponential moving average (α = 0.2) to react to slope changes within a few seconds without spiking on noise.

VAM is `ascent / ascentTime` (`Fusion/Altitude/Ascent` and `Fusion/Altitude/AscentTime`), so flat sections and descents don't dilute the rate.

Average gradient is the mean of the smoothed gradient across all samples taken while riding (ground speed above the noise floor), tracked as a running sum/count in `main.js`. This is also what's reported as "Avg gradient" in the exercise summary.

The smoothed gradient is classified into one of seven categories:

| Category | Gradient    | Color     |
|----------|-------------|-----------|
| Flat     | < 2%        | Gray      |
| Cat4     | 2% – 5%     | Green     |
| Cat3     | 5% – 7%     | Blue      |
| Cat2     | 7% – 8%     | Yellow    |
| Cat1     | 8% – 10%    | Orange    |
| HC       | 10% – 12%   | Red       |
| HC+      | ≥ 12%       | Dark red  |

## On-watch display

The app has two screens, toggled with the watch's down button (see `onEvent` in `main.js`):

- `t.html` — the "Climb" screen, showing the current Gradient and VAM values, max gradient, total ascent, and the Category name in its corresponding color underneath.
- `t2.html` — the "Profile" screen, showing climb duration (`Fusion/Altitude/AscentTime`), average gradient for the session so far, and a live altitude profile graph subscribed to `Activity/Move/-1/Altitude/Current`.

The exercise summary additionally reports average VAM and average gradient for the whole session.

## Debug mode

Since the bundled SuuntoPlus simulator doesn't feed real vertical-speed/altitude telemetry, `main.js` has a `DEBUG_MODE` flag that lets the watch's up/down buttons drive the gradient by hand (short press to step, long press to reset), so the category/color logic can be exercised without real climb data. This is for development only — the flag, its `onEvent` handling in `main.js`, and the `<userInput>` block in `t.html` should be removed before shipping.

## Project structure

- `manifest.json` — Zapp descriptor: declared inputs/outputs and app metadata.
- `main.js` — gradient/VAM computation, category classification logic, and screen-toggle handling.
- `t.html` — "Climb" screen template.
- `t2.html` — "Profile" screen template (climb duration, average gradient, altitude graph).

## License

GPL-2.0 — see [LICENSE](LICENSE).
