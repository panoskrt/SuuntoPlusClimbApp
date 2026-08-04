# SuuntoPlusClimbApp

A SuuntoPlus feature app for cycling that shows live climbing metrics: gradient, VAM, climb category, and summary outputs.

## Features

- **Instantaneous gradient** — calculated from vertical speed and ground speed, smoothed to reduce GPS/barometer noise.
- **VAM** — rolling vertical ascent rate over a 30-second window.
- **Climb category** — instant gradient is mapped into descent/flat/Cat4–HC+ categories with color-coded UI feedback.
- **Session metrics** — max gradient, total ascent, and average gradient are tracked while riding.
- **Two-screen UI** — toggle between a climb dashboard and a profile screen with session stats.

## How it works

- `main.js` subscribes to `Activity/Current/Speed`, `Fusion/Altitude/VerticalSpeed`, and `Fusion/Altitude/Ascent`.
- Instantaneous gradient is computed as:
  - `gradient = (vSpeed / speed) * 100`
- If ground speed is below `0.3 m/s`, the gradient is held constant to avoid noisy calculations.
- Raw gradient values are clamped to `±60%`.
- Gradient smoothing uses an exponential moving average with `α = 0.2`.
- Average gradient is the running mean of smoothed gradient samples during the ride.
- Max gradient is the highest smoothed gradient observed.
- VAM is computed from the last 30 seconds of `ascent` values to produce a current ascent rate.

## Category mapping

The app maps the smoothed gradient to one of eight categories:

| Output category | Gradient range | UI label | Color |
|-----------------|----------------|----------|-------|
| 0               | < 0%           | Descent  | Blue  |
| 1               | 0% – 2%        | Flat     | Gray  |
| 2               | 2% – 5%        | Cat4     | Green |
| 3               | 5% – 7%        | Cat3     | Blue  |
| 4               | 7% – 8%        | Cat2     | Yellow|
| 5               | 8% – 10%       | Cat1     | Orange|
| 6               | 10% – 12%      | HC       | Red   |
| 7               | ≥ 12%          | HC+      | Dark red |

## On-watch display

### `t.html` — Climb screen

- Current gradient (`/Zapp/{zapp_index}/Output/gradient`)
- Current VAM (`/Zapp/{zapp_index}/Output/vam`)
- Max gradient (`/Zapp/{zapp_index}/Output/maxgradient`)
- Total ascent (`/Zapp/{zapp_index}/Output/totalAscent`)
- Category label and color gauge
- Toggled by the lower button via the `onEvent` callback

### `t2.html` — Profile screen

- Climb duration from `Fusion/Altitude/AscentTime`
- Average gradient from `/Zapp/{zapp_index}/Output/avgGradient`
- Remaining route ascent from `Navigation/Routes/NavigatedRoute/RemainAscent` when available
- Screen toggle via the upper button

> Note: `t2.html` contains an altitude-profile graph block that is currently commented out.

## Summary outputs

The app exposes summary values for the exercise report:

- `Avg VAM` — `output.vam`
- `Avg gradient` — `output.avgGradient`
- `Max gradient` — `output.maxgradient`

## Project structure

- `manifest.json` — app metadata, input/output declarations, and template registration.
- `main.js` — main app logic, state initialization, telemetry processing, category classification, and UI selection.
- `t.html` — climb dashboard UI template.
- `t2.html` — profile UI template.

## License

GPL-2.0 — see [LICENSE](LICENSE).
