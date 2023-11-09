import { AnimationTimer } from "../animationTimer";
import { Behavior } from "../behavior";
import { Sprite } from "../sprites";

export class BounceBehavior extends Behavior {
  private duration: number;
  private distance: number;
  private bouncing: boolean;
  private timer: AnimationTimer;
  private paused: boolean;
  private baseline: number = 0;
  constructor(duration?: number, height?: number) {
    super();
    this.duration = duration || 1000;
    this.distance = height ? height * 2 : 100;
    this.bouncing = false;

    this.timer = new AnimationTimer(
      this.duration,
      AnimationTimer.makeEaseOutInEasingFunction()
    );

    this.paused = false;
  }

  public pause = (sprite: Sprite, now?: number) => {
    if (!this.timer.isPaused()) {
      this.timer.pause(now);
    }
    this.paused = true;
  };

  public unpause = (sprite: Sprite, now?: number) => {
    if (this.timer.isPaused()) {
      this.timer.unpause(now);
    }

    this.paused = false;
  };

  private startBouncing = (sprite: Sprite, now: number) => {
    this.baseline = sprite.top;
    this.bouncing = true;
    this.timer.start(now);
  };

  private resetTimer = (now: number) => {
    this.timer.stop(now);
    this.timer.reset(now);
    this.timer.start(now);
  };

  private adjustVerticalPosition = (
    sprite: Sprite,
    elapsed: number,
    now: number
  ) => {
    let rising = false;
    const deltaY =
      (this.timer.getElapsedTime(now) / this.duration) * this.distance;

    if (elapsed < this.duration / 2) rising = true;

    if (rising) {
      // Subtracting deltaY moves the sprite up
      sprite.top = this.baseline - deltaY;
    } else {
      // Move the sprite down
      sprite.top = this.baseline - this.distance + deltaY;
    }
  };

  public execute = (
    sprite: Sprite,
    now: number
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ) => {
    let elapsed: number; // deltaY;

    if (!this.bouncing) {
      this.startBouncing(sprite, now);
    } else {
      elapsed = this.timer.getElapsedTime(now);

      if (this.timer.isExpired(now)) {
        this.resetTimer(now);
        return;
      }

      this.adjustVerticalPosition(sprite, elapsed, now);
    }
  };
}
