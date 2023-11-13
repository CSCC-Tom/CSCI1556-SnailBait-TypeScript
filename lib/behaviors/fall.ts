import { Behavior } from "../behavior";
import { GRAVITY_FORCE, PIXELS_PER_METER } from "../constants";
import { Sprite } from "../sprites";
import { PlatformSprite, PlatformTrack } from "../sprites/platform";

export class FallBehavior extends Behavior {
  private canvasHeight: number;
  private calculatePlatformTop: (track: PlatformTrack) => number;
  private putSpriteOnTrack: (sprite: Sprite, track: PlatformTrack) => void;
  private platformUnderneath: (
    sprite: Sprite,
    track: PlatformTrack,
    platforms: PlatformSprite[]
  ) => PlatformSprite | undefined;
  private loseLife: () => void;
  private readonly allPlatforms: PlatformSprite[];
  constructor(
    canvasHeight: number,
    calculatePlatformTop: (track: PlatformTrack) => number,
    putSpriteOnTrack: (sprite: Sprite, track: PlatformTrack) => void,
    platformUnderneath: (
      sprite: Sprite,
      track: PlatformTrack,
      platforms: PlatformSprite[]
    ) => PlatformSprite | undefined,
    loseLife: () => void,
    allPlatforms: PlatformSprite[]
  ) {
    super();
    this.canvasHeight = canvasHeight;
    this.calculatePlatformTop = calculatePlatformTop;
    this.putSpriteOnTrack = putSpriteOnTrack;
    this.platformUnderneath = platformUnderneath;
    this.loseLife = loseLife;
    this.allPlatforms = allPlatforms;
  }

  // Runner's fall behavior............................................

  public pause = (sprite: Sprite, now?: number) => {
    sprite.fallTimer?.pause(now);
  };

  public unpause = (sprite: Sprite, now?: number) => {
    sprite.fallTimer?.unpause(now);
  };

  public isOutOfPlay = (sprite: Sprite) => {
    return sprite.top > this.canvasHeight;
  };

  public setSpriteVelocity = (sprite: Sprite, now: number) => {
    sprite.velocityY =
      (sprite.initialVelocityY ? sprite.initialVelocityY : 0) +
      GRAVITY_FORCE *
        ((sprite.fallTimer ? sprite.fallTimer.getElapsedTime(now) : 0) / 1000) *
        PIXELS_PER_METER;
  };

  public calculateVerticalDrop = (
    sprite: Sprite,
    now: number,
    lastAnimationFrameTime: number
  ) => {
    return (sprite.velocityY * (now - lastAnimationFrameTime)) / 1000;
  };

  public willFallBelowCurrentTrack = (sprite: Sprite, dropDistance: number) => {
    return (
      sprite.top + sprite.height + dropDistance >
      this.calculatePlatformTop(sprite.track)
    );
  };

  public fallOnPlatform = (sprite: Sprite) => {
    sprite.stopFalling?.();
    this.putSpriteOnTrack(sprite, sprite.track);
  };

  public moveDown = (
    sprite: Sprite,
    now: number,
    lastAnimationFrameTime: number
  ) => {
    this.setSpriteVelocity(sprite, now);

    const dropDistance = this.calculateVerticalDrop(
      sprite,
      now,
      lastAnimationFrameTime
    );

    if (!this.willFallBelowCurrentTrack(sprite, dropDistance)) {
      sprite.top += dropDistance;
    } else {
      // will fall below current track
      if (this.platformUnderneath(sprite, sprite.track, this.allPlatforms)) {
        // collision detection
        this.fallOnPlatform(sprite);
        sprite.stopFalling?.();
      } else {
        sprite.track--;
        sprite.top += dropDistance;
      }
    }
  };

  public execute = (
    sprite: Sprite,
    now: number,
    fps: number,
    context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ) => {
    if (!sprite.falling) {
      if (
        !sprite.jumping &&
        !this.platformUnderneath(sprite, sprite.track, this.allPlatforms)
      ) {
        sprite.fall?.();
      }
    } else {
      // falling
      if (this.isOutOfPlay(sprite) || sprite.exploding) {
        sprite.stopFalling?.();

        if (this.isOutOfPlay(sprite)) {
          this.loseLife();
        }
      } else {
        // not out of play or exploding
        this.moveDown(sprite, now, lastAnimationFrameTime);
      }
    }
  };
}
