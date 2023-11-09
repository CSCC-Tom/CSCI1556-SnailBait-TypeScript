import { Sprite } from "./sprites";

export interface ObjectCoordinates {
  left: number;
  top: number;
}
export interface RectObject extends ObjectCoordinates {
  width: number;
  height: number;
}
export interface RectBoundaries extends ObjectCoordinates {
  right: number;
  bottom: number;
}

export type SpriteType =
  | "bat"
  | "bee"
  | "button"
  | "coin"
  | "platform"
  | "ruby"
  | "runner"
  | "sapphire"
  | "snail"
  | "snail bomb";

export interface IBehavior {
  pause?: (sprite: Sprite, now?: number) => void;
  unpause?: (sprite: Sprite, now?: number) => void;
  execute: (
    sprite: Sprite,
    now: number,
    fps: number,
    context: CanvasRenderingContext2D,
    lastAnimationFrameTime: number
  ) => void;
}

export const WaitABit = async (msToWait: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, msToWait));
};
