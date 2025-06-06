import {Wall} from "../wall";
import {Arrow} from "./arrow";
import {MovingObject} from "./moving-object";
import {Direction} from "../direction";

export class NonMovingObject extends MovingObject {
  constructor(position: [number, number], direction: Direction) {
    super(position, direction);
  }

  override move(walls: Wall[], arrows: Arrow[], speed: number) {

  }
}