import {
  Behavior,
  SpriteType,
  ObjectCoordinates,
  PlatformObject,
  PlatformTrack,
} from "./definitions";
// Sprite Artists......................................................

// Artists draw sprites with a draw(sprite, context) method.
export interface SpritesheetCell extends ObjectCoordinates {
  width: number;
  height: number;
}
export class SpriteSheetArtist {
  private cells: SpritesheetCell[];
  private spritesheet: HTMLImageElement;
  private cellIndex = 0;
  constructor(spritesheet: HTMLImageElement, cells: SpritesheetCell[]) {
    this.spritesheet = spritesheet;
    this.cells = cells;
  }
  public draw = (sprite: Sprite, context: CanvasRenderingContext2D) => {
    const cell = this.cells[this.cellIndex];

    context.drawImage(
      this.spritesheet,
      cell.left,
      cell.top,
      cell.width,
      cell.height,
      sprite.left,
      sprite.top,
      cell.width,
      cell.height
    );
  };
  public advance = () => {
    if (this.cellIndex === this.cells.length - 1) {
      this.cellIndex = 0;
    } else {
      this.cellIndex++;
    }
  };
}

// Sprites............................................................

// Sprites have a type, an artist, and an array of behaviors. Sprites
// can be updated and drawn.
//
// A sprite's artist draws the sprite: draw(sprite, context)
// A sprite's behavior executes: execute(sprite, time, fps)
export class Sprite {
  public static readonly DEFAULT_WIDTH = 10;
  public static readonly DEFAULT_HEIGHT = 10;
  public static readonly DEFAULT_OPACITY = 1.0;
  private artist: SpriteSheetArtist;
  public type: SpriteType;
  private behaviors: Behavior[];
  public hOffset = 0; // Horizontal offset
  public left = 0;
  public top = 0;
  public track: PlatformTrack = 1;
  public platform?: PlatformObject;
  public width = Sprite.DEFAULT_WIDTH;
  public height = Sprite.DEFAULT_HEIGHT;
  public velocityX = 0;
  private velocityY = 0;
  public opacity = Sprite.DEFAULT_OPACITY;
  public visible = true;
  public value = 0;

  public showCollisionRectangle = false;

  private collisionMargin = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };
  constructor(
    type: SpriteType,
    artist: SpriteSheetArtist,
    behaviors: Behavior[]
  ) {
    this.artist = artist;
    this.type = type;
    this.behaviors = behaviors || [];
  }
  public calculateCollisionRectangle = () => {
    // Return an object with properties left, right, top, and bottom

    return {
      left: this.left - this.hOffset + this.collisionMargin.left,

      right: this.left - this.hOffset + this.width - this.collisionMargin.right,

      top: this.top + this.collisionMargin.top,

      bottom:
        this.top +
        this.collisionMargin.top +
        this.height -
        this.collisionMargin.bottom,

      centerX: this.left + this.width / 2,

      centerY: this.top + this.height / 2,
    };
  };
  public drawCollisionRectangle = (context: CanvasRenderingContext2D) => {
    const COLLISION_RECTANGLE_COLOR = "white",
      COLLISION_RECTANGLE_LINE_WIDTH = 2.0,
      r = this.calculateCollisionRectangle();

    context.save();

    context.beginPath();

    context.strokeStyle = COLLISION_RECTANGLE_COLOR;
    context.lineWidth = COLLISION_RECTANGLE_LINE_WIDTH;

    context.strokeRect(
      r.left + this.hOffset,
      r.top,
      r.right - r.left,
      r.bottom - r.top
    );

    context.restore(); // resets strokeStyle and lineWidth
  };
  public draw = (context: CanvasRenderingContext2D) => {
    context.save();

    context.globalAlpha = this.opacity;

    if (this.visible && this.artist) {
      this.artist.draw(this, context);
    }

    if (this.showCollisionRectangle) {
      this.drawCollisionRectangle(context);
    }

    context.restore(); // resets globalAlpha
  };

  public update = (
    now: number,
    fps: number,
    context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ) => {
    for (let i = 0; i < this.behaviors.length; ++i) {
      this.behaviors[i].execute(
        this,
        now,
        fps,
        context,
        lastAnimationFrameTime
      );
    }
  };
}
