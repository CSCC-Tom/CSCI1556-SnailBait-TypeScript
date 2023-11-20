import { Behavior } from "../behavior";
import { Sprite } from "../sprites";

export class BlueButtonDetonateBehavior extends Behavior {
  private explode: (sprite: Sprite) => void;
  private setTimeRate: (rate: number) => void;
  private bees: Sprite[];
  constructor(
    explodeFunction: (sprite: Sprite) => void,
    setTimeRateFunction: (rate: number) => void,
    beesArray: Sprite[]
  ) {
    super();
    this.explode = explodeFunction;
    this.setTimeRate = setTimeRateFunction;
    this.bees = beesArray;
  }

  public execute = (
    sprite: Sprite
    //now: number,
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ) => {
    const BUTTON_REBOUND_DELAY = 100000,
      SECOND_BEE_EXPLOSION_DELAY = 700; // milliseconds

    if (!sprite.detonating) {
      // trigger
      return;
    }

    sprite.artist.SetCellIndex(1); // flatten the button
    const bees = this.bees;
    const explode = this.explode;
    const setTimeRate = this.setTimeRate;
    this.explode(bees[5]);

    setTimeout(function () {
      explode(bees[6]);
      setTimeRate(0.1);
    }, SECOND_BEE_EXPLOSION_DELAY);

    sprite.detonating = false; // reset trigger

    setTimeout(function () {
      sprite.artist.SetCellIndex(0); // rebound
    }, BUTTON_REBOUND_DELAY);
  };
}
