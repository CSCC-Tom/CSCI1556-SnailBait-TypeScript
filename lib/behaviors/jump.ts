import { Behavior } from "../behavior";
import { RUN_ANIMATION_RATE } from "../constants";
import { Sprite } from "../sprites";

export class JumpBehavior extends Behavior {
  public pause = (sprite: Sprite, now?: number) => {
    if (sprite.ascendTimer?.isRunning()) {
      sprite.ascendTimer.pause(now);
    } else if (sprite.descendTimer?.isRunning()) {
      sprite.descendTimer.pause(now);
    }
  };

  public unpause = (sprite: Sprite, now?: number) => {
    if (sprite.ascendTimer?.isRunning()) {
      sprite.ascendTimer.unpause(now);
    } else if (sprite.descendTimer?.isRunning()) {
      sprite.descendTimer.unpause(now);
    }
  };

  private isAscending = (sprite: Sprite) => {
    return sprite.ascendTimer ? sprite.ascendTimer.isRunning() : false;
  };

  private ascend = (sprite: Sprite, now?: number) => {
    const elapsed = sprite.ascendTimer
      ? sprite.ascendTimer.getElapsedTime(now)
      : 0;
    const jump_duration = sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0;
    const jump_height = sprite.JUMP_HEIGHT ? sprite.JUMP_HEIGHT : 0;
    const deltaY = (elapsed / (jump_duration / 2)) * jump_height;

    sprite.top =
      (sprite.verticalLaunchPosition ? sprite.verticalLaunchPosition : 0) -
      deltaY; // Moving up
  };

  private isDoneAscending = (sprite: Sprite, now?: number) => {
    return (
      (sprite.ascendTimer ? sprite.ascendTimer.getElapsedTime(now) : 0) >
      (sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0) / 2
    );
  };

  private finishAscent = (sprite: Sprite, now?: number) => {
    sprite.jumpApex = sprite.top;
    sprite.ascendTimer?.stop(now);
    sprite.descendTimer?.start(now);
  };

  private isDescending = (sprite: Sprite) => {
    return sprite.descendTimer ? sprite.descendTimer.isRunning() : false;
  };

  private descend = (
    sprite: Sprite,
    now?: number //verticalVelocity?: number,
    //fps?: number
  ) => {
    const elapsed = sprite.descendTimer
      ? sprite.descendTimer.getElapsedTime(now)
      : 0;
    const jump_duration = sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0;
    const jump_height = sprite.JUMP_HEIGHT ? sprite.JUMP_HEIGHT : 0;
    const deltaY = (elapsed / (jump_duration / 2)) * jump_height;

    sprite.top = (sprite.jumpApex ? sprite.jumpApex : 0) + deltaY; // Moving down
  };

  private isDoneDescending = (sprite: Sprite, now?: number) => {
    const jump_duration = sprite.JUMP_DURATION ? sprite.JUMP_DURATION : 0;
    return (
      (sprite.descendTimer ? sprite.descendTimer.getElapsedTime(now) : 0) >
      jump_duration / 2
    );
  };
  private finishDescent = (sprite: Sprite) => {
    sprite.top = sprite.verticalLaunchPosition
      ? sprite.verticalLaunchPosition
      : 0;
    sprite.runAnimationRate = RUN_ANIMATION_RATE;
    sprite.stopJumping?.();
    sprite.runAnimationRate = RUN_ANIMATION_RATE;
  };

  public execute = (
    sprite: Sprite,
    now?: number
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ) => {
    if (!sprite.jumping || sprite.track === 3) {
      return;
    }

    if (this.isAscending(sprite)) {
      if (!this.isDoneAscending(sprite, now)) this.ascend(sprite, now);
      else this.finishAscent(sprite, now);
    } else if (this.isDescending(sprite)) {
      if (!this.isDoneDescending(sprite, now)) this.descend(sprite, now);
      else this.finishDescent(sprite);
    }
  };
}
