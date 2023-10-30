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

class SnailBait {
  private canvas: HTMLCanvasElement = document.getElementById(
    "game-canvas"
  ) as HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  // Constants............................................................
  private readonly LEFT = 1;
  private readonly RIGHT = 2;
  private readonly TRANSPARENT = 0;
  private readonly OPAQUE = 1.0;
  private readonly BACKGROUND_VELOCITY = 42;
  private readonly PLATFORM_HEIGHT = 8;
  private readonly PLATFORM_STROKE_WIDTH = 2;
  private readonly PLATFORM_STROKE_STYLE = "rgb(0,0,0)"; // black
  private readonly RUNNER_LEFT = 50;
  private readonly STARTING_RUNNER_TRACK: PlatformTrack = 1;

  // Track baselines...................................................
  private TRACK_1_BASELINE = 323;
  private TRACK_2_BASELINE = 223;
  private TRACK_3_BASELINE = 123;

  // Platform scrolling offset (and therefore speed) is
  // PLATFORM_VELOCITY_MULTIPLIER * backgroundOffset: The
  // platforms move PLATFORM_VELOCITY_MULTIPLIER times as
  // fast as the background.
  private PLATFORM_VELOCITY_MULTIPLIER = 4.35;
  private STARTING_BACKGROUND_VELOCITY = 0;
  private STARTING_PLATFORM_OFFSET = 0;
  private STARTING_BACKGROUND_OFFSET = 0;

  // States............................................................
  private paused = false;
  private pauseStartTime = 0;
  private readonly PAUSED_CHECK_INTERVAL = 200;
  private windowHasFocus = true;
  private countdownInProgress = false;

  // Images............................................................
  private background = new Image();
  private runnerImage = new Image();

  // Time..............................................................
  private lastAnimationFrameTime = 0;
  private lastFpsUpdateTime = 0;
  private fps = 60;

  // Fps indicator.....................................................
  private fpsElement: HTMLCanvasElement = document.getElementById(
    "fps"
  ) as HTMLCanvasElement;

  // Toast.............................................................
  private toastElement: HTMLCanvasElement = document.getElementById(
    "toast"
  ) as HTMLCanvasElement;

  // Runner track......................................................
  private runnerTrack: PlatformTrack;

  // Translation offsets...............................................
  private backgroundOffset: number;
  private platformOffset: number;

  // Velocities........................................................
  private bgVelocity: number;
  private platformVelocity: number = 0;

  // Platforms.........................................................
  private platformData: PlatformObject[];

  constructor() {
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.runnerTrack = this.STARTING_RUNNER_TRACK;
    this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET;
    this.platformOffset = this.STARTING_PLATFORM_OFFSET;
    this.bgVelocity = this.STARTING_BACKGROUND_VELOCITY;
    this.platformData = [
      // One screen for now
      // Screen 1.......................................................
      {
        left: 10,
        width: 230,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(150,190,255)",
        opacity: 1.0,
        track: 1,
        pulsate: false,
      },

      {
        left: 250,
        width: 100,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(150,190,255)",
        opacity: 1.0,
        track: 2,
        pulsate: false,
      },

      {
        left: 400,
        width: 125,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(250,0,0)",
        opacity: 1.0,
        track: 3,
        pulsate: false,
      },

      {
        left: 633,
        width: 100,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(80,140,230)",
        opacity: 1.0,
        track: 1,
        pulsate: false,
      },
      // Screen 2.......................................................

      {
        left: 810,
        width: 100,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(200,200,0)",
        opacity: 1.0,
        track: 2,
        pulsate: false,
      },

      {
        left: 1025,
        width: 100,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(80,140,230)",
        opacity: 1.0,
        track: 2,
        pulsate: false,
      },

      {
        left: 1200,
        width: 125,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "aqua",
        opacity: 1.0,
        track: 3,
        pulsate: false,
      },

      {
        left: 1400,
        width: 180,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(80,140,230)",
        opacity: 1.0,
        track: 1,
        pulsate: false,
      },

      // Screen 3.......................................................

      {
        left: 1625,
        width: 100,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(200,200,0)",
        opacity: 1.0,
        track: 2,
        pulsate: false,
      },

      {
        left: 1800,
        width: 250,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(80,140,230)",
        opacity: 1.0,
        track: 1,
        pulsate: false,
      },

      {
        left: 2000,
        width: 100,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "rgb(200,200,80)",
        opacity: 1.0,
        track: 2,
        pulsate: false,
      },

      {
        left: 2100,
        width: 100,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "aqua",
        opacity: 1.0,
        track: 3,
      },

      // Screen 4.......................................................

      {
        left: 2269,
        width: 200,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "gold",
        opacity: 1.0,
        track: 1,
      },

      {
        left: 2500,
        width: 200,
        height: this.PLATFORM_HEIGHT,
        fillStyle: "#2b950a",
        opacity: 1.0,
        track: 2,
        snail: true,
      },
    ];
  }
  // Drawing..............................................................

