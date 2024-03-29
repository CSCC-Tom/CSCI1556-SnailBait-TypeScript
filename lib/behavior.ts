import { IBehavior } from "./definitions";
import { Sprite } from "./sprites";

export abstract class Behavior implements IBehavior {
  protected lastAdvance: number = 0;

  public abstract execute: (
    sprite: Sprite,
    now: number,
    fps: number,
    context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ) => void;
}
