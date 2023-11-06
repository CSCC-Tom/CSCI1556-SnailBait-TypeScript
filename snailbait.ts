import { CycleBehavior } from "./lib/behaviors/cycle";
import { PaceBehavior } from "./lib/behaviors/pace";
import { RunBehavior } from "./lib/behaviors/run";
import { SnailBombMoveBehavior } from "./lib/behaviors/snailbombmove";
import { SnailShootBehavior } from "./lib/behaviors/snailshoot";
import {
  PlatformArtist,
  PlatformObject,
  PlatformSprite,
  PlatformChild,
  PlatformTrack,
  ObjectCoordinates,
} from "./lib/definitions";
import { Sprite, SpriteSheetArtist, SpritesheetCell } from "./lib/sprites";
import { SnailSprite } from "./lib/sprites/snail";
import { SnailBombSprite } from "./lib/sprites/snailbomb";
class SnailBait {
  private canvas: HTMLCanvasElement = document.getElementById(
    "game-canvas"
  ) as HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  // Constants............................................................
  private readonly SHORT_DELAY = 50; // milliseconds
  private readonly TRANSPARENT = "0";
  private readonly OPAQUE = "1.0";
  private readonly BACKGROUND_VELOCITY = 42;
  private readonly RUN_ANIMATION_RATE = 30;
  private readonly PLATFORM_HEIGHT = 8;
  private readonly PLATFORM_STROKE_WIDTH = 2;
  private readonly PLATFORM_STROKE_STYLE = "rgb(0,0,0)"; // black

  // Background width and height.........................................

  private readonly BACKGROUND_WIDTH = 1102;
  private readonly BACKGROUND_HEIGHT = 400;

  // Velocities........................................................

  private readonly BUTTON_PACE_VELOCITY = 80;
  private readonly SNAIL_PACE_VELOCITY = 50;

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

  // Velocities........................................................
  private bgVelocity: number;
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

  private platformArtist: PlatformArtist;

