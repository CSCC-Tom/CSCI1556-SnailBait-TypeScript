import { Behavior } from "../behavior";
import { Sprite, SpriteDirection } from "../sprites";

export class PaceBehavior extends Behavior {
  public setDirection = (sprite: Sprite) => {
    if (sprite.platform === undefined) {
      console.warn(
        `PaceBehavior.setDirection(${sprite.type}) called but sprite did not have a defined platform!`
      );
      return;
    }
    const sRight = sprite.left + sprite.width,
      pRight = sprite.platform.left + sprite.platform.width;

    if (sprite.direction === undefined) {
      sprite.direction = SpriteDirection.RIGHT;
    }

    if (sRight > pRight && sprite.direction === SpriteDirection.RIGHT) {
      sprite.direction = SpriteDirection.LEFT;
    } else if (
      sprite.left < sprite.platform.left &&
      sprite.direction === SpriteDirection.LEFT
    ) {
      sprite.direction = SpriteDirection.RIGHT;
    }
  };

  public setPosition = (
    sprite: Sprite,
    now: number,
    lastAnimationFrameTime: number
  ) => {
    const pixelsToMove =
      (sprite.velocityX * (now - lastAnimationFrameTime)) / 1000;

    if (sprite.direction === SpriteDirection.RIGHT) {
      sprite.left += pixelsToMove;
    } else {
      sprite.left -= pixelsToMove;
    }
  };

  public execute = (
    sprite: Sprite,
    now: number,
    fps: number,
    context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ): void => {
    this.setDirection(sprite);
    this.setPosition(sprite, now, lastAnimationFrameTime);
  };
}
