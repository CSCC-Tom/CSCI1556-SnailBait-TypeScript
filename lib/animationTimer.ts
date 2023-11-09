import { Stopwatch } from "./stopwatch";

export type AnimationEasingFunction = (percentComplete: number) => number;

export class AnimationTimer {
  private duration: number;
  private stopwatch: Stopwatch;
  private easingFunction: AnimationEasingFunction;
  constructor(duration: number, easingFunction: AnimationEasingFunction) {
    this.easingFunction = easingFunction;

    if (duration !== undefined) this.duration = duration;
    else this.duration = 1000;

    this.stopwatch = new Stopwatch();
  }

  public start = (now?: number) => {
    this.stopwatch.start(now);
  };

  public stop = (now?: number) => {
    this.stopwatch.stop(now);
  };

  public pause = (now?: number) => {
    this.stopwatch.pause(now);
  };

  public unpause = (now?: number) => {
    this.stopwatch.unpause(now);
  };

  public isPaused = () => {
    return this.stopwatch.isPaused();
  };

  public getElapsedTime = (now?: number) => {
    const elapsedTime = this.stopwatch.getElapsedTime(now),
      percentComplete = elapsedTime / this.duration;

    if (
      this.easingFunction === undefined ||
      percentComplete === 0 ||
      percentComplete > 1
    ) {
      return elapsedTime;
    }

    return (
      elapsedTime * (this.easingFunction(percentComplete) / percentComplete)
    );
  };

  public isRunning = () => {
    return this.stopwatch.isRunning();
  };

  public isExpired = (now?: number) => {
    return this.stopwatch.getElapsedTime(now) > this.duration;
  };

  public reset = (now?: number) => {
    this.stopwatch.reset(now);
  };

  public static makeEaseOutEasingFunction = (
    strength: number
  ): AnimationEasingFunction => {
    return function (percentComplete) {
      return 1 - Math.pow(1 - percentComplete, strength * 2);
    };
  };

  public static makeEaseInEasingFunction = (
    strength: number
  ): AnimationEasingFunction => {
    return function (percentComplete) {
      return Math.pow(percentComplete, strength * 2);
    };
  };

  public static makeEaseOutInEasingFunction = (): AnimationEasingFunction => {
    return function (percentComplete) {
      return (
        percentComplete +
        Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI)
      );
    };
  };

  public static makeEaseInOutEasingFunction = (): AnimationEasingFunction => {
    return function (percentComplete) {
      return (
        percentComplete -
        Math.sin(percentComplete * 2 * Math.PI) / (2 * Math.PI)
      );
    };
  };

  public static makeLinearEasingFunction = (): AnimationEasingFunction => {
    return function (percentComplete) {
      return percentComplete;
    };
  };
}
