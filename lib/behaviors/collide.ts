import { Behavior } from "../behavior";
import { Sprite } from "../sprites";
import {
  PlatformSprite,
  PlatformTrackToNumberFunction,
} from "../sprites/platform";
import { TimeSystem } from "../timeSystem";

export class CollideBehavior extends Behavior {
  private readonly timeSystem: TimeSystem;
  private readonly calculatePlatformTop: PlatformTrackToNumberFunction;
  private readonly getAllGameSprites: () => Sprite[];
  private loseLife: () => void;
  private explode: (sprite: Sprite) => void;
  private shake: () => void;

  constructor(
    time_system: TimeSystem,
    calculate_platform_top: PlatformTrackToNumberFunction,
    get_all_game_sprites: () => Sprite[],
    lose_life: () => void,
    explode: (sprite: Sprite) => void,
    shake: () => void
  ) {
    super();
    this.timeSystem = time_system;
    this.calculatePlatformTop = calculate_platform_top;
    this.getAllGameSprites = get_all_game_sprites;
    this.loseLife = lose_life;
    this.explode = explode;
    this.shake = shake;
  }
  public isCandidateForCollision = (
    sprite: Sprite,
    otherSprite: Sprite
  ): boolean => {
    const s = sprite.calculateCollisionRectangle(),
      o = otherSprite.calculateCollisionRectangle();

    return (
      o.left < s.right &&
      sprite !== otherSprite &&
      sprite.visible &&
      otherSprite.visible &&
      !sprite.exploding &&
      !otherSprite.exploding
    );
  };
  public didCollide = (
    sprite: Sprite,
    otherSprite: Sprite,
    context: CanvasRenderingContext2D
  ): boolean => {
    const o = otherSprite.calculateCollisionRectangle(),
      r = sprite.calculateCollisionRectangle();

    // Determine if either of the runner's four corners or its
    // center lie within the other sprite's bounding box.

    context.beginPath();
    context.rect(o.left, o.top, o.right - o.left, o.bottom - o.top);

    return (
      context.isPointInPath(r.left, r.top) ||
      context.isPointInPath(r.right, r.top) ||
      context.isPointInPath(r.centerX, r.centerY) ||
      context.isPointInPath(r.left, r.bottom) ||
      context.isPointInPath(r.right, r.bottom)
    );
  };
  private processPlatformCollisionDuringJump = (
    sprite: Sprite,
    platform: PlatformSprite
  ) => {
    const isDescending = sprite.descendTimer?.isRunning();
    sprite.stopJumping?.();

    if (isDescending) {
      sprite.track = platform.track;
      sprite.top = this.calculatePlatformTop(sprite.track) - sprite.height;
    } else {
      // Collided with platform while ascending
      sprite.fall?.();
    }
  };
  public processBadGuyCollision = (sprite: Sprite) => {
    this.explode(sprite);
    this.shake();
    this.loseLife();
  };
  public processAssetCollision = (sprite: Sprite) => {
    sprite.visible = false; // sprite is the asset
  };
  public processCollision = (
    sprite: Sprite,
    otherSprite: Sprite | PlatformSprite
  ) => {
    if (
      sprite.jumping &&
      "platform" === otherSprite.type &&
      otherSprite instanceof PlatformSprite
    ) {
      this.processPlatformCollisionDuringJump(sprite, otherSprite);
    } else if (
      "coin" === otherSprite.type ||
      "sapphire" === otherSprite.type ||
      "ruby" === otherSprite.type
    ) {
      this.processAssetCollision(otherSprite);
    }

    if (
      "bat" === otherSprite.type ||
      "bee" === otherSprite.type ||
      "snail bomb" === otherSprite.type
    ) {
      this.processBadGuyCollision(otherSprite);
    } else if ("button" === otherSprite.type) {
      if (
        (sprite.jumping && sprite.descendTimer?.isRunning()) ||
        sprite.falling
      ) {
        otherSprite.detonating = true;
      }
    }
  };
  public execute = (
    sprite: Sprite,
    // Can't expect `context` without also expecting now and fps due to how function parameter overloading works. (All parameters, if they appear, must always appear in the same order. You can leave parameters out but only "from the end of the list".)
    // Underline prefix makes typescript tolerate these field(s) not being used.
    _now: number,
    _fps: number,
    context: CanvasRenderingContext2D
    //lastAnimationFrameTime: number
  ): void => {
    const otherSprites = this.getAllGameSprites(); // other than the runner
    for (let i = 0; i < otherSprites.length; ++i) {
      const otherSprite = otherSprites[i];

      if (this.isCandidateForCollision(sprite, otherSprite)) {
        if (this.didCollide(sprite, otherSprite, context)) {
          this.processCollision(sprite, otherSprite);
        }
      }
    }
  };
}
