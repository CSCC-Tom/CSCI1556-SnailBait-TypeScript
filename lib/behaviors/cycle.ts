/* CYCLE: For sprites that have a spritesheet artist, this behavior
          advances the sprite artist through the sprite's images for
          the specified duration. Then the behavior waits for the
          specified interval to expire and starts the entire process again.
          
          The behavior shows each cell for the specified duration.
          When the behavior has cycled through all of the cells, it
          pauses for the specified interval before starting the whole
          process again.
*/

import { Behavior } from "../behavior";
import { Sprite } from "../sprites";

export class CycleBehavior extends Behavior {
  private duration: number;
  private interval: number;
  constructor(duration: number = 1000, interval: number = 300) {
    super();
    this.duration = duration; //  milliseconds
    this.interval = interval;
  }

  public execute = (
    sprite: Sprite,
    now: number
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ): void => {
    if (this.lastAdvance === 0) {
      // First time only
      this.lastAdvance = now;
    }

    if (now - this.lastAdvance > this.duration) {
      sprite.artist.advance();
      this.lastAdvance = now;
    } else if (
      this.interval && // If there's a interval
      sprite.artist.GetCellIndex() === 0
    ) {
      // and the cycle is complete
      if (now - this.lastAdvance > this.interval) {
        // If it's time to advance
        sprite.artist.advance();
        this.lastAdvance = now;
      }
    }
  };
}
