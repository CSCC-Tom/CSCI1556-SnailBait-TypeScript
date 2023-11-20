import { PlatformTrack } from "./sprites/platform";

// Constants............................................................
export const SHORT_DELAY = 50; // milliseconds
export const TRANSPARENT = "0";
export const OPAQUE = "1.0";
export const BACKGROUND_VELOCITY = 42;
export const RUN_ANIMATION_RATE = 30;
export const PLATFORM_HEIGHT = 8;
export const PLATFORM_STROKE_WIDTH = 2;
export const PLATFORM_STROKE_STYLE = "rgb(0,0,0)"; // black
export const RUNNER_EXPLOSION_DURATION = 500;
export const BAD_GUYS_EXPLOSION_DURATION = 1500;

export const RUNNER_LEFT = 50;
export const STARTING_RUNNER_TRACK: PlatformTrack = 1;

// Background width and height.........................................

export const BACKGROUND_WIDTH = 1102;
export const BACKGROUND_HEIGHT = 400;

// Lives.............................................................

export const MAX_NUMBER_OF_LIVES = 3;

// Velocities........................................................

export const BUTTON_PACE_VELOCITY = 80;
export const SNAIL_PACE_VELOCITY = 50;

// Pixels and meters.................................................

export const CANVAS_WIDTH_IN_METERS = 13; // Proportional to sprite sizes

// I don't really like this use of 'static global setting' but it's ok
export let PIXELS_PER_METER = 0;
export function SetPixelsPerMeter(canvasWidth: number) {
  PIXELS_PER_METER = canvasWidth / CANVAS_WIDTH_IN_METERS;
}

// Gravity...........................................................

export const GRAVITY_FORCE = 9.81; // m/s/s
