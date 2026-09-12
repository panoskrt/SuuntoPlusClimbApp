# Velo Climb

A SuuntoPlus feature app for cycling that displays live climbing metrics, an animated climb-category gauge, live heart rate, and adds climb statistics to the workout summary.

## Current features

- Smoothed live gradient based on vertical speed and ground speed.
- Rolling 30-second VAM (vertical ascent rate).
- Maximum smoothed gradient for the current session.
- Total ascent from Suunto altitude data.
- Running average gradient from valid moving samples.
- Eight climb categories from Descent through HC+.
- An animated 8-segment corona gauge with a needle pointing at the current climb category.
- Live heart rate reading on the climb screen.
- Two watch screens that can be switched with the watch buttons.
- Workout summary outputs for VAM, average gradient, and maximum gradient.

## Telemetry inputs

The app declares three subscribed inputs in `manifest.json`:

| Input | Source | Usage |
|-------|--------|-------|
| `speed` | `Activity/Current/Speed` | Ground speed for gradient calculation |
| `vSpeed` | `Fusion/Altitude/VerticalSpeed` | Vertical speed for gradient calculation |
| `ascent` | `Fusion/Altitude/Ascent` | Total ascent and rolling VAM |

The templates also read these platform resources directly:

- `Fusion/Altitude/AscentTime` for climb duration.
- `Navigation/Routes/NavigatedRoute/RemainAscent` for remaining route ascent.
- `Activity/Move/-1/Heartrate/Current` for the live heart rate reading on the climb screen.

## Calculations

### Gradient

When ground speed is greater than `0.3 m/s`, the instantaneous gradient is calculated as:

```text
gradient = (vertical speed / ground speed) * 100
```

The raw value is limited to `-60%` through `+60%`, then smoothed with an exponential moving average using `alpha = 0.2`. When the speed threshold is not met, the previous smoothed value is retained.

The app tracks the maximum smoothed gradient and calculates average gradient as the mean of smoothed-gradient samples collected while the speed threshold is met. State is initialized when the app loads and is held for the current app session.

### VAM

`evaluate()` is expected to run approximately once per second. The app stores up to 31 ascent samples and calculates the current ascent rate from the oldest and newest values in that rolling window:

```text
VAM = (latest ascent - oldest ascent) / elapsed sample intervals
```

The output uses Suunto's `VerticalSpeedMountain_Fourdigits` format. Despite the summary label `Avg VAM`, the value is the current rolling-window VAM rather than a whole-session average.

## Climb categories

Categories are based on the smoothed gradient, including a dedicated category for descents.

| Output value | Gradient | Label | Color |
|--------------|----------|-------|-------|
| `0` | `< 0%` | Descent | Blue |
| `1` | `0%` to `< 2%` | Flat | Gray |
| `2` | `2%` to `< 5%` | Cat4 | Green |
| `3` | `5%` to `< 7%` | Cat3 | Blue |
| `4` | `7%` to `< 8%` | Cat2 | Yellow |
| `5` | `8%` to `< 10%` | Cat1 | Orange |
| `6` | `10%` to `< 12%` | HC | Red |
| `7` | `>= 12%` | HC+ | Dark red |

On the climb screen, the current category also drives an animated corona gauge: an 8-segment ring drawn on a full-screen canvas, with a needle pointing at the active segment and the active segment highlighted in its category color. The gauge redraws whenever the category output changes.

## Watch screens

### `t.html` - Climb screen

Displays:

- Current gradient, formatted as a percentage.
- Current rolling VAM.
- Live heart rate.
- Maximum gradient.
- Total ascent.
- Current category label with its category color, plus the animated corona gauge and needle described above.
- Separate large-display and small/medium-display layouts.

Pressing the watch's lower/down button sends an app event and switches to `t2.html`.

### `t2.html` - Profile screen

Displays:

- Climb duration from `Fusion/Altitude/AscentTime`.
- Average gradient for the current app session.
- Remaining route ascent when navigation data is available.
- Separate large-display and small/medium-display layouts.

Pressing the watch's upper/up button sends an app event and switches back to `t.html`.

The altitude-profile graph markup is present in the file but currently commented out, so no graph is rendered.

## Workout summary

`main.js` exposes these summary outputs:

| ID | Name | Format | Value |
|----|------|--------|-------|
| `vam` | Avg VAM | `VerticalSpeedMountain_Fourdigits` | Rolling VAM output |
| `gradient` | Avg gradient | `Percentage_Fourdigits` | Running average gradient |
| `maxGradient` | Max gradient | `Percentage_Fourdigits` | Maximum smoothed gradient |

## Project structure

- `manifest.json` - App metadata, declared telemetry inputs and outputs, registered templates, and workout usage.
- `main.js` - State initialization, gradient and VAM calculations, category classification, screen switching, and summary outputs.
- `t.html` - Climb screen template, including the corona gauge canvas drawing logic.
- `t2.html` - Profile screen template.
- `cyclin01-l.fea`, `cyclin01-m.fea`, `cyclin01-n.fea`, `cyclin01-o.fea`, `cyclin01-q.fea`, `cyclin01-s.fea` - Compiled ZIP-based Suunto resources for the supported device/display variants (gitignored build output, not checked in).
- `LICENSE` - GPL-2.0 license text.

There is currently no package manager configuration, build script, automated test suite, or simulator configuration in this repository.

## App metadata

- **Name:** Velo Climb
- **Version:** 1.0
- **Type:** SuuntoPlus feature app
- **Usage:** Workout
- **Author:** Panagiotis Kritikakos

## License

GPL-2.0 - see [LICENSE](LICENSE).
