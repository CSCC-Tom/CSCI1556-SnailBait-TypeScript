type PlatformTrack = 1 | 2 | 3;
interface PlatformObject {
  left: number;
  width: number;
  height: number;
  fillStyle: string;
  opacity: number;
  track: PlatformTrack;
  pulsate?: boolean;
  snail?: boolean;
}

var canvas: HTMLCanvasElement = document.getElementById(
    "game-canvas"
  ) as HTMLCanvasElement,
  context: CanvasRenderingContext2D = canvas.getContext(
    "2d"
  ) as CanvasRenderingContext2D,
  fpsElement: HTMLCanvasElement = document.getElementById(
    "fps"
  ) as HTMLCanvasElement,
  // Constants............................................................
  LEFT = 1,
  RIGHT = 2,
  BACKGROUND_VELOCITY = 25,
  PLATFORM_HEIGHT = 8,
  PLATFORM_STROKE_WIDTH = 2,
  PLATFORM_STROKE_STYLE = "rgb(0,0,0)", // black
  RUNNER_LEFT = 50,
  STARTING_RUNNER_TRACK: PlatformTrack = 1,
  // Track baselines...................................................

  TRACK_1_BASELINE = 323,
  TRACK_2_BASELINE = 223,
  TRACK_3_BASELINE = 123,
  // Platform scrolling offset (and therefore speed) is
  // PLATFORM_VELOCITY_MULTIPLIER * backgroundOffset: The
  // platforms move PLATFORM_VELOCITY_MULTIPLIER times as
  // fast as the background.

  PLATFORM_VELOCITY_MULTIPLIER = 4.35,
  STARTING_BACKGROUND_VELOCITY = 0,
  STARTING_PLATFORM_OFFSET = 0,
  STARTING_BACKGROUND_OFFSET = 0,
  // Images............................................................

  background = new Image(),
  runnerImage = new Image(),
  // Time..............................................................

  lastAnimationFrameTime = 0,
  lastFpsUpdateTime = 0,
  fps = 60,
  // Fps indicator.....................................................

  fpsElement: HTMLCanvasElement = document.getElementById(
    "fps"
  ) as HTMLCanvasElement,
  // Runner track......................................................

  runnerTrack = STARTING_RUNNER_TRACK,
  // Translation offsets...............................................

  backgroundOffset = STARTING_BACKGROUND_OFFSET,
  platformOffset = STARTING_PLATFORM_OFFSET,
  // Velocities........................................................

  bgVelocity = STARTING_BACKGROUND_VELOCITY,
  platformVelocity: number,
  // Platforms.........................................................

  platformData: PlatformObject[] = [
    // One screen for now
    // Screen 1.......................................................
    {
      left: 10,
      width: 230,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(150,190,255)",
      opacity: 1.0,
      track: 1,
      pulsate: false,
    },

    {
      left: 250,
      width: 100,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(150,190,255)",
      opacity: 1.0,
      track: 2,
      pulsate: false,
    },

    {
      left: 400,
      width: 125,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(250,0,0)",
      opacity: 1.0,
      track: 3,
      pulsate: false,
    },

    {
      left: 633,
      width: 100,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(80,140,230)",
      opacity: 1.0,
      track: 1,
      pulsate: false,
    },
    // Screen 2.......................................................

    {
      left: 810,
      width: 100,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(200,200,0)",
      opacity: 1.0,
      track: 2,
      pulsate: false,
    },

    {
      left: 1025,
      width: 100,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(80,140,230)",
      opacity: 1.0,
      track: 2,
      pulsate: false,
    },

    {
      left: 1200,
      width: 125,
      height: PLATFORM_HEIGHT,
      fillStyle: "aqua",
      opacity: 1.0,
      track: 3,
      pulsate: false,
    },

    {
      left: 1400,
      width: 180,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(80,140,230)",
      opacity: 1.0,
      track: 1,
      pulsate: false,
    },

    // Screen 3.......................................................

    {
      left: 1625,
      width: 100,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(200,200,0)",
      opacity: 1.0,
      track: 2,
      pulsate: false,
    },

    {
      left: 1800,
      width: 250,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(80,140,230)",
      opacity: 1.0,
      track: 1,
      pulsate: false,
    },

    {
      left: 2000,
      width: 100,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(200,200,80)",
      opacity: 1.0,
      track: 2,
      pulsate: false,
    },

    {
      left: 2100,
      width: 100,
      height: PLATFORM_HEIGHT,
      fillStyle: "aqua",
      opacity: 1.0,
      track: 3,
    },

    // Screen 4.......................................................

    {
      left: 2269,
      width: 200,
      height: PLATFORM_HEIGHT,
      fillStyle: "gold",
      opacity: 1.0,
      track: 1,
    },

    {
      left: 2500,
      width: 200,
      height: PLATFORM_HEIGHT,
      fillStyle: "#2b950a",
      opacity: 1.0,
      track: 2,
      snail: true,
    },
  ];
