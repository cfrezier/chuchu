import {NonMovingObject} from "./game/non-moving-object";
import {Direction} from "./direction";
import {v4} from "uuid";
import {Geometry} from "./geometry";

export class Start extends NonMovingObject {
  startId: string;

  constructor(position: [number, number], direction: Direction) {
    super(position.map(p => Math.round(p)) as [number, number], direction);
    this.startId = v4();
  }

}