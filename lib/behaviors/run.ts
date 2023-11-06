import { Behavior } from "../behavior";
import { Sprite } from "../sprites";

export class RunBehavior extends Behavior {
  public execute = (
    sprite: Sprite,
    now: number
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ): void => {
    if (sprite.runAnimationRate === 0) {
      return;
    }

    if (this.lastAdvance === 0) {
      // skip first time
      this.lastAdvance = now;
    } else if (now - this.lastAdvance > 1000 / sprite.runAnimationRate) {
      sprite.artist.advance();
      this.lastAdvance = now;
    }
  };
}