// Drawing..............................................................

function draw(now: number) {
  setPlatformVelocity();
  setOffsets(now);

  drawBackground();

  drawRunner();
  drawPlatforms();
}

function setPlatformVelocity() {
  platformVelocity = bgVelocity * PLATFORM_VELOCITY_MULTIPLIER;
}

function setOffsets(now: number) {
  setBackgroundOffset(now);
  setPlatformOffset(now);
}

function setBackgroundOffset(now: number) {
  backgroundOffset += (bgVelocity * (now - lastAnimationFrameTime)) / 1000;

  if (backgroundOffset < 0 || backgroundOffset > background.width) {
    backgroundOffset = 0;
  }
}

function setPlatformOffset(now: number) {
  platformOffset += (platformVelocity * (now - lastAnimationFrameTime)) / 1000;

  if (platformOffset > 2 * background.width) {
    turnLeft();
  } else if (platformOffset < 0) {
    turnRight();
  }
}

function drawBackground() {
  context.translate(-backgroundOffset, 0);

  // Initially onscreen:
  context.drawImage(background, 0, 0);

  // Initially offscreen:
  context.drawImage(background, background.width, 0);

  context.translate(backgroundOffset, 0);
}

function drawRunner() {
  context.drawImage(
    runnerImage,
    RUNNER_LEFT,
    calculatePlatformTop(runnerTrack) - runnerImage.height
  );
}

function drawPlatform(data: PlatformObject) {
  var platformTop = calculatePlatformTop(data.track);

  context.lineWidth = PLATFORM_STROKE_WIDTH;
  context.strokeStyle = PLATFORM_STROKE_STYLE;
  context.fillStyle = data.fillStyle;
  context.globalAlpha = data.opacity;

  context.strokeRect(data.left, platformTop, data.width, data.height);
  context.fillRect(data.left, platformTop, data.width, data.height);
}

function drawPlatforms() {
  var index;

  context.translate(-platformOffset, 0);

  for (index = 0; index < platformData.length; ++index) {
    drawPlatform(platformData[index]);
  }

  context.translate(platformOffset, 0);
}

function calculateFps(now: number) {
  var fps = (1 / (now - lastAnimationFrameTime)) * 1000;

  if (now - lastFpsUpdateTime > 1000) {
    lastFpsUpdateTime = now;
    fpsElement.innerHTML = fps.toFixed(0) + " fps";
  }
  return fps;
}

function calculatePlatformTop(track: PlatformTrack) {
  if (track === 1) {
    return TRACK_1_BASELINE;
  } // 323 pixels
  else if (track === 2) {
    return TRACK_2_BASELINE;
  } // 223 pixels
  else if (track === 3) {
    return TRACK_3_BASELINE;
  } // 123 pixels
  return 23; // "hypothetical track 4"
}

function turnLeft() {
  bgVelocity = -BACKGROUND_VELOCITY;
}

function turnRight() {
  bgVelocity = BACKGROUND_VELOCITY;
}

// Animation............................................................

function animate(now: number) {
  fps = calculateFps(now);
  draw(now);
  lastAnimationFrameTime = now;
  window.requestAnimationFrame(animate);
}

// ------------------------- INITIALIZATION ----------------------------

function initializeImages() {
  background.src = "images/background.png";
  runnerImage.src = "images/runner.png";

  background.onload = function (e) {
    startGame();
  };
}

function startGame() {
  window.requestAnimationFrame(animate);
}

// Launch game.........................................................

initializeImages();

setTimeout(function (e: unknown) {
  turnRight();
}, 1000);
