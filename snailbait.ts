import { AnimationTimer } from "./lib/animationTimer";
import { BounceBehavior } from "./lib/behaviors/bounce";
import { CellSwitchBehavior } from "./lib/behaviors/cellSwitch";
import { CollideBehavior } from "./lib/behaviors/collide";
import { CycleBehavior } from "./lib/behaviors/cycle";
import { FallBehavior } from "./lib/behaviors/fall";
import { JumpBehavior } from "./lib/behaviors/jump";
import { PaceBehavior } from "./lib/behaviors/pace";
import { PulseBehavior } from "./lib/behaviors/pulse";
import { RunBehavior } from "./lib/behaviors/run";
import { SnailBombMoveBehavior } from "./lib/behaviors/snailbombmove";
import { SnailShootBehavior } from "./lib/behaviors/snailshoot";
import {
  PLATFORM_HEIGHT,
  BUTTON_PACE_VELOCITY,
  SNAIL_PACE_VELOCITY,
  BACKGROUND_WIDTH,
  BACKGROUND_HEIGHT,
  PLATFORM_STROKE_WIDTH,
  PLATFORM_STROKE_STYLE,
  BACKGROUND_VELOCITY,
  RUN_ANIMATION_RATE,
  OPAQUE,
  TRANSPARENT,
  SHORT_DELAY,
  MAX_NUMBER_OF_LIVES,
  RUNNER_EXPLOSION_DURATION,
  BAD_GUYS_EXPLOSION_DURATION,
  SetPixelsPerMeter,
} from "./lib/constants";
import { ObjectCoordinates, IBehavior, WaitABit } from "./lib/definitions";
import { Sprite, SpriteSheetArtist, SpritesheetCell } from "./lib/sprites";
import {
  PlatformArtist,
  PlatformObject,
  PlatformSprite,
  PlatformChild,
  PlatformTrack,
  platformUnderneath,
} from "./lib/sprites/platform";
import { SnailSprite } from "./lib/sprites/snail";
import { SnailBombSprite } from "./lib/sprites/snailbomb";
import { TimeSystem } from "./lib/timeSystem";

class SnailBait {
  private canvas: HTMLCanvasElement = document.getElementById(
    "game-canvas"
  ) as HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  // Time..............................................................
  private static playing = false;
  private static timeSystem = new TimeSystem(); // See js/timeSystem.js
  private timeFactor = 1.0; // 1.0 is normal speed, 0.5 is 1/2 speed, etc.
  private readonly TIME_RATE_DURING_TRANSITIONS = 0.2; // percent
  private readonly NORMAL_TIME_RATE = 1.0;

  private RUNNER_LEFT = 50;
  private STARTING_RUNNER_TRACK: PlatformTrack = 1;

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
  private static TRACK_1_BASELINE = 323;
  private static TRACK_2_BASELINE = 223;
  private static TRACK_3_BASELINE = 123;

  // Platform scrolling offset (and therefore speed) is
  // PLATFORM_VELOCITY_MULTIPLIER * backgroundOffset: The
  // platforms move PLATFORM_VELOCITY_MULTIPLIER times as
  // fast as the background.
  private PLATFORM_VELOCITY_MULTIPLIER = 4.35;
  private STARTING_BACKGROUND_VELOCITY = 0;
  private STARTING_PLATFORM_OFFSET = 0;
  private STARTING_BACKGROUND_OFFSET = 0;
  private STARTING_SPRITE_OFFSET = 0;
  // States............................................................
  private paused = false;
  private pauseStartTime = 0;
  private readonly PAUSED_CHECK_INTERVAL = 200;
  private windowHasFocus = true;
  private countdownInProgress = false;
  private gameStarted = false;
  // Images............................................................
  private spritesheet = new Image();

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
  private runnerTrack: PlatformTrack = 1;

  // Translation offsets...............................................
  private backgroundOffset: number;
  private spriteOffset: number;
  private platformOffset: number;

  // Lives.............................................................

  private lives = MAX_NUMBER_OF_LIVES;

  // Velocities........................................................
  private static bgVelocity: number;
  private platformVelocity: number = 0;

  // Sprite sheet cells................................................

  private RUNNER_CELLS_WIDTH = 50; // pixels
  private RUNNER_CELLS_HEIGHT = 54;

  private BAT_CELLS_HEIGHT = 34; // Bat cell width varies; not constant

  private BEE_CELLS_HEIGHT = 50;
  private BEE_CELLS_WIDTH = 50;

  private BUTTON_CELLS_HEIGHT = 20;
  private BUTTON_CELLS_WIDTH = 31;

  private COIN_CELLS_HEIGHT = 30;
  private COIN_CELLS_WIDTH = 30;

  private EXPLOSION_CELLS_HEIGHT = 62;

  private RUBY_CELLS_HEIGHT = 30;
  private RUBY_CELLS_WIDTH = 35;

  private SAPPHIRE_CELLS_HEIGHT = 30;
  private SAPPHIRE_CELLS_WIDTH = 35;

  private SNAIL_BOMB_CELLS_HEIGHT = 20;
  private SNAIL_BOMB_CELLS_WIDTH = 20;

  private SNAIL_CELLS_HEIGHT = 34;
  private SNAIL_CELLS_WIDTH = 64;

  private batCells: SpritesheetCell[];

  private batRedEyeCells: SpritesheetCell[];

  private beeCells: SpritesheetCell[];

  private blueCoinCells: SpritesheetCell[];

  private explosionCells: SpritesheetCell[];

  // Sprite sheet cells................................................

  private blueButtonCells: SpritesheetCell[];

  private goldCoinCells: SpritesheetCell[];

  private goldButtonCells: SpritesheetCell[];

  private rubyCells: SpritesheetCell[];

  private runnerCellsRight: SpritesheetCell[];

  private runnerCellsLeft: SpritesheetCell[];

  private sapphireCells: SpritesheetCell[];

  private snailBombCells: SpritesheetCell[] = [
    { left: 40, top: 512, width: 30, height: 20 },
    { left: 2, top: 512, width: 30, height: 20 },
  ];

  private snailCells: SpritesheetCell[];

  // Sprite data.......................................................

  private batData: ObjectCoordinates[];

  private beeData: ObjectCoordinates[];

  private buttonData: PlatformChild[];

  private coinData: ObjectCoordinates[];

  // Platforms.........................................................
  private platformData: PlatformObject[];

  private sapphireData: ObjectCoordinates[];

  private rubyData: ObjectCoordinates[];

  private smokingHoleData: ObjectCoordinates[];

  private snailData: PlatformChild[];

