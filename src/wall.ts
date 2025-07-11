import {NonMovingObject} from "./game/non-moving-object";
import {Direction} from "./direction";
import {v4} from "uuid";

export class Wall extends NonMovingObject {
  wallId: string;

  constructor(position: [number, number], direction: Direction) {
    super(position, direction);
    this.wallId = v4();
  }

  state() {
    return {
      position: this.position, // position
      direction: this.direction // direction
    };
  }

}