// Below this ground speed the vertical/horizontal ratio is dominated by GPS
// and barometer noise, so we freeze the gradient instead of letting it spike.
var MIN_SPEED = 0.3; // m/s

// EMA smoothing factor for the gradient: low enough to ride out barometer
// noise, high enough to still react within a few seconds of a slope change.
var GRADIENT_ALPHA = 0.2;

// Climb category thresholds, in percent gradient. Values fixed to match the comments
var CLIMB_FLAT = 2;  // < 2%: flat - gray
var CLIMB_CAT4 = 5;  // < 5%: very easy - green
var CLIMB_CAT3 = 7;  // < 7%: easy - blue
var CLIMB_CAT2 = 8;  // < 8%: moderate - yellow
var CLIMB_CAT1 = 10; // < 10%: hard - orange
var CLIMB_HC = 12;   // < 12%: very hard - red
                    // >= 12%: HC+, very very hard - dark red

var UPDATE_INTERVAL_SECONDS = 2;

var smoothedGradient;
var updateCounter;
var maxgradient;

function onLoad(input, output) {
  smoothedGradient = 0;
  updateCounter = 0;
  maxgradient = 0;
  output.gradient = 0;
  output.vam = 0;
  output.category = 0;
  output.maxgradient = 0;
  output.totalAscent = 0;
}

// System starts calling this about once per second after the sports app is selected
// i.e. before the exercise is actually started.
function evaluate(input, output) {
  var hasRealTelemetry = typeof input.speed === 'number' && typeof input.vSpeed === 'number' && input.speed > MIN_SPEED;

  if (hasRealTelemetry) {
    // Instantaneous climbing gradient (%) = rise/run = vertical speed / ground speed.
    // Guard against unresolved inputs (e.g. a resource the simulator doesn't feed):
    // dividing by/using a non-number here would poison the EMA with NaN forever.
    var rawGradient = (input.vSpeed / input.speed) * 100;
    if (rawGradient > 60) rawGradient = 60;
    if (rawGradient < -60) rawGradient = -60;
    smoothedGradient = smoothedGradient + GRADIENT_ALPHA * (rawGradient - smoothedGradient);
  }
  if (smoothedGradient > maxgradient) {
    maxgradient = smoothedGradient;
  }

  updateCounter += 1;
  if (updateCounter >= UPDATE_INTERVAL_SECONDS) {
    updateCounter = 0;
    output.gradient = smoothedGradient;
    output.maxgradient = maxgradient;
    output.totalAscent = input.ascent;

    // VAM (Vertical Ascent Meters per hour), averaged over the time actually
    // spent ascending rather than the whole move, so flats/descents don't dilute it.
    // Kept in m/s here; the template converts to m/h via VerticalSpeedMountain.
    output.vam = input.ascentTime > 5 ? (input.ascent / input.ascentTime) : 0;

    // Classify the current (smoothed) gradient into a climb category. Category
    // numbers must match the keyValue map in t.html: 0=Flat (easiest) .. 6=HC+ (hardest).
    if (smoothedGradient < CLIMB_FLAT) {
      output.category = 0; // Flat
    } else if (smoothedGradient < CLIMB_CAT4) {
      output.category = 1; // Cat4 - very easy
    } else if (smoothedGradient < CLIMB_CAT3) {
      output.category = 2; // Cat3 - easy
    } else if (smoothedGradient < CLIMB_CAT2) {
      output.category = 3; // Cat2 - moderate
    } else if (smoothedGradient < CLIMB_CAT1) {
      output.category = 4; // Cat1 - hard
    } else if (smoothedGradient < CLIMB_HC) {
      output.category = 5; // HC - very hard
    } else {
      output.category = 6; // HC+ - hardest
    }
  }
}

/* Other available callbacks:
function onExerciseStart() {}    // Is evaluated on exercise start
function onExercisePause() {}    // Is evaluated on exercise pause
function onExerciseContinue() {} // Is evaluated when continuing exercise after pause
function onLap() {}              // Is evaluated on every lap change
function onAutoLap() {}          // Is evaluated on every autolap change
function onInterval() {}         // Is evaluated on interval
function onPoolLength() {}       // Is evaluated after each pool length (swimming)
*/

// Is evaluated when a user enters the SuuntoPlus sports app screen the first
// time and when the screen is reloaded. Essentially defines what is shown on
// the screen by returning the wanted HTML template.
function getUserInterface() {
  return {
    template: 't'
  };
}

// Defines the info shown at the bottom of the exercise summary info shown after the exercise.
// These values are also provided to SuuntoApp.
// This is called when exercise ends and also when user backs from exercise start panel
// without starting the exercise.
function getSummaryOutputs(input, output) {
  return [
    {
      id: 'vam',
      name: 'Avg VAM',
      format: 'VerticalSpeedMountain_Fourdigits',
      value: output.vam
    },
    {
      id: 'gradient',
      name: 'Avg gradient',
      format: 'Percentage_Fourdigits',
      value: output.gradient
    },
    {
      id: 'maxGradient',
      name: 'Max gradient',
      format: 'Percentage_Fourdigits',
      value: output.maxgradient
    }
  ];
}
