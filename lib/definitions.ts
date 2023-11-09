import { Sprite, SpriteSheetArtist } from "./sprites";

export type PlatformTrack = 1 | 2 | 3;
export interface PlatformObject {
  left: number;
  width: number;
  height: number;
  fillStyle: string;
  opacity: number;
  track: PlatformTrack;
  pulsate: boolean;
  button?: boolean;
  snail?: boolean;
}
export class PlatformArtist {
  private calculatePlatformTop: (track: PlatformTrack) => number;
  constructor(calculate_platform_top: (track: PlatformTrack) => number) {
    this.calculatePlatformTop = calculate_platform_top;
  }
  public draw = (
    platform: PlatformSprite,
    context: CanvasRenderingContext2D
  ) => {
    const PLATFORM_STROKE_WIDTH = 1.0,
      PLATFORM_STROKE_STYLE = "black";

    const top = this.calculatePlatformTop(platform.track);

    context.lineWidth = PLATFORM_STROKE_WIDTH;
    context.strokeStyle = PLATFORM_STROKE_STYLE;
    context.fillStyle = platform.fillStyle;

    context.strokeRect(platform.left, top, platform.width, platform.height);

    context.fillRect(platform.left, top, platform.width, platform.height);
  };
}

export class PlatformSprite extends Sprite implements PlatformObject {
  private platformArtist: PlatformArtist;
  public track: PlatformTrack;
  public fillStyle: string;
  public width: number;
  public height: number;
  public button?: boolean;
  public pulsate: boolean;
  public snail = undefined;
  constructor(
    spritesheet: HTMLImageElement,
    artist: PlatformArtist,
    object: PlatformObject
  ) {
    super("platform", new SpriteSheetArtist(spritesheet, []), []);
    this.platformArtist = artist;
    this.track = object.track;
    this.fillStyle = object.fillStyle;
    this.width = object.width;
    this.height = object.height;
    this.button = object.button;
    this.pulsate = object.pulsate;
  }
  public draw = (context: CanvasRenderingContext2D) => {
    context.save();

    context.globalAlpha = this.opacity;

    if (this.visible && this.platformArtist) {
      this.platformArtist.draw(this, context);
    }

    if (this.showCollisionRectangle) {
      this.drawCollisionRectangle(context);
    }

    context.restore(); // resets globalAlpha
  };
}

export interface PlatformChild {
  platformIndex: number;
}

export interface ObjectCoordinates {
  left: number;
  top: number;
}
export interface RectObject extends ObjectCoordinates {
  width: number;
  height: number;
}
export interface RectBoundaries extends ObjectCoordinates {
  right: number;
  bottom: number;
}

export type SpriteType =
  | "bat"
  | "bee"
  | "button"
  | "coin"
  | "platform"
  | "ruby"
  | "runner"
  | "sapphire"
  | "snail"
  | "snail bomb";

export interface IBehavior {
  pause?: (sprite: Sprite, now?: number) => void;
  unpause?: (sprite: Sprite, now?: number) => void;
  execute: (
    sprite: Sprite,
    now: number,
    fps: number,
    context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ) => void;
}

export const WaitABit = async (msToWait: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, msToWait));
};
