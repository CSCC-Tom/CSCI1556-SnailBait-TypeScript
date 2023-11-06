import { Behavior } from "../behavior";
import { Sprite } from "../sprites";

export class SnailBombMoveBehavior extends Behavior {
  public execute = (
    sprite: Sprite,
    now: number,
    fps: number,
    context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ): void => {
    const SNAIL_BOMB_VELOCITY = 550;

    if (
      sprite.left + sprite.width > sprite.hOffset &&
      sprite.left + sprite.width < sprite.hOffset + sprite.width
    ) {
      sprite.visible = false;
    } else {
      sprite.left -=
        SNAIL_BOMB_VELOCITY * ((now - lastAnimationFrameTime) / 1000);
    }
  };
}
