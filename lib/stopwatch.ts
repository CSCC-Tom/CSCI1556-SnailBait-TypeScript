// Stopwatch..................................................................
//
// Like the real thing, you can start and stop a stopwatch, and you can
// find out the elapsed time the stopwatch has been running. After you stop
// a stopwatch, it's getElapsedTime() method returns the elapsed time
// between the start and stop.

export class Stopwatch {
  private startTime: number = 0;
  private running: boolean = false;
  private elapsedTime?: number = undefined;
  private elapsed?: number = undefined;

  private paused: boolean = false;
  private startPause: number = 0;
  private totalPausedTime: number = 0;

  public start = (now?: number) => {
    this.startTime = now ? now : +new Date();
    this.elapsedTime = undefined;
    this.running = true;
    this.totalPausedTime = 0;
    this.startPause = 0;
  };

  public stop = (now?: number) => {
    if (this.paused) {
      this.unpause();
    }

    this.elapsed =
      (now ? now : +new Date()) - this.startTime - this.totalPausedTime;
    this.running = false;
  };

  public pause = (now?: number) => {
    if (this.paused) {
      return;
    }

    this.startPause = now ? now : +new Date();
    this.paused = true;
  };

  public unpause = (now?: number) => {
    if (!this.paused) {
      return;
    }

    this.totalPausedTime += (now ? now : +new Date()) - this.startPause;
    this.startPause = 0;
    this.paused = false;
  };

  private isPaused = () => {
    return this.paused;
  };

  public getElapsedTime = (now?: number): number => {
    if (this.running) {
      return (now ? now : +new Date()) - this.startTime - this.totalPausedTime;
    } else {
      return this.elapsed ? this.elapsed : 0;
    }
  };

  public isRunning = () => {
    return this.running;
  };

  private reset = (now: number) => {
    this.elapsed = 0;
    this.startTime = now ? now : +new Date();
    this.elapsedTime = undefined;
    this.running = false;
  };
}
