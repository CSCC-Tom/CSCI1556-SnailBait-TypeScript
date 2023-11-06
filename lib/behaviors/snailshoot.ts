import { Behavior } from "../behavior";
import { Sprite } from "../sprites";

export class SnailShootBehavior extends Behavior {
  private isSpriteInView: (sprite: Sprite) => boolean;
  constructor(is_sprite_in_view: (sprite: Sprite) => boolean) {
    super();
    this.isSpriteInView = is_sprite_in_view;
  }
  // sprite is the snail
  public execute = (
    sprite: Sprite
    //now: number,
    //fps: number,
    //context: CanvasRenderingContext2D,
    //lastAnimationFrameTime: number
  ): void => {
    const bomb = sprite.bomb,
      MOUTH_OPEN_CELL = 2;

    if (!this.isSpriteInView(sprite)) {
      return;
    }

    if (
      bomb &&
      !bomb.visible &&
      sprite.artist.GetCellIndex() === MOUTH_OPEN_CELL
    ) {
      bomb.left = sprite.left;
      bomb.visible = true;
    }
  };
}
