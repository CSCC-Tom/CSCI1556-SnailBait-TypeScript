import { Behavior } from "../behavior";
import { Sprite, SpriteSheetArtist } from "../sprites";

export class SnailSprite extends Sprite {
  constructor(artist: SpriteSheetArtist, behaviors: Behavior[]) {
    super("snail", artist, behaviors);
  }
}