  // Sprites...........................................................
  private runner?: Sprite;
  private bats: Sprite[] = [];
  private bees: Sprite[] = [];
  private buttons: Sprite[] = [];
  private coins: Sprite[] = [];
  private platforms: PlatformSprite[] = [];
  private rubies: Sprite[] = [];
  private sapphires: Sprite[] = [];
  private snails: SnailSprite[] = [];

  private sprites: Sprite[] = []; // For convenience, contains all of the sprites
  // from the preceding arrays

  // Special Behaviors .............................
  private snailShootBehavior: SnailShootBehavior;
  private snailBombMoveBehavior: SnailBombMoveBehavior;
  private runBehavior: RunBehavior;
  private paceBehavior: PaceBehavior;
  private jumpBehavior: JumpBehavior;
  private fallBehavior: FallBehavior;
  private collideBehavior: CollideBehavior;
  private runnerExplodeBehavior: CellSwitchBehavior;
  private badGuyExplodeBehavior: CellSwitchBehavior;

  private platformArtist: PlatformArtist;

  constructor() {
    SetPixelsPerMeter(this.canvas.width);
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET;
    this.platformOffset = this.STARTING_PLATFORM_OFFSET;
    this.spriteOffset = this.STARTING_SPRITE_OFFSET;
    SnailBait.bgVelocity = this.STARTING_BACKGROUND_VELOCITY;
    this.platformData = [
      // One screen for now
      // Screen 1.......................................................
      {
        left: 10,
        width: 210,
        height: PLATFORM_HEIGHT,
        fillStyle: "rgb(200,200,60)",
        opacity: 1.0,
        track: 1,
        pulsate: false,
      },
      {
        left: 240,
        width: 110,
        height: PLATFORM_HEIGHT,
        fillStyle: "rgb(110,150,255)",
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
        left: 623,
        width: 250,
        height: PLATFORM_HEIGHT,
        fillStyle: "rgb(255,255,0)",
        opacity: 0.8,
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
        width: 150,
        height: PLATFORM_HEIGHT,
        fillStyle: "rgb(80,140,230)",
        opacity: 1.0,
        track: 2,
        pulsate: false,
      },
      {
        left: 1200,
        width: 105,
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
        fillStyle: "aqua",
        opacity: 1.0,
        track: 1,
        pulsate: false,
      },
      // Screen 3.......................................................
      {
        left: 1625,
        width: 100,
        height: PLATFORM_HEIGHT,
        fillStyle: "cornflowerblue",
        opacity: 1.0,
        track: 2,
        pulsate: false,
      },
      {
        left: 1800,
        width: 250,
        height: PLATFORM_HEIGHT,
        fillStyle: "gold",
        opacity: 1.0,
        track: 1,
        pulsate: false,
      },
      {
        left: 2000,
        width: 200,
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
        pulsate: false,
      },

      // Screen 4.......................................................
      {
        left: 2269,
        width: 200,
        height: PLATFORM_HEIGHT,
        fillStyle: "gold",
        opacity: 1.0,
        track: 1,
        pulsate: true,
      },
      {
        left: 2500,
        width: 200,
        height: PLATFORM_HEIGHT,
        fillStyle: "#2b950a",
        opacity: 1.0,
        track: 2,
        pulsate: true,
      },
    ];
    this.batCells = [
      { left: 3, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },
      { left: 41, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT },
      { left: 93, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },
      { left: 132, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT },
    ];
    this.batRedEyeCells = [
      { left: 185, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },

      { left: 222, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT },

      { left: 273, top: 0, width: 36, height: this.BAT_CELLS_HEIGHT },

      { left: 313, top: 0, width: 46, height: this.BAT_CELLS_HEIGHT },
    ];
    this.beeCells = [
      {
        left: 5,
        top: 234,
        width: this.BEE_CELLS_WIDTH,
        height: this.BEE_CELLS_HEIGHT,
      },
      {
        left: 75,
        top: 234,
        width: this.BEE_CELLS_WIDTH,
        height: this.BEE_CELLS_HEIGHT,
      },
      {
        left: 145,
        top: 234,
        width: this.BEE_CELLS_WIDTH,
        height: this.BEE_CELLS_HEIGHT,
      },
    ];
    this.blueCoinCells = [
      {
        left: 5,
        top: 540,
        width: this.COIN_CELLS_WIDTH,
        height: this.COIN_CELLS_HEIGHT,
      },
      {
        left: 5 + this.COIN_CELLS_WIDTH,
        top: 540,
        width: this.COIN_CELLS_WIDTH,
        height: this.COIN_CELLS_HEIGHT,
      },
    ];
    this.explosionCells = [
      { left: 3, top: 48, width: 52, height: this.EXPLOSION_CELLS_HEIGHT },
      { left: 63, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
      { left: 146, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
      { left: 233, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
      { left: 308, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
      { left: 392, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
      { left: 473, top: 48, width: 70, height: this.EXPLOSION_CELLS_HEIGHT },
    ];
    this.blueButtonCells = [
      {
        left: 10,
        top: 192,
        width: this.BUTTON_CELLS_WIDTH,
        height: this.BUTTON_CELLS_HEIGHT,
      },

      {
        left: 53,
        top: 192,
        width: this.BUTTON_CELLS_WIDTH,
        height: this.BUTTON_CELLS_HEIGHT,
      },
    ];
    this.goldCoinCells = [
      {
        left: 65,
        top: 540,
        width: this.COIN_CELLS_WIDTH,
        height: this.COIN_CELLS_HEIGHT,
      },
      {
        left: 96,
        top: 540,
        width: this.COIN_CELLS_WIDTH,
        height: this.COIN_CELLS_HEIGHT,
      },
      {
        left: 128,
        top: 540,
        width: this.COIN_CELLS_WIDTH,
        height: this.COIN_CELLS_HEIGHT,
      },
    ];
    this.goldButtonCells = [
      {
        left: 90,
        top: 190,
        width: this.BUTTON_CELLS_WIDTH,
        height: this.BUTTON_CELLS_HEIGHT,
      },
      {
        left: 132,
        top: 190,
        width: this.BUTTON_CELLS_WIDTH,
        height: this.BUTTON_CELLS_HEIGHT,
      },
    ];
    this.sapphireCells = [
      {
        left: 3,
        top: 138,
        width: this.RUBY_CELLS_WIDTH,
        height: this.RUBY_CELLS_HEIGHT,
      },
      {
        left: 39,
        top: 138,
        width: this.RUBY_CELLS_WIDTH,
        height: this.RUBY_CELLS_HEIGHT,
      },
      {
        left: 76,
        top: 138,
        width: this.RUBY_CELLS_WIDTH,
        height: this.RUBY_CELLS_HEIGHT,
      },
      {
        left: 112,
        top: 138,
        width: this.RUBY_CELLS_WIDTH,
        height: this.RUBY_CELLS_HEIGHT,
      },
      {
        left: 148,
        top: 138,
        width: this.RUBY_CELLS_WIDTH,
        height: this.RUBY_CELLS_HEIGHT,
      },
    ];
    this.runnerCellsRight = [
      { left: 414, top: 385, width: 47, height: this.RUNNER_CELLS_HEIGHT },
      { left: 362, top: 385, width: 44, height: this.RUNNER_CELLS_HEIGHT },
      { left: 314, top: 385, width: 39, height: this.RUNNER_CELLS_HEIGHT },
      { left: 265, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT },
      { left: 205, top: 385, width: 49, height: this.RUNNER_CELLS_HEIGHT },
      { left: 150, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT },
      { left: 96, top: 385, width: 46, height: this.RUNNER_CELLS_HEIGHT },
      { left: 45, top: 385, width: 35, height: this.RUNNER_CELLS_HEIGHT },
      { left: 0, top: 385, width: 35, height: this.RUNNER_CELLS_HEIGHT },
    ];
    this.runnerCellsLeft = [
      { left: 0, top: 305, width: 47, height: this.RUNNER_CELLS_HEIGHT },
      { left: 55, top: 305, width: 44, height: this.RUNNER_CELLS_HEIGHT },
      { left: 107, top: 305, width: 39, height: this.RUNNER_CELLS_HEIGHT },
      { left: 152, top: 305, width: 46, height: this.RUNNER_CELLS_HEIGHT },
      { left: 208, top: 305, width: 49, height: this.RUNNER_CELLS_HEIGHT },
      { left: 265, top: 305, width: 46, height: this.RUNNER_CELLS_HEIGHT },
      { left: 320, top: 305, width: 42, height: this.RUNNER_CELLS_HEIGHT },
      { left: 380, top: 305, width: 35, height: this.RUNNER_CELLS_HEIGHT },
      { left: 425, top: 305, width: 35, height: this.RUNNER_CELLS_HEIGHT },
    ];
    this.rubyCells = [
      {
        left: 185,
        top: 138,
        width: this.SAPPHIRE_CELLS_WIDTH,
        height: this.SAPPHIRE_CELLS_HEIGHT,
      },

      {
        left: 220,
        top: 138,
        width: this.SAPPHIRE_CELLS_WIDTH,
        height: this.SAPPHIRE_CELLS_HEIGHT,
      },

      {
        left: 258,
        top: 138,
        width: this.SAPPHIRE_CELLS_WIDTH,
        height: this.SAPPHIRE_CELLS_HEIGHT,
      },

      {
        left: 294,
        top: 138,
        width: this.SAPPHIRE_CELLS_WIDTH,
        height: this.SAPPHIRE_CELLS_HEIGHT,
      },

      {
        left: 331,
        top: 138,
        width: this.SAPPHIRE_CELLS_WIDTH,
        height: this.SAPPHIRE_CELLS_HEIGHT,
      },
    ];
    this.snailCells = [
      {
        left: 142,
        top: 466,
        width: this.SNAIL_CELLS_WIDTH,
        height: this.SNAIL_CELLS_HEIGHT,
      },

      {
        left: 75,
        top: 466,
        width: this.SNAIL_CELLS_WIDTH,
        height: this.SNAIL_CELLS_HEIGHT,
      },

      {
        left: 2,
        top: 466,
        width: this.SNAIL_CELLS_WIDTH,
        height: this.SNAIL_CELLS_HEIGHT,
      },
    ];

    const track1baseline = SnailBait.TRACK_1_BASELINE,
      track2baseline = SnailBait.TRACK_2_BASELINE,
      track3baseline = SnailBait.TRACK_3_BASELINE;
    this.batData = [
      { left: 95, top: track2baseline - 1.5 * this.BAT_CELLS_HEIGHT },
      { left: 614, top: track3baseline },
      { left: 904, top: track3baseline - 3 * this.BAT_CELLS_HEIGHT },
      { left: 1150, top: track2baseline - 3 * this.BAT_CELLS_HEIGHT },
      { left: 1720, top: track2baseline - 2 * this.BAT_CELLS_HEIGHT },
      { left: 1960, top: track3baseline - this.BAT_CELLS_HEIGHT },
      { left: 2200, top: track3baseline - this.BAT_CELLS_HEIGHT },
      { left: 2380, top: track3baseline - 2 * this.BAT_CELLS_HEIGHT },
    ];
    this.beeData = [
      { left: 200, top: track1baseline - this.BEE_CELLS_HEIGHT * 1.5 },
      { left: 350, top: track2baseline - this.BEE_CELLS_HEIGHT * 1.5 },
      { left: 540, top: track1baseline - this.BEE_CELLS_HEIGHT },
      { left: 750, top: track1baseline - this.BEE_CELLS_HEIGHT * 1.5 },
      { left: 924, top: track2baseline - this.BEE_CELLS_HEIGHT * 1.75 },
      { left: 1500, top: 225 },
      { left: 1600, top: 115 },
      { left: 2225, top: 125 },
      { left: 2295, top: 275 },
      { left: 2450, top: 275 },
    ];
    this.buttonData = [{ platformIndex: 7 }, { platformIndex: 12 }];
    this.coinData = [
      { left: 270, top: track2baseline - this.COIN_CELLS_HEIGHT },
      { left: 489, top: track3baseline - this.COIN_CELLS_HEIGHT },
      { left: 620, top: track1baseline - this.COIN_CELLS_HEIGHT },
      { left: 833, top: track2baseline - this.COIN_CELLS_HEIGHT },
      { left: 1050, top: track2baseline - this.COIN_CELLS_HEIGHT },
      { left: 1450, top: track1baseline - this.COIN_CELLS_HEIGHT },
      { left: 1670, top: track2baseline - this.COIN_CELLS_HEIGHT },
      { left: 1870, top: track1baseline - this.COIN_CELLS_HEIGHT },
      { left: 1930, top: track1baseline - this.COIN_CELLS_HEIGHT },
      { left: 2200, top: track2baseline - this.COIN_CELLS_HEIGHT },
      { left: 2320, top: track2baseline - this.COIN_CELLS_HEIGHT },
      { left: 2360, top: track1baseline - this.COIN_CELLS_HEIGHT },
    ];
    this.sapphireData = [
      { left: 150, top: track1baseline - this.SAPPHIRE_CELLS_HEIGHT },
      { left: 880, top: track2baseline - this.SAPPHIRE_CELLS_HEIGHT },
      { left: 1100, top: track2baseline - this.SAPPHIRE_CELLS_HEIGHT },
      { left: 1475, top: track1baseline - this.SAPPHIRE_CELLS_HEIGHT },
      { left: 2400, top: track1baseline - this.SAPPHIRE_CELLS_HEIGHT },
    ];
    this.rubyData = [
      { left: 690, top: track1baseline - this.RUBY_CELLS_HEIGHT },
      { left: 1700, top: track2baseline - this.RUBY_CELLS_HEIGHT },
      { left: 2056, top: track2baseline - this.RUBY_CELLS_HEIGHT },
    ];
    this.smokingHoleData = [
      { left: 248, top: track2baseline - 22 },
      { left: 688, top: track3baseline + 5 },
      { left: 1352, top: track2baseline - 18 },
    ];
    this.snailData = [{ platformIndex: 13 }];
    // Sprite artists....................................................
    this.platformArtist = new PlatformArtist(SnailBait.calculatePlatformTop);
    // ------------------------Sprite behaviors-------------------------

    // Pacing on platforms...............................................

    this.runBehavior = new RunBehavior();

    // Pacing on platforms...............................................

    this.paceBehavior = new PaceBehavior();

    // Snail shoot behavior..............................................

    this.snailShootBehavior = new SnailShootBehavior(this.isSpriteInView);

    // Move the snail bomb...............................................

    this.snailBombMoveBehavior = new SnailBombMoveBehavior();

    this.jumpBehavior = new JumpBehavior(this.platforms);
    this.fallBehavior = new FallBehavior(
      this.canvas.height,
      SnailBait.calculatePlatformTop,
      SnailBait.putSpriteOnTrack,
      platformUnderneath,
      this.loseLife,
      this.platforms
    );
    this.collideBehavior = new CollideBehavior(
      SnailBait.timeSystem,
      SnailBait.calculatePlatformTop,
      this.getAllSprites,
      this.loseLife
    );

    // Runner explosions.................................................

    this.runnerExplodeBehavior = new CellSwitchBehavior(
      this.explosionCells,

      function (sprite: Sprite) {
        // Trigger
        return sprite.exploding ? sprite.exploding : false;
      },

      function (sprite) {
        // Callback
        sprite.exploding = false;
      },
      RUNNER_EXPLOSION_DURATION
    );

    // Bad guy explosions................................................

    this.badGuyExplodeBehavior = new CellSwitchBehavior(
      this.explosionCells,

      function (sprite: Sprite) {
        // Trigger
        return sprite.exploding ? sprite.exploding : false;
      },

      function (sprite: Sprite) {
        // Callback
        sprite.exploding = false;
      },
      BAD_GUYS_EXPLOSION_DURATION
    );
  }

  public createSprites = () => {
    this.createPlatformSprites();

    this.createBatSprites();
    this.createBeeSprites();
    this.createButtonSprites();
    this.createCoinSprites();
    this.createRunnerSprite();
    this.createRubySprites();
    this.createSapphireSprites();
    this.createSnailSprites();

    this.initializeSprites();

    // All sprites are also stored in a single array

    this.addSpritesToSpriteArray();
  };

  private readonly getAllSprites = () => {
    return this.sprites;
  };

  private addSpritesToSpriteArray = () => {
    for (let i = 0; i < this.platforms.length; ++i) {
      this.sprites.push(this.platforms[i]);
    }

    for (let i = 0; i < this.bats.length; ++i) {
      this.sprites.push(this.bats[i]);
    }

    for (let i = 0; i < this.bees.length; ++i) {
      this.sprites.push(this.bees[i]);
    }

    for (let i = 0; i < this.buttons.length; ++i) {
      this.sprites.push(this.buttons[i]);
    }

    for (let i = 0; i < this.coins.length; ++i) {
      this.sprites.push(this.coins[i]);
    }

    for (let i = 0; i < this.rubies.length; ++i) {
      this.sprites.push(this.rubies[i]);
    }

    for (let i = 0; i < this.sapphires.length; ++i) {
      this.sprites.push(this.sapphires[i]);
    }

    for (let i = 0; i < this.snails.length; ++i) {
      this.sprites.push(this.snails[i]);
    }
    if (this.runner !== undefined) {
      this.sprites.push(this.runner);
    }
  };
  private positionSprites = (
    sprites: Sprite[],
    spriteData: (PlatformChild | ObjectCoordinates)[]
  ) => {
    for (let i = 0; i < sprites.length; ++i) {
      const sprite = sprites[i];
      const data = spriteData[i];

      if ("platformIndex" in data) {
        this.putSpriteOnPlatform(sprite, this.platforms[data.platformIndex]);
      } else {
        sprite.top = data.top;
        sprite.left = data.left;
      }
    }
  };

  private equipRunnerForJumping = () => {
    if (this.runner === undefined) {
      console.warn(
        `equipRunnerForJumping called but this.runner was undefined!`
      );

      return;
    }
    const INITIAL_TRACK = 1,
      RUNNER_JUMP_HEIGHT = 120,
      RUNNER_JUMP_DURATION = 1000;

    this.runner.JUMP_HEIGHT = RUNNER_JUMP_HEIGHT;
    this.runner.JUMP_DURATION = RUNNER_JUMP_DURATION;

    this.runner.jumping = false;
    this.runner.track = INITIAL_TRACK;

    this.runner.ascendTimer = new AnimationTimer(
      this.runner.JUMP_DURATION / 2,
      AnimationTimer.makeEaseOutEasingFunction(1.1)
    );
    this.runner.descendTimer = new AnimationTimer(
      this.runner.JUMP_DURATION / 2,
      AnimationTimer.makeEaseInEasingFunction(1.1)
    );

    this.runner.jump = function () {
      if (this.jumping)
        // 'this' is the runner
        return;

      this.jumping = true;
      this.runAnimationRate = 0; // Freeze the runner while jumping
      this.verticalLaunchPosition = this.top;
      if (this.ascendTimer === undefined) {
        console.warn(
          `runner jump function called but there was no defined ascend timer!`
        );
        return;
      }
      this.ascendTimer.start(SnailBait.timeSystem.calculateGameTime());
    };

    this.runner.stopJumping = function () {
      this.jumping = false;
      if (this.ascendTimer === undefined) {
        console.warn(
          `runner stopJumping function called but there was no defined ascend timer!`
        );
      } else {
        this.ascendTimer.stop();
      }
      if (this.descendTimer === undefined) {
        console.warn(
          `runner stopJumping function called but there was no defined descend timer!`
        );
      } else {
        this.descendTimer.stop();
      }
      this.runAnimationRate = RUN_ANIMATION_RATE;
      this.jumping = false;
    };
    this.runner.fall = function () {
      // For now...
      this.track = 1;
      this.top = SnailBait.calculatePlatformTop(this.track) - this.height;
    };
  };

  private equipRunnerForFalling = () => {
    if (this.runner === undefined) {
      console.warn(
        `equipRunnerForFalling called but this.runner was undefined!`
      );
      return;
    }

    this.runner.fallTimer = new AnimationTimer();

    this.runner.fall = function (initialVelocity) {
      this.falling = true;
      this.velocityY = initialVelocity || 0;
      this.initialVelocityY = initialVelocity || 0;
      this.fallTimer?.start(SnailBait.timeSystem.calculateGameTime());
    };

    this.runner.stopFalling = function () {
      this.falling = false;
      this.velocityY = 0;
      this.fallTimer?.stop(SnailBait.timeSystem.calculateGameTime());
    };
  };

  private equipRunner = () => {
    this.equipRunnerForJumping();
    this.equipRunnerForFalling();
  };

  private setTimeRate = (rate: number) => {
    this.timeFactor = rate;

    SnailBait.timeSystem.setTransducer(function (percent) {
      return percent * snailBait.timeFactor;
    });
  };

  private initializeSprites = () => {
    this.positionSprites(this.bats, this.batData);
    this.positionSprites(this.bees, this.beeData);
    this.positionSprites(this.buttons, this.buttonData);
    this.positionSprites(this.coins, this.coinData);
    this.positionSprites(this.rubies, this.rubyData);
    this.positionSprites(this.sapphires, this.sapphireData);
    this.positionSprites(this.snails, this.snailData);
    this.armSnails();
    this.equipRunner();
  };

  private createBatSprites = () => {
    const BAT_FLAP_DURATION = 200;
    //BAT_FLAP_INTERVAL = 50;
    for (let i = 0; i < this.batData.length; ++i) {
      const bat = new Sprite(
        "bat",
        new SpriteSheetArtist(this.spritesheet, this.batCells),
        [new CycleBehavior(BAT_FLAP_DURATION)]
      );

      // bat cell width leties; batCells[1] is widest

      bat.width = this.batCells[1].width;
      bat.height = this.BAT_CELLS_HEIGHT;
      bat.collisionMargin = {
        left: 6,
        top: 11,
        right: 4,
        bottom: 8,
      };
      this.bats.push(bat);
    }
  };
  private createBeeSprites = () => {
    const BEE_FLAP_DURATION = 200;
    // BEE_FLAP_INTERVAL = 50;
    for (let i = 0; i < this.beeData.length; ++i) {
      const bee = new Sprite(
        "bee",
        new SpriteSheetArtist(this.spritesheet, this.beeCells),
        [new CycleBehavior(BEE_FLAP_DURATION)]
      );

      bee.width = this.BEE_CELLS_WIDTH;
      bee.height = this.BEE_CELLS_HEIGHT;
      bee.collisionMargin = {
        left: 10,
        top: 10,
        right: 0,
        bottom: 10,
      };
      this.bees.push(bee);
    }
  };

  private createButtonSprites = () => {
    for (let i = 0; i < this.buttonData.length; ++i) {
      let button;
      if (i !== this.buttonData.length - 1) {
        button = new Sprite(
          "button",
          new SpriteSheetArtist(this.spritesheet, this.blueButtonCells),
          [this.paceBehavior]
        );
      } else {
        button = new Sprite(
          "button",
          new SpriteSheetArtist(this.spritesheet, this.goldButtonCells),
          []
        );
      }

      button.width = this.BUTTON_CELLS_WIDTH;
      button.height = this.BUTTON_CELLS_HEIGHT;
      button.velocityX = BUTTON_PACE_VELOCITY;

      this.buttons.push(button);
    }
  };

  private createCoinSprites = () => {
    const BLUE_THROB_DURATION = 100,
      GOLD_THROB_DURATION = 500,
      BOUNCE_DURATION_BASE = 800, // milliseconds
      BOUNCE_HEIGHT_BASE = 50; // pixels
    for (let i = 0; i < this.coinData.length; ++i) {
      let coin;
      if (i % 2 === 0) {
        coin = new Sprite(
          "coin",
          new SpriteSheetArtist(this.spritesheet, this.goldCoinCells),
          [
            new BounceBehavior(
              BOUNCE_DURATION_BASE + BOUNCE_DURATION_BASE * Math.random(),

              BOUNCE_HEIGHT_BASE + BOUNCE_HEIGHT_BASE * Math.random()
            ),

            new CycleBehavior(GOLD_THROB_DURATION),
          ]
        );
      } else {
        coin = new Sprite(
          "coin",
          new SpriteSheetArtist(this.spritesheet, this.blueCoinCells),
          [
            new BounceBehavior(
              BOUNCE_DURATION_BASE + BOUNCE_DURATION_BASE * Math.random(),

              BOUNCE_HEIGHT_BASE + BOUNCE_HEIGHT_BASE * Math.random()
            ),

            new CycleBehavior(BLUE_THROB_DURATION),
          ]
        );
      }

      coin.width = this.COIN_CELLS_WIDTH;
      coin.height = this.COIN_CELLS_HEIGHT;
      coin.value = 50;
      coin.collisionMargin = {
        left: coin.width / 8,
        top: coin.height / 8,
        right: coin.width / 8,
        bottom: coin.height / 4,
      };
      this.coins.push(coin);
    }
  };

  private createPlatformSprites = () => {
    let sprite, pd; // Sprite, Platform data
    const PULSE_DURATION = 800,
      PULSE_OPACITY_THRESHOLD = 0.1;

    for (let i = 0; i < this.platformData.length; ++i) {
      pd = this.platformData[i];

      sprite = new PlatformSprite(this.spritesheet, this.platformArtist, pd);

      sprite.left = pd.left;
      sprite.width = pd.width;
      sprite.height = pd.height;
      sprite.fillStyle = pd.fillStyle;
      sprite.opacity = pd.opacity;
      sprite.track = pd.track;
      sprite.button = pd.button;
      sprite.pulsate = pd.pulsate;

      sprite.top = SnailBait.calculatePlatformTop(pd.track);
      if (sprite.pulsate) {
        sprite.behaviors = [
          new PulseBehavior(PULSE_DURATION, PULSE_OPACITY_THRESHOLD),
        ];
      }
      this.platforms.push(sprite);
    }
  };

  private createRubySprites = () => {
    const RUBY_SPARKLE_DURATION = 100,
      RUBY_BOUNCE_DURATION_BASE = 1000, // milliseconds
      RUBY_BOUNCE_HEIGHT_BASE = 100; // pixels
    const rubyArtist = new SpriteSheetArtist(this.spritesheet, this.rubyCells);

    for (let i = 0; i < this.rubyData.length; ++i) {
      const ruby = new Sprite("ruby", rubyArtist, [
        new CycleBehavior(RUBY_SPARKLE_DURATION),

        new BounceBehavior(
          RUBY_BOUNCE_DURATION_BASE + RUBY_BOUNCE_DURATION_BASE * Math.random(),

          RUBY_BOUNCE_HEIGHT_BASE + RUBY_BOUNCE_HEIGHT_BASE * Math.random()
        ),
      ]);

      ruby.width = this.RUBY_CELLS_WIDTH;
      ruby.height = this.RUBY_CELLS_HEIGHT;
      ruby.value = 200;
      ruby.collisionMargin = {
        left: ruby.width / 5,
        top: ruby.height / 8,
        right: 0,
        bottom: ruby.height / 4,
      };
      this.rubies.push(ruby);
    }
  };

  private createRunnerSprite = () => {
    const RUNNER_LEFT = 50,
      RUNNER_HEIGHT = 55,
      STARTING_RUNNER_TRACK: PlatformTrack = 1,
      STARTING_RUN_ANIMATION_RATE = 0;

    this.runner = new Sprite(
      "runner",
      new SpriteSheetArtist(this.spritesheet, this.runnerCellsRight),
      [
        this.runBehavior,
        this.jumpBehavior,
        this.collideBehavior,
        this.runnerExplodeBehavior,
        this.fallBehavior,
      ]
    );
    this.runner.runAnimationRate = STARTING_RUN_ANIMATION_RATE;

    this.runner.track = STARTING_RUNNER_TRACK;
    this.runner.left = RUNNER_LEFT;
    this.runner.top =
      SnailBait.calculatePlatformTop(this.runner.track) - RUNNER_HEIGHT;
    this.runner.width = this.RUNNER_CELLS_WIDTH;
    this.runner.height = this.RUNNER_CELLS_HEIGHT;
    this.runner.collisionMargin = {
      left: 15,
      top: 10,
      right: 10,
      bottom: 10,
    };
    this.sprites.push(this.runner);
  };

  private createSapphireSprites = () => {
    const SAPPHIRE_SPARKLE_DURATION = 100,
      SAPPHIRE_BOUNCE_DURATION_BASE = 3000, // milliseconds
      SAPPHIRE_BOUNCE_HEIGHT_BASE = 100; // pixels
    const sapphireArtist = new SpriteSheetArtist(
      this.spritesheet,
      this.sapphireCells
    );

    for (let i = 0; i < this.sapphireData.length; ++i) {
      const sapphire = new Sprite("sapphire", sapphireArtist, [
        new CycleBehavior(SAPPHIRE_SPARKLE_DURATION),

        new BounceBehavior(
          SAPPHIRE_BOUNCE_DURATION_BASE +
            SAPPHIRE_BOUNCE_DURATION_BASE * Math.random(),

          SAPPHIRE_BOUNCE_HEIGHT_BASE +
            SAPPHIRE_BOUNCE_HEIGHT_BASE * Math.random()
        ),
      ]);

      sapphire.width = this.SAPPHIRE_CELLS_WIDTH;
      sapphire.height = this.SAPPHIRE_CELLS_HEIGHT;
      sapphire.value = 100;
      sapphire.collisionMargin = {
        left: sapphire.width / 8,
        top: sapphire.height / 8,
        right: sapphire.width / 8,
        bottom: sapphire.height / 4,
      };
      this.sapphires.push(sapphire);
    }
  };

  private createSnailSprites = () => {
    const snailArtist = new SpriteSheetArtist(
      this.spritesheet,
      this.snailCells
    );

    for (let i = 0; i < this.snailData.length; ++i) {
      const snail = new SnailSprite(snailArtist, [
        this.paceBehavior,
        this.snailShootBehavior,
        new CycleBehavior(
          300, // 300ms per image
          5000 // 5 seconds interlude
        ),
      ]);

      snail.width = this.SNAIL_CELLS_WIDTH;
      snail.height = this.SNAIL_CELLS_HEIGHT;
      snail.velocityX = SNAIL_PACE_VELOCITY;

      this.snails.push(snail);
    }
  };

  private armSnails = () => {
    let snail: SnailSprite;
    const snailBombArtist = new SpriteSheetArtist(
      this.spritesheet,
      this.snailBombCells
    );

    for (let i = 0; i < this.snails.length; ++i) {
      snail = this.snails[i];
      snail.bomb = new SnailBombSprite(snail, snailBombArtist, [
        this.snailBombMoveBehavior,
      ]);

      snail.bomb.width = snailBait.SNAIL_BOMB_CELLS_WIDTH;
      snail.bomb.height = snailBait.SNAIL_BOMB_CELLS_HEIGHT;

      snail.bomb.top = snail.top + snail.bomb.height / 2;
      snail.bomb.left = snail.left + snail.bomb.width / 2;
      snail.bomb.visible = false;

      this.sprites.push(snail.bomb);
    }
  };

  private isSpriteInView = (sprite: Sprite) => {
    return (
      sprite.left + sprite.width > sprite.hOffset &&
      sprite.left < sprite.hOffset + this.canvas.width
    );
  };

  private updateSprites = (now: number) => {
    let sprite;

    for (let i = 0; i < this.sprites.length; ++i) {
      sprite = this.sprites[i];

      if (sprite.visible && this.isSpriteInView(sprite)) {
        sprite.update(now, this.fps, this.context, this.lastAnimationFrameTime);
      }
    }
  };

  // Drawing..............................................................
  private drawSprites = () => {
    let sprite;

    for (let i = 0; i < this.sprites.length; ++i) {
      sprite = this.sprites[i];

      if (sprite.visible && this.isSpriteInView(sprite)) {
        this.context.translate(-sprite.hOffset, 0);
        sprite.draw(this.context);
        this.context.translate(sprite.hOffset, 0);
      }
    }
  };
  private draw = (now: number) => {
    this.setPlatformVelocity();
    this.setOffsets(now);

    this.drawBackground();
    this.updateSprites(now);
    this.drawSprites();
    /*
      this.drawRunner();
      this.drawPlatforms();
      */
  };

  private setPlatformVelocity = () => {
    this.platformVelocity =
      SnailBait.bgVelocity * this.PLATFORM_VELOCITY_MULTIPLIER;
  };

  private setOffsets = (now: number) => {
    this.setBackgroundOffset(now);
    this.setSpriteOffsets(now);
    //this.setPlatformOffset(now);
  };

  private setBackgroundOffset = (now: number) => {
    this.backgroundOffset +=
      (SnailBait.bgVelocity * (now - this.lastAnimationFrameTime)) / 1000;

    if (this.backgroundOffset < 0 || this.backgroundOffset > BACKGROUND_WIDTH) {
      this.backgroundOffset = 0;
    }
  };

  private setSpriteOffsets = (now: number) => {
    // In step with platforms
    this.spriteOffset +=
      (this.platformVelocity * (now - this.lastAnimationFrameTime)) / 1000;

    for (let i = 0; i < this.sprites.length; ++i) {
      const sprite = this.sprites[i];

      if ("runner" !== sprite.type) {
        sprite.hOffset = this.spriteOffset;
      }
    }
  };

  /*private setPlatformOffset = (now: number) => {
      this.platformOffset += 
      this.platformVelocity * (now - this.lastAnimationFrameTime) / 1000;

      if (this.platformOffset > 2*this.BACKGROUND_WIDTH) {
         this.turnLeft();
      }
      else if (this.platformOffset < 0) {
         this.turnRight();
      }
  };*/

  private drawBackground = () => {
    const BACKGROUND_TOP_IN_SPRITESHEET = 590;

    // Translate everything by the background offset
    this.context.translate(-this.backgroundOffset, 0);

    // 2/3 onscreen initially:
    this.context.drawImage(
      this.spritesheet,
      0,
      BACKGROUND_TOP_IN_SPRITESHEET,
      BACKGROUND_WIDTH,
      BACKGROUND_HEIGHT,
      0,
      0,
      BACKGROUND_WIDTH,
      BACKGROUND_HEIGHT
    );

    // Initially offscreen:
    this.context.drawImage(
      this.spritesheet,
      0,
      BACKGROUND_TOP_IN_SPRITESHEET,
      BACKGROUND_WIDTH,
      BACKGROUND_HEIGHT,
      BACKGROUND_WIDTH,
      0,
      BACKGROUND_WIDTH,
      BACKGROUND_HEIGHT
    );

    // Translate back to the original location
    this.context.translate(this.backgroundOffset, 0);
  };

  private drawPlatform = (data: PlatformObject) => {
    const platformTop = SnailBait.calculatePlatformTop(data.track);

    this.context.lineWidth = PLATFORM_STROKE_WIDTH;
    this.context.strokeStyle = PLATFORM_STROKE_STYLE;
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
    const fps =
      (1 / (now - this.lastAnimationFrameTime)) * 1000 * this.timeFactor;

    if (now - this.lastFpsUpdateTime > 1000) {
      this.lastFpsUpdateTime = now;
      this.fpsElement.innerHTML = fps.toFixed(0) + " fps";
    }
    return fps;
  };
  private putSpriteOnPlatform = (
    sprite: Sprite,
    platformSprite: PlatformSprite
  ) => {
    sprite.top = platformSprite.top - sprite.height;
    sprite.left = platformSprite.left;
    sprite.platform = platformSprite;
  };
  private static calculatePlatformTop = (track: PlatformTrack) => {
    if (track === 1) {
      return SnailBait.TRACK_1_BASELINE;
    } // 323 pixels
    else if (track === 2) {
      return SnailBait.TRACK_2_BASELINE;
    } // 223 pixels
    else if (track === 3) {
      return SnailBait.TRACK_3_BASELINE;
    } // 123 pixels
    return 23; // "hypothetical track 4"
  };

  private static putSpriteOnTrack = (sprite: Sprite, track: PlatformTrack) => {
    sprite.track = track;
    sprite.top = SnailBait.calculatePlatformTop(sprite.track) - sprite.height;
  };

  private turnLeft = () => {
    SnailBait.bgVelocity = -BACKGROUND_VELOCITY;
    if (this.runner === undefined) {
      return;
    }
    this.runner.runAnimationRate = RUN_ANIMATION_RATE;
    this.runner.artist.cells = this.runnerCellsLeft;
  };

  private turnRight = () => {
    SnailBait.bgVelocity = BACKGROUND_VELOCITY;
    if (this.runner === undefined) {
      return;
    }
    this.runner.runAnimationRate = RUN_ANIMATION_RATE;
    this.runner.artist.cells = this.runnerCellsRight;
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
      await WaitABit(100);
      timeElapsed += 100;
    }
    for (let i = 0; i < args.length; i++) {
      args[i].style.opacity = OPAQUE;
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
      await WaitABit(100);
      timeElapsed += 100;
    }
    for (let i = 0; i < args.length; i++) {
      args[i].style.display = "none";
      args[i].style.opacity = TRANSPARENT;
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

  // Effects..........................................................

  private static explode = (sprite: Sprite) => {
    if (!sprite.exploding) {
      if (sprite.runAnimationRate === 0) {
        sprite.runAnimationRate = RUN_ANIMATION_RATE;
      }

      sprite.exploding = true;
    }
  };

  private static shake = () => {
    const SHAKE_INTERVAL = 80, // milliseconds
      v = BACKGROUND_VELOCITY * 1.5,
      ov = SnailBait.bgVelocity; // ov means original velocity

    SnailBait.bgVelocity = -v;

    setTimeout(function () {
      SnailBait.bgVelocity = v;
      setTimeout(function () {
        SnailBait.bgVelocity = -v;
        setTimeout(function () {
          SnailBait.bgVelocity = v;
          setTimeout(function () {
            SnailBait.bgVelocity = -v;
            setTimeout(function () {
              SnailBait.bgVelocity = v;
              setTimeout(function () {
                SnailBait.bgVelocity = -v;
                setTimeout(function () {
                  SnailBait.bgVelocity = v;
                  setTimeout(function () {
                    SnailBait.bgVelocity = -v;
                    setTimeout(function () {
                      SnailBait.bgVelocity = v;
                      setTimeout(function () {
                        SnailBait.bgVelocity = -v;
                        setTimeout(function () {
                          SnailBait.bgVelocity = v;
                          setTimeout(function () {
                            SnailBait.bgVelocity = ov;
                          }, SHAKE_INTERVAL);
                        }, SHAKE_INTERVAL);
                      }, SHAKE_INTERVAL);
                    }, SHAKE_INTERVAL);
                  }, SHAKE_INTERVAL);
                }, SHAKE_INTERVAL);
              }, SHAKE_INTERVAL);
            }, SHAKE_INTERVAL);
          }, SHAKE_INTERVAL);
        }, SHAKE_INTERVAL);
      }, SHAKE_INTERVAL);
    }, SHAKE_INTERVAL);
  };

  // Animation............................................................
  private pausedReanimateCheck = async () => {
    await WaitABit(this.PAUSED_CHECK_INTERVAL);
    window.requestAnimationFrame(this.animate);
  };
  private animate = (now: number) => {
    // Replace the time passed to this method by the browser
    // with the time from Snail Bait's time system
    now = SnailBait.timeSystem.calculateGameTime();

    if (this.paused) {
      this.pausedReanimateCheck();
    } else {
      this.fps = this.calculateFps(now);
      this.draw(now);
      this.lastAnimationFrameTime = now;
      window.requestAnimationFrame(this.animate);
    }
  };

  private togglePausedStateOfAllBehaviors = (now?: number) => {
    let behavior: IBehavior;

    for (let i = 0; i < this.sprites.length; ++i) {
      const sprite = this.sprites[i];

      for (let j = 0; j < sprite.behaviors.length; ++j) {
        behavior = sprite.behaviors[j];

        if (this.paused) {
          if (behavior.pause) {
            behavior.pause(sprite, now);
          }
        } else {
          if (behavior.unpause) {
            behavior.unpause(sprite, now);
          }
        }
      }
    }
  };

  private togglePaused = () => {
    const now = SnailBait.timeSystem.calculateGameTime();

    this.paused = !this.paused;

    this.togglePausedStateOfAllBehaviors(now);

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
    }, LOADING_SCREEN_TRANSITION_DURATION);
  };
  private loadingAnimationLoaded = () => {
    this.fadeInElements(SHORT_DELAY, [
      this.runnerAnimatedGIFElement,
      this.loadingTitleElement,
    ]);
  };

  public initializeImages = () => {
    this.spritesheet.src = "images/spritesheet.png";
    this.runnerAnimatedGIFElement.src = "images/snail.gif";

    this.spritesheet.onload = this.backgroundLoaded;

    this.runnerAnimatedGIFElement.onload = this.loadingAnimationLoaded;
  };

  private dimControls = () => {
    const FINAL_OPACITY = "0.5";

    snailBait.instructionsElement.style.opacity = FINAL_OPACITY;
    snailBait.soundAndMusicElement.style.opacity = FINAL_OPACITY;
  };
  private revealCanvas = () => {
    this.fadeInElements(SHORT_DELAY, [this.canvas]);
  };
  private revealTopChrome = () => {
    this.fadeInElements(SHORT_DELAY, [this.fpsElement, this.scoreElement]);
  };
  private revealTopChromeDimmed = () => {
    const DIM = "0.25";
    this.scoreElement.style.display = "block";
    this.fpsElement.style.display = "block";

    setTimeout(function () {
      snailBait.scoreElement.style.opacity = DIM;
      snailBait.fpsElement.style.opacity = DIM;
    }, SHORT_DELAY);
  };
  private revealBottomChrome = () => {
    this.fadeInElements(SHORT_DELAY, [
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
    //let key = e.keyCode;
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
    } else if (e.code === "KeyJ") {
      // 'j'
      if (this.runner === undefined) {
        console.warn(
          `onKeyDownEvent(KeyJ) happened but this.runner was undefined!`
        );
        return;
      }
      if (this.runner.jump === undefined) {
        console.warn(
          `onKeyDownEvent(KeyJ) happened but this.runner.jump() function was undefined!`
        );
        return;
      }
      this.runner.jump();
    }
  };

  private onWindowBlurEvent = (/*e: FocusEvent*/) => {
    this.windowHasFocus = false;

    if (!this.paused) {
      this.togglePaused();
    }
  };

  private onWindowFocusEvent = (/*e: FocusEvent*/) => {
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

    await WaitABit(DIGIT_DISPLAY_DURATION);

    if (this.windowHasFocus && this.countdownInProgress)
      this.revealToast("2", 500); // Display 2 for 0.5 seconds

    await WaitABit(DIGIT_DISPLAY_DURATION);

    if (this.windowHasFocus && this.countdownInProgress)
      this.revealToast("1", 500); // Display 1 for 0.5 seconds

    await WaitABit(DIGIT_DISPLAY_DURATION);

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

    SnailBait.timeSystem.start();
    //this.setTimeRate(0.25);
    this.gameStarted = true;

    window.requestAnimationFrame(this.animate);
  };

  private resetRunner = () => {
    if (this.runner === undefined) {
      return;
    }
    this.runner.left = snailBait.RUNNER_LEFT;
    this.runner.track = 3;
    this.runner.hOffset = 0;
    this.runner.visible = true;
    this.runner.exploding = false;
    this.runner.jumping = false;
    this.runner.top = SnailBait.calculatePlatformTop(3) - this.runner.height;

    this.runner.artist.cells = this.runnerCellsRight;
    this.runner.artist.SetCellIndex(0);
  };
  private resetOffsets = () => {
    SnailBait.bgVelocity = 0;
    this.backgroundOffset = 0;
    this.platformOffset = 0;
    this.spriteOffset = 0;
  };
  private makeAllSpritesVisible = () => {
    for (let i = 0; i < this.sprites.length; ++i) {
      this.sprites[i].visible = true;
    }
  };
  private reset = () => {
    this.resetOffsets();
    this.resetRunner();
    this.makeAllSpritesVisible();
    this.canvas.style.opacity = OPAQUE;
  };
  private startLifeTransition = (slowMotionDelay: number) => {
    const CANVAS_TRANSITION_OPACITY = "0.05",
      SLOW_MOTION_RATE = 0.1;

    this.canvas.style.opacity = CANVAS_TRANSITION_OPACITY;
    SnailBait.playing = false;

    setTimeout(function () {
      snailBait.setTimeRate(SLOW_MOTION_RATE);
      if (snailBait.runner) {
        snailBait.runner.visible = false;
      }
    }, slowMotionDelay);
  };
  private endLifeTransition = () => {
    const TIME_RESET_DELAY = 1000,
      RUN_DELAY = 500;

    snailBait.reset();

    setTimeout(function () {
      // Reset the time
      snailBait.setTimeRate(1.0);

      setTimeout(function () {
        // Stop running
        if (snailBait.runner) {
          snailBait.runner.runAnimationRate = 0;
        }
        SnailBait.playing = true;
      }, RUN_DELAY);
    }, TIME_RESET_DELAY);
  };
  private loseLife = () => {
    const TRANSITION_DURATION = 3000;

    this.lives--;
    this.startLifeTransition(RUNNER_EXPLOSION_DURATION);

    setTimeout(function () {
      // After the explosion
      snailBait.endLifeTransition();
    }, TRANSITION_DURATION);
  };

  // Event handlers.......................................................
}

// Launch game.........................................................
const snailBait = new SnailBait();

snailBait.initializeImages();
snailBait.createSprites();