  private draw = (now: number) => {
    this.setPlatformVelocity();
    this.setOffsets(now);

    this.drawBackground();
    this.drawRunner();
    this.drawPlatforms();
  };

  private setPlatformVelocity = () => {
    this.platformVelocity = this.bgVelocity * this.PLATFORM_VELOCITY_MULTIPLIER;
  };

  private setOffsets = (now: number) => {
    this.setBackgroundOffset(now);
    this.setPlatformOffset(now);
  };

  private setBackgroundOffset = (now: number) => {
    this.backgroundOffset +=
      (this.bgVelocity * (now - this.lastAnimationFrameTime)) / 1000;

    if (
      this.backgroundOffset < 0 ||
      this.backgroundOffset > this.background.width
    ) {
      this.backgroundOffset = 0;
    }
  };

  private setPlatformOffset = (now: number) => {
    this.platformOffset +=
      (this.platformVelocity * (now - this.lastAnimationFrameTime)) / 1000;

    if (this.platformOffset > 2 * this.background.width) {
      this.turnLeft();
    } else if (this.platformOffset < 0) {
      this.turnRight();
    }
  };

  private drawBackground = () => {
    this.context.translate(-this.backgroundOffset, 0);

    // Initially onscreen:
    this.context.drawImage(this.background, 0, 0);

    // Initially offscreen:
    this.context.drawImage(this.background, this.background.width, 0);

    this.context.translate(this.backgroundOffset, 0);
  };

  private drawRunner = () => {
    this.context.drawImage(
      this.runnerImage,
      this.RUNNER_LEFT,
      this.calculatePlatformTop(this.runnerTrack) - this.runnerImage.height
    );
  };

  private drawPlatform = (data: PlatformObject) => {
    let platformTop = this.calculatePlatformTop(data.track);

    this.context.lineWidth = this.PLATFORM_STROKE_WIDTH;
    this.context.strokeStyle = this.PLATFORM_STROKE_STYLE;
    this.context.fillStyle = data.fillStyle;
    this.context.globalAlpha = data.opacity;

    this.context.strokeRect(data.left, platformTop, data.width, data.height);
    this.context.fillRect(data.left, platformTop, data.width, data.height);
  };

  private drawPlatforms = () => {
    let index;

    this.context.translate(-this.platformOffset, 0);

    for (index = 0; index < this.platformData.length; ++index) {
      this.drawPlatform(this.platformData[index]);
    }

    this.context.translate(this.platformOffset, 0);
  };

  private calculateFps = (now: number) => {
    let fps = (1 / (now - this.lastAnimationFrameTime)) * 1000;

    if (now - this.lastFpsUpdateTime > 1000) {
      this.lastFpsUpdateTime = now;
      this.fpsElement.innerHTML = fps.toFixed(0) + " fps";
    }
    return fps;
  };

  private calculatePlatformTop = (track: PlatformTrack) => {
    if (track === 1) {
      return this.TRACK_1_BASELINE;
    } // 323 pixels
    else if (track === 2) {
      return this.TRACK_2_BASELINE;
    } // 223 pixels
    else if (track === 3) {
      return this.TRACK_3_BASELINE;
    } // 123 pixels
    return 23; // "hypothetical track 4"
  };

  private turnLeft = () => {
    this.bgVelocity = -this.BACKGROUND_VELOCITY;
  };

