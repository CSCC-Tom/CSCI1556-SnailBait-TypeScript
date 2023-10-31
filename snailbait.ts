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
  private readonly SHORT_DELAY = 50; // milliseconds
  private readonly TRANSPARENT = "0";
  private readonly OPAQUE = "1.0";
  private readonly BACKGROUND_VELOCITY = 42;
  private readonly PLATFORM_HEIGHT = 8;
  private readonly PLATFORM_STROKE_WIDTH = 2;
  private readonly PLATFORM_STROKE_STYLE = "rgb(0,0,0)"; // black
  private readonly RUNNER_LEFT = 50;
  private readonly STARTING_RUNNER_TRACK: PlatformTrack = 1;

  // Loading screen....................................................

  private loadingElement: HTMLCanvasElement = document.getElementById(
    "loading"
  ) as HTMLCanvasElement;
  private loadingTitleElement: HTMLCanvasElement = document.getElementById(
    "loading-title"
  ) as HTMLCanvasElement;
  private runnerAnimatedGIFElement: HTMLImageElement = document.getElementById(
    "loading-animated-gif"
  ) as HTMLImageElement;

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
  private gameStarted = false;
  // Images............................................................
  private background = new Image();
  private runnerImage = new Image();

  // Time..............................................................
  private lastAnimationFrameTime = 0;
  private lastFpsUpdateTime = 0;
  private fps = 60;
  // Fps...............................................................
  private fpsElement: HTMLCanvasElement = document.getElementById(
    "fps"
  ) as HTMLCanvasElement;

  // Toast.............................................................
  private toastElement: HTMLCanvasElement = document.getElementById(
    "toast"
  ) as HTMLCanvasElement;

  // Instructions......................................................

  private instructionsElement: HTMLCanvasElement = document.getElementById(
    "instructions"
  ) as HTMLCanvasElement;

  // Copyright.........................................................

  private copyrightElement: HTMLCanvasElement = document.getElementById(
    "copyright"
  ) as HTMLCanvasElement;

  // Score.............................................................

  private scoreElement: HTMLCanvasElement = document.getElementById(
    "score"
  ) as HTMLCanvasElement;

  // Sound and music...................................................

  private soundAndMusicElement: HTMLCanvasElement = document.getElementById(
    "sound-and-music"
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
  private waitABit = async (msToWait: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, msToWait));
  };
  private fadeInElements = async (
    fadeDuration: number,
    args: (HTMLCanvasElement | HTMLImageElement)[]
  ): Promise<void> => {
    let timeElapsed = 0.0;
    while (timeElapsed < fadeDuration) {
      for (let i = 0; i < args.length; i++) {
        args[i].style.display = "block";
        args[i].style.opacity = `${timeElapsed / fadeDuration}`;
      }
      await this.waitABit(100);
      timeElapsed += 100;
    }
    for (let i = 0; i < args.length; i++) {
      args[i].style.opacity = this.OPAQUE;
    }
  };
  private fadeOutElements = async (
    fadeDuration: number,
    args: (HTMLCanvasElement | HTMLImageElement)[]
  ): Promise<void> => {
    // FORMER LOGIC const fadeDuration = args[args.length - 1]; // Last argument
    let timeElapsed = 0.0;
    while (timeElapsed < fadeDuration) {
      for (let i = 0; i < args.length; i++) {
        args[i].style.opacity = `${1.0 - timeElapsed / fadeDuration}`;
      }
      await this.waitABit(100);
      timeElapsed += 100;
    }
    for (let i = 0; i < args.length; i++) {
      args[i].style.display = "none";
      args[i].style.opacity = this.TRANSPARENT;
    }
  };
  private hideToast = () => {
    const TOAST_TRANSITION_DURATION = 450;
    this.fadeOutElements(TOAST_TRANSITION_DURATION, [this.toastElement]);
  };
  private startToastTransition = (text: string, duration: number) => {
    this.toastElement.innerHTML = text;
    this.fadeInElements(duration, [this.toastElement]);
  };
  private revealToast = (text: string, duration: number) => {
    const DEFAULT_TOAST_DISPLAY_DURATION = 1000;

    duration = duration || DEFAULT_TOAST_DISPLAY_DURATION;

    this.startToastTransition(text, duration);
    setTimeout(this.hideToast, duration);
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
  private backgroundLoaded = () => {
    const LOADING_SCREEN_TRANSITION_DURATION = 2000;

    this.fadeOutElements(LOADING_SCREEN_TRANSITION_DURATION, [
      this.loadingElement,
    ]);

    setTimeout(function () {
      snailBait.startGame();
      snailBait.gameStarted = true;
    }, LOADING_SCREEN_TRANSITION_DURATION);
  };
  private loadingAnimationLoaded = () => {
    this.fadeInElements(this.SHORT_DELAY, [
      this.runnerAnimatedGIFElement,
      this.loadingTitleElement,
    ]);
  };
  public initializeImages = () => {
    this.background.src = "images/background.png";
    this.runnerImage.src = "images/runner.png";
    this.runnerAnimatedGIFElement.src = "images/snail.gif";

    this.background.onload = this.backgroundLoaded;
    this.runnerAnimatedGIFElement.onload = this.loadingAnimationLoaded;
  };

  private dimControls = () => {
    const FINAL_OPACITY = "0.5";

    snailBait.instructionsElement.style.opacity = FINAL_OPACITY;
    snailBait.soundAndMusicElement.style.opacity = FINAL_OPACITY;
  };
  private revealCanvas = () => {
    this.fadeInElements(this.SHORT_DELAY, [this.canvas]);
  };
  private revealTopChrome = () => {
    this.fadeInElements(this.SHORT_DELAY, [this.fpsElement, this.scoreElement]);
  };
  private revealTopChromeDimmed = () => {
    const DIM = "0.25";

    this.scoreElement.style.display = "block";
    this.fpsElement.style.display = "block";

    setTimeout(function () {
      snailBait.scoreElement.style.opacity = DIM;
      snailBait.fpsElement.style.opacity = DIM;
    }, this.SHORT_DELAY);
  };
  private revealBottomChrome = () => {
    this.fadeInElements(this.SHORT_DELAY, [
      this.soundAndMusicElement,
      this.instructionsElement,
      this.copyrightElement,
    ]);
  };
  private finishRevealingGame = () => {
    this.dimControls();
    this.revealTopChrome();
  };
  private revealGame = () => {
    const DIM_CONTROLS_DELAY = 5000;

    this.revealTopChromeDimmed();
    this.revealCanvas();
    this.revealBottomChrome();

    setTimeout(this.finishRevealingGame, DIM_CONTROLS_DELAY);
  };
  private finishRevealingInitialToast = () => {
    const INITIAL_TOAST_DURATION = 3000;
    this.revealToast(
      "Collide with coins and jewels. " + "Avoid bats and bees.",
      INITIAL_TOAST_DURATION
    );
  };
  private revealInitialToast = () => {
    const INITIAL_TOAST_DELAY = 1500;
    setTimeout(this.finishRevealingInitialToast, INITIAL_TOAST_DELAY);
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
    this.windowHasFocus = true;
    this.countdownInProgress = true;

    if (this.paused) {
      this.countdownToastSequence();
    }
  };
  private countdownToastSequence = async (): Promise<void> => {
    const DIGIT_DISPLAY_DURATION = 1000; // milliseconds
    const originalFont = this.toastElement.style.fontSize;
    this.toastElement.style.font = "128px fantasy"; // Large font

    if (this.windowHasFocus && this.countdownInProgress)
      this.revealToast("3", 500); // Display 3 for 0.5 seconds

    await this.waitABit(DIGIT_DISPLAY_DURATION);

    if (this.windowHasFocus && this.countdownInProgress)
      this.revealToast("2", 500); // Display 2 for 0.5 seconds

    await this.waitABit(DIGIT_DISPLAY_DURATION);

    if (this.windowHasFocus && this.countdownInProgress)
      this.revealToast("1", 500); // Display 1 for 0.5 seconds

    await this.waitABit(DIGIT_DISPLAY_DURATION);

    if (this.windowHasFocus && this.countdownInProgress) {
      this.togglePaused();
      this.toastElement.style.fontSize = originalFont;
      this.hideToast();
      this.countdownInProgress = false;
    }
  };

  private startGame = () => {
    window.addEventListener("keydown", this.onKeyDownEvent);
    window.addEventListener("blur", this.onWindowBlurEvent);
    window.addEventListener("focus", this.onWindowFocusEvent);
    this.revealGame();
    this.revealInitialToast();
    window.requestAnimationFrame(this.animate);
  };

  // Event handlers.......................................................
}

// Launch game.........................................................
const snailBait = new SnailBait();

snailBait.initializeImages();
