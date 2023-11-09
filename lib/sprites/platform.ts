import { Sprite, SpriteSheetArtist } from "../sprites";

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
export type PlatformTrackToNumberFunction = (track: PlatformTrack) => number;
export class PlatformArtist {
  private calculatePlatformTop: PlatformTrackToNumberFunction;
  constructor(calculate_platform_top: PlatformTrackToNumberFunction) {
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

/** Helper function for detecting if a Sprite is over a Platform.
 * @param sprite to test
 * @param track that the sprite is on
 * @param platforms array of spawned PlatformSprites
 * @returns PlatformSprite that meets the test, or undefined otherwise.
 * */
export function platformUnderneath(
  sprite: Sprite,
  track: PlatformTrack,
  platforms: PlatformSprite[]
): PlatformSprite | undefined {
  const sr = sprite.calculateCollisionRectangle(); // sprite rect
  let platform, platformUnderneath, pr; // platform rectangle

  if (track === undefined) {
    track = sprite.track; // Look on sprite track only
  }

  for (let i = 0; i < platforms.length; ++i) {
    platform = platforms[i];
    pr = platform.calculateCollisionRectangle();

    if (track === platform.track) {
      if (sr.right > pr.left && sr.left < pr.right) {
        platformUnderneath = platform;
        break;
      }
    }
  }
  return platformUnderneath;
}