  constructor() {
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET;
    this.platformOffset = this.STARTING_PLATFORM_OFFSET;
    this.spriteOffset = this.STARTING_SPRITE_OFFSET;
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
        width: 300,
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
    this.batData = [
      { left: 85, top: this.TRACK_2_BASELINE - 1.5 * this.BAT_CELLS_HEIGHT },

      { left: 620, top: this.TRACK_3_BASELINE },

      { left: 904, top: this.TRACK_3_BASELINE - 3 * this.BAT_CELLS_HEIGHT },

      { left: 1150, top: this.TRACK_2_BASELINE - 3 * this.BAT_CELLS_HEIGHT },

      { left: 1720, top: this.TRACK_2_BASELINE - 2 * this.BAT_CELLS_HEIGHT },

      { left: 1960, top: this.TRACK_3_BASELINE - this.BAT_CELLS_HEIGHT },

      { left: 2200, top: this.TRACK_3_BASELINE - this.BAT_CELLS_HEIGHT },

      { left: 2380, top: this.TRACK_3_BASELINE - 2 * this.BAT_CELLS_HEIGHT },
    ];
    this.beeData = [
      { left: 200, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT * 1.5 },
      { left: 350, top: this.TRACK_2_BASELINE - this.BEE_CELLS_HEIGHT * 1.5 },
      { left: 550, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT },
      { left: 750, top: this.TRACK_1_BASELINE - this.BEE_CELLS_HEIGHT * 1.5 },

      { left: 924, top: this.TRACK_2_BASELINE - this.BEE_CELLS_HEIGHT * 1.75 },

      { left: 1500, top: 225 },
      { left: 1600, top: 115 },
      { left: 2225, top: 125 },
      { left: 2295, top: 275 },
      { left: 2450, top: 275 },
    ];
    this.buttonData = [{ platformIndex: 2 }, { platformIndex: 12 }];
    this.coinData = [
      { left: 270, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 489, top: this.TRACK_3_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 620, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 833, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 1050, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 1450, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 1670, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 1870, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 1930, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 2200, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 2320, top: this.TRACK_2_BASELINE - this.COIN_CELLS_HEIGHT },

      { left: 2360, top: this.TRACK_1_BASELINE - this.COIN_CELLS_HEIGHT },
    ];
    this.sapphireData = [
      { left: 70, top: this.TRACK_1_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },

      { left: 880, top: this.TRACK_2_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },

      { left: 1100, top: this.TRACK_2_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },

      { left: 1475, top: this.TRACK_1_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },

      { left: 2400, top: this.TRACK_1_BASELINE - this.SAPPHIRE_CELLS_HEIGHT },
    ];
    this.rubyData = [
      { left: 690, top: this.TRACK_1_BASELINE - this.RUBY_CELLS_HEIGHT },

      { left: 1700, top: this.TRACK_2_BASELINE - this.RUBY_CELLS_HEIGHT },

      { left: 2056, top: this.TRACK_2_BASELINE - this.RUBY_CELLS_HEIGHT },
    ];
    this.smokingHoleData = [
      { left: 248, top: this.TRACK_2_BASELINE - 22 },
      { left: 688, top: this.TRACK_3_BASELINE + 5 },
      { left: 1352, top: this.TRACK_2_BASELINE - 18 },
    ];
    this.snailData = [{ platformIndex: 3 }];
    // Sprite artists....................................................
    this.platformArtist = new PlatformArtist(this.calculatePlatformTop);
    // ------------------------Sprite behaviors-------------------------

    // Pacing on platforms...............................................

    this.runBehavior = new RunBehavior();

    // Pacing on platforms...............................................

    this.paceBehavior = new PaceBehavior();

    // Snail shoot behavior..............................................

    this.snailShootBehavior = new SnailShootBehavior(this.isSpriteInView);

    // Move the snail bomb...............................................

    this.snailBombMoveBehavior = new SnailBombMoveBehavior();
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

  private initializeSprites = () => {
    this.positionSprites(this.bats, this.batData);
    this.positionSprites(this.bees, this.beeData);
    this.positionSprites(this.buttons, this.buttonData);
    this.positionSprites(this.coins, this.coinData);
    this.positionSprites(this.rubies, this.rubyData);
    this.positionSprites(this.sapphires, this.sapphireData);
    this.positionSprites(this.snails, this.snailData);
    this.armSnails();
  };

  private createBatSprites = () => {
    for (let i = 0; i < this.batData.length; ++i) {
      const bat = new Sprite(
        "bat",
        new SpriteSheetArtist(this.spritesheet, this.batCells),
        []
      );

      // bat cell width leties; batCells[1] is widest

      bat.width = this.batCells[1].width;
      bat.height = this.BAT_CELLS_HEIGHT;

      this.bats.push(bat);
    }
  };
  private createBeeSprites = () => {
    for (let i = 0; i < this.beeData.length; ++i) {
      const bee = new Sprite(
        "bee",
        new SpriteSheetArtist(this.spritesheet, this.beeCells),
        []
      );

      bee.width = this.BEE_CELLS_WIDTH;
      bee.height = this.BEE_CELLS_HEIGHT;

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
      button.velocityX = this.BUTTON_PACE_VELOCITY;

      this.buttons.push(button);
    }
  };

  private createCoinSprites = () => {
    for (let i = 0; i < this.coinData.length; ++i) {
      let coin;
      if (i % 2 === 0) {
        coin = new Sprite(
          "coin",
          new SpriteSheetArtist(this.spritesheet, this.goldCoinCells),
          []
        );
      } else {
        coin = new Sprite(
          "coin",
          new SpriteSheetArtist(this.spritesheet, this.blueCoinCells),
          []
        );
      }

      coin.width = this.COIN_CELLS_WIDTH;
      coin.height = this.COIN_CELLS_HEIGHT;
      coin.value = 50;

      this.coins.push(coin);
    }
  };

  private createPlatformSprites = () => {
    let sprite, pd; // Sprite, Platform data

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

      sprite.top = this.calculatePlatformTop(pd.track);

      this.platforms.push(sprite);
    }
  };

