import { AnimationTimer } from "./animationTimer";
import { WaitABit } from "./definitions";

export type TimeSystemTransducerFunction = (elapsedTime: number) => number;

export class TimeSystem {
  private transducer: TimeSystemTransducerFunction;
  private timer: AnimationTimer;
  private lastTimeTransducerWasSet: number;
  private gameTime: number;
  constructor() {
    this.transducer = function (elapsedTime) {
      return elapsedTime;
    };
    this.timer = new AnimationTimer();
    this.lastTimeTransducerWasSet = 0;
    this.gameTime = 0;
  }
  public start = () => {
    this.timer.start();
  };

  private reset = () => {
    this.timer.stop();
    this.timer.reset();
    this.timer.start();
    this.lastTimeTransducerWasSet = this.gameTime;
  };

  public setTransducer = async (
    transducerFunction: TimeSystemTransducerFunction,
    duration?: number
  ) => {
    // Duration is optional. If you specify it, the transducer is
    // applied for the specified duration; after the duration ends,
    // the permanent transducer is restored. If you don't specify the
    // duration, the transducer permanently replaces the current
    // transducer.

    const lastTransducer = this.transducer;

    this.calculateGameTime();
    this.reset();
    this.transducer = transducerFunction;

    if (duration) {
      await WaitABit(duration);
      this.setTransducer(lastTransducer);
    }
  };

  public calculateGameTime = () => {
    this.gameTime =
      this.lastTimeTransducerWasSet +
      this.transducer(this.timer.getElapsedTime());
    this.reset();

    return this.gameTime;
  };
}