  private turnRight = () => {
    this.bgVelocity = this.BACKGROUND_VELOCITY;
  };

  private revealToast = (text: string, duration: number) => {
    const DEFAULT_TOAST_DISPLAY_DURATION = 1000;

    duration = duration || DEFAULT_TOAST_DISPLAY_DURATION;

    this.toastElement.style.display = "block";
    this.toastElement.innerHTML = text;

    setTimeout(this.hideToast, duration);
  };
  private hideToast = () => {
    if (this.windowHasFocus) {
      this.toastElement.style.display = "none";
    }
  };

  // Animation............................................................
  private animate = (now: number) => {
    if (this.paused) {
      const self = this;
      setTimeout(function () {
        window.requestAnimationFrame(self.animate);
      }, self.PAUSED_CHECK_INTERVAL);
    } else {
      this.fps = this.calculateFps(now);
      this.draw(now);
      this.lastAnimationFrameTime = now;
      window.requestAnimationFrame(this.animate);
    }
  };

  private togglePaused = () => {
    let now = +new Date();

    this.paused = !this.paused;

    if (this.paused) {
      this.pauseStartTime = now;
    } else {
      this.lastAnimationFrameTime += now - this.pauseStartTime;
    }
  };

  // ------------------------- INITIALIZATION ----------------------------

  public initializeImages = () => {
    this.background.src = "images/background.png";
    this.runnerImage.src = "images/runner.png";

    this.background.onload = this.startGame;
  };

  private onKeyDownEvent = (e: KeyboardEvent) => {
    //var key = e.keyCode;
    if (e.code === "KeyD" || e.code === "ArrowLeft") {
      // (key === 68 || key === 37) {
      // 'd' or left arrow
      this.turnLeft();
    } else if (e.code === "KeyK" || e.code === "ArrowRight") {
      // (key === 75 || key === 39) {
      // 'k' or right arrow
      this.turnRight();
    } else if (e.code === "KeyP") {
      // (key === 80) {
      // 'p'
      this.togglePaused();
    }
  };

  private onWindowBlurEvent = (e: FocusEvent) => {
    this.windowHasFocus = false;

    if (!this.paused) {
      this.togglePaused();
    }
  };

  private onWindowFocusEvent = (e: FocusEvent) => {
    const DIGIT_DISPLAY_DURATION = 1000; // milliseconds

    this.windowHasFocus = true;
    this.countdownInProgress = true;

    if (this.paused) {
      this.toastElement.style.font = "128px fantasy"; // Large font

      if (this.windowHasFocus && this.countdownInProgress)
        this.revealToast("3", 1000); // Display 3 for 1.0 seconds

      setTimeout(this.onCountdownToggle2, DIGIT_DISPLAY_DURATION);
    }
  };

  private onCountdownToggle2 = () => {
    const DIGIT_DISPLAY_DURATION = 1000; // milliseconds
    if (this.windowHasFocus && this.countdownInProgress)
      this.revealToast("2", 1000); // Display 2 for 1.0 seconds

    setTimeout(this.onCountdownToggle1, DIGIT_DISPLAY_DURATION);
  };
  private onCountdownToggle1 = () => {
    const DIGIT_DISPLAY_DURATION = 1000; // milliseconds
    if (this.windowHasFocus && this.countdownInProgress)
      this.revealToast("1", 1000); // Display 1 for 1.0 seconds

    setTimeout(this.onCountdownToggleFinish, DIGIT_DISPLAY_DURATION);
  };
  private onCountdownToggleFinish = () => {
    let originalFont = this.toastElement.style.fontSize;
    if (this.windowHasFocus && this.countdownInProgress) this.togglePaused();

    if (this.windowHasFocus && this.countdownInProgress)
      this.toastElement.style.fontSize = originalFont;

    this.countdownInProgress = false;
  };

  private startGame = () => {
    window.requestAnimationFrame(this.animate);
    window.addEventListener("keydown", this.onKeyDownEvent);

    window.addEventListener("blur", this.onWindowBlurEvent);

    window.addEventListener("focus", this.onWindowFocusEvent);
  };

  // Event handlers.......................................................
}

// Launch game.........................................................
const snailBait = new SnailBait();
snailBait.initializeImages();
