import { Behavior } from "../behavior";
import { RUN_ANIMATION_RATE } from "../constants";
import { Sprite } from "../sprites";

export class JumpBehavior extends Behavior {
  public pause = (sprite: Sprite) => {
    if (sprite.ascendTimer?.isRunning()) {
      sprite.ascendTimer.pause();
    } else if (sprite.descendTimer?.isRunning()) {
      sprite.descendTimer.pause();
    }
  };

  public unpause = (sprite: Sprite) => {
    if (sprite.ascendTimer?.isRunning()) {
      sprite.ascendTimer.unpause();
    } else if (sprite.descendTimer?.isRunning()) {
      sprite.descendTimer.unpause();
    }
  };

  private isAscending = (sprite: Sprite) => {
    return sprite.ascendTimer ? sprite.ascendTimer.isRunning() : false;
  };

  private ascend = (sprite: Sprite) => {
    const elapsed = sprite.ascendTimer
      ? sprite.ascendTimer.getElapsedTime()
      : 0;
    const jump_duration = sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0;
    const jump_height = sprite.JUMP_HEIGHT ? sprite.JUMP_HEIGHT : 0;
    const deltaY = (elapsed / (jump_duration / 2)) * jump_height;

    sprite.top =
      (sprite.verticalLaunchPosition ? sprite.verticalLaunchPosition : 0) -
      deltaY; // Moving up
  };

  private isDoneAscending = (sprite: Sprite) => {
    return (
      (sprite.ascendTimer ? sprite.ascendTimer.getElapsedTime() : 0) >
      (sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0) / 2
    );
  };

  private finishAscent = (sprite: Sprite) => {
    sprite.jumpApex = sprite.top;
    sprite.ascendTimer?.stop();
    sprite.descendTimer?.start();
  };

  private isDescending = (sprite: Sprite) => {
    return sprite.descendTimer ? sprite.descendTimer.isRunning() : false;
  };

  private descend = (
    sprite: Sprite //verticalVelocity?: number,
    //fps?: number
  ) => {
    const elapsed = sprite.descendTimer
      ? sprite.descendTimer.getElapsedTime()
      : 0;
    const jump_duration = sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0;
    const jump_height = sprite.JUMP_HEIGHT ? sprite.JUMP_HEIGHT : 0;
    const deltaY = (elapsed / (jump_duration / 2)) * jump_height;

    sprite.top = (sprite.jumpApex ? sprite.jumpApex : 0) + deltaY; // Moving down
  };

  private isDoneDescending = (sprite: Sprite) => {
    const jump_duration = sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0;
    return (
      (sprite.descendTimer ? sprite.descendTimer.getElapsedTime() : 0) >
      jump_duration / 2
    );
  };
  private finishDescent = (sprite: Sprite) => {
    sprite.top = sprite.verticalLaunchPosition
      ? sprite.verticalLaunchPosition
      : 0;
    sprite.runAnimationRate = RUN_ANIMATION_RATE;
    sprite.stopJumping?.();
  };

  public execute = (
    sprite: Sprite
    //now: number
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ) => {
    if (!sprite.jumping || sprite.track === 3) {
      return;
    }

    if (this.isAscending(sprite)) {
      if (!this.isDoneAscending(sprite)) this.ascend(sprite);
      else this.finishAscent(sprite);
    } else if (this.isDescending(sprite)) {
      if (!this.isDoneDescending(sprite)) this.descend(sprite);
      else this.finishDescent(sprite);
    }
  };
}
