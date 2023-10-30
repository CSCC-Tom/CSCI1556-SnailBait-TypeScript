type PlatformTrack = 1 | 2 | 3;
interface PlatformObject {
  left: number;
  width: number;
  height: number;
  fillStyle: string;
  opacity: number;
  track: PlatformTrack;
  pulsate: boolean;
}

var canvas: HTMLCanvasElement = document.getElementById(
    "game-canvas"
  ) as HTMLCanvasElement,
  context: CanvasRenderingContext2D = canvas.getContext(
    "2d"
  ) as CanvasRenderingContext2D,
  // Constants............................................................

  PLATFORM_HEIGHT = 8,
  PLATFORM_STROKE_WIDTH = 2,
  PLATFORM_STROKE_STYLE = "rgb(0,0,0)", // black
  RUNNER_LEFT = 50,
  STARTING_RUNNER_TRACK: PlatformTrack = 1,
  // Track baselines...................................................

  TRACK_1_BASELINE = 323,
  TRACK_2_BASELINE = 223,
  TRACK_3_BASELINE = 123,
  // Images............................................................

  background = new Image(),
  runnerImage = new Image(),
  // Platforms.........................................................

  platformData: PlatformObject[] = [
    // One screen for now
    // Screen 1.......................................................
    {
      left: 10,
      width: 230,
      height: PLATFORM_HEIGHT,
      fillStyle: "rgb(250,250,0)",
      opacity: 0.5,
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
      fillStyle: "rgb(250,250,0)",
      opacity: 1.0,
      track: 1,
      pulsate: false,
    },
  ];

// Launch game.........................................................

initializeImages();

function initializeImages() {
  background.src = "images/background.png";
  runnerImage.src = "images/runner.png";

  background.onload = function (e) {
    startGame();
  };
}

function startGame() {
  draw();
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawRunner();
}

function drawBackground() {
  context.drawImage(background, 0, 0);
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

  for (index = 0; index < platformData.length; ++index) {
    drawPlatform(platformData[index]);
  }
}

function calculatePlatformTop(track: PlatformTrack): number {
  if (track === 1) {
    return TRACK_1_BASELINE;
  } // 323 pixels
  else if (track === 2) {
    return TRACK_2_BASELINE;
  } // 223 pixels
  else if (track === 3) {
    return TRACK_3_BASELINE;
  } // 123 pixels
  return 23; // Hypothetical 'track 4'
}

function drawRunner() {
  context.drawImage(
    runnerImage,
    RUNNER_LEFT,
    calculatePlatformTop(STARTING_RUNNER_TRACK) - runnerImage.height
  );
}
