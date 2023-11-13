import { Behavior } from "../behavior";
import { CallbackFunction, TriggerFunction } from "../definitions";
import { Sprite, SpritesheetCell } from "../sprites";

export class CellSwitchBehavior extends Behavior {
  private cells: SpritesheetCell[];
  private trigger: TriggerFunction;
  private callback: CallbackFunction;
  private duration: number;
  constructor(
    cells: SpritesheetCell[],
    trigger: TriggerFunction,
    callback: CallbackFunction,
    duration: number = 1000
  ) {
    super();
    this.cells = cells;
    this.duration = duration;
    this.trigger = trigger;
    this.callback = callback;
  }

  public switchCells = (sprite: Sprite, now: number) => {
    sprite.originalCells = sprite.artist.cells;
    sprite.originalIndex = sprite.artist.GetCellIndex();

    sprite.switchStartTime = now;

    sprite.artist.cells = this.cells;
    sprite.artist.SetCellIndex(0);
  };

  public revert = (sprite: Sprite) => {
    if (sprite.originalCells !== undefined) {
      sprite.artist.cells = sprite.originalCells;
    }
    if (sprite.originalIndex !== undefined) {
      sprite.artist.SetCellIndex(sprite.originalIndex);
    }
    if (this.callback) {
      this.callback(sprite, this);
    }
  };

  public execute = (
    sprite: Sprite,
    now: number,
    fps: number,
    _context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ) => {
    if (
      this.trigger &&
      this.trigger(sprite, now, fps, lastAnimationFrameTime)
    ) {
      if (sprite.artist.cells !== this.cells) {
        this.switchCells(sprite, now);
      } else if (
        now - (sprite.switchStartTime ? sprite.switchStartTime : 0) >
        this.duration
      ) {
        this.revert(sprite);
      }
    }
  };
}