  private createRubySprites = () => {
    const RUBY_SPARKLE_DURATION = 100,
      RUBY_SPARKLE_INTERVAL = 500;
    const rubyArtist = new SpriteSheetArtist(this.spritesheet, this.rubyCells);

    for (let i = 0; i < this.rubyData.length; ++i) {
      const ruby = new Sprite("ruby", rubyArtist, [
        new CycleBehavior(RUBY_SPARKLE_DURATION, RUBY_SPARKLE_INTERVAL),
      ]);

      ruby.width = this.RUBY_CELLS_WIDTH;
      ruby.height = this.RUBY_CELLS_HEIGHT;
      ruby.value = 200;

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
      [this.runBehavior]
    );
    this.runner.runAnimationRate = STARTING_RUN_ANIMATION_RATE;

    this.runner.track = STARTING_RUNNER_TRACK;
    this.runner.left = RUNNER_LEFT;
    this.runner.top =
      this.calculatePlatformTop(this.runner.track) - RUNNER_HEIGHT;

    this.sprites.push(this.runner);
  };

  private createSapphireSprites = () => {
    const SAPPHIRE_SPARKLE_DURATION = 100,
      SAPPHIRE_SPARKLE_INTERVAL = 300;
    const sapphireArtist = new SpriteSheetArtist(
      this.spritesheet,
      this.sapphireCells
    );

    for (let i = 0; i < this.sapphireData.length; ++i) {
      const sapphire = new Sprite("sapphire", sapphireArtist, [
        new CycleBehavior(SAPPHIRE_SPARKLE_DURATION, SAPPHIRE_SPARKLE_INTERVAL),
      ]);

      sapphire.width = this.SAPPHIRE_CELLS_WIDTH;
      sapphire.height = this.SAPPHIRE_CELLS_HEIGHT;
      sapphire.value = 100;

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
          1500 // 1.5 seconds interlude
        ),
      ]);

      snail.width = this.SNAIL_CELLS_WIDTH;
      snail.height = this.SNAIL_CELLS_HEIGHT;
      snail.velocityX = this.SNAIL_PACE_VELOCITY;

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
    this.platformVelocity = this.bgVelocity * this.PLATFORM_VELOCITY_MULTIPLIER;
  };

  private setOffsets = (now: number) => {
    this.setBackgroundOffset(now);
    this.setSpriteOffsets(now);
    //this.setPlatformOffset(now);
  };

  private setBackgroundOffset = (now: number) => {
    this.backgroundOffset +=
      (this.bgVelocity * (now - this.lastAnimationFrameTime)) / 1000;

    if (
      this.backgroundOffset < 0 ||
      this.backgroundOffset > this.BACKGROUND_WIDTH
    ) {
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
      this.BACKGROUND_WIDTH,
      this.BACKGROUND_HEIGHT,
      0,
      0,
      this.BACKGROUND_WIDTH,
      this.BACKGROUND_HEIGHT
    );

    // Initially offscreen:
    this.context.drawImage(
      this.spritesheet,
      0,
      BACKGROUND_TOP_IN_SPRITESHEET,
      this.BACKGROUND_WIDTH,
      this.BACKGROUND_HEIGHT,
      this.BACKGROUND_WIDTH,
      0,
      this.BACKGROUND_WIDTH,
      this.BACKGROUND_HEIGHT
    );

    // Translate back to the original location
    this.context.translate(this.backgroundOffset, 0);
  };

  private drawPlatform = (data: PlatformObject) => {
    const platformTop = this.calculatePlatformTop(data.track);

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
    const fps = (1 / (now - this.lastAnimationFrameTime)) * 1000;

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
    if (this.runner === undefined) {
      return;
    }
    this.runner.runAnimationRate = this.RUN_ANIMATION_RATE;
    this.runner.artist.cells = this.runnerCellsLeft;
  };

  private turnRight = () => {
    this.bgVelocity = this.BACKGROUND_VELOCITY;
    if (this.runner === undefined) {
      return;
    }
    this.runner.runAnimationRate = this.RUN_ANIMATION_RATE;
    this.runner.artist.cells = this.runnerCellsRight;
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
  private pausedReanimateCheck = async () => {
    await this.waitABit(this.PAUSED_CHECK_INTERVAL);
    window.requestAnimationFrame(this.animate);
  };
  private animate = (now: number) => {
    if (this.paused) {
      this.pausedReanimateCheck();
    } else {
      this.fps = this.calculateFps(now);
      this.draw(now);
      this.lastAnimationFrameTime = now;
      window.requestAnimationFrame(this.animate);
    }
  };

  private togglePaused = () => {
    const now = +new Date();

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
snailBait.createSprites();
