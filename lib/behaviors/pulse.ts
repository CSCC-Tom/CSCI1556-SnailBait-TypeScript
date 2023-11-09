import { AnimationTimer } from "../animationTimer";
import { Behavior } from "../behavior";
import { Sprite } from "../sprites";

export class PulseBehavior extends Behavior {
  private duration: number;
  private opacityThreshold: number;
  private timer: AnimationTimer;
  private paused: boolean;
  private pulsating: boolean;
  constructor(duration?: number, opacityThreshold?: number) {
    super();
    this.duration = duration || 1000;
    this.opacityThreshold = opacityThreshold || 0;

    this.timer = new AnimationTimer(
      this.duration,
      AnimationTimer.makeEaseInOutEasingFunction()
    );
    this.paused = false;
    this.pulsating = false;
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
  private dim = (sprite: Sprite, elapsed: number) => {
    sprite.opacity =
      1 - (1 - this.opacityThreshold) * (elapsed / this.duration);
  };

  private brighten = (sprite: Sprite, elapsed: number) => {
    sprite.opacity += ((1 - this.opacityThreshold) * elapsed) / this.duration;
  };

  private startPulsing = () => {
    this.pulsating = true;
    this.timer.start();
  };

  private resetTimer = () => {
    this.timer.stop();
    this.timer.reset();
    this.timer.start();
  };

  public execute = (
    sprite: Sprite
    //now: number,
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ) => {
    let elapsed;

    if (!this.pulsating) {
      this.startPulsing();
    } else {
      elapsed = this.timer.getElapsedTime();

      if (this.timer.isExpired()) {
        this.resetTimer();
        return;
      }

      if (elapsed < this.duration / 2) {
        this.dim(sprite, elapsed);
      } else {
        this.brighten(sprite, elapsed);
      }
    }
  };
}
