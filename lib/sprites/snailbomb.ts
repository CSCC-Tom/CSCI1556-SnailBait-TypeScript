import { Behavior } from "../behavior";
import { Sprite, SpriteSheetArtist } from "../sprites";
import { SnailSprite } from "./snail";

export class SnailBombSprite extends Sprite {
  constructor(
    snail: SnailSprite,
    artist: SpriteSheetArtist,
    behaviors: Behavior[]
  ) {
    super("snail bomb", artist, behaviors);
    this.snail = snail;
  }
}
