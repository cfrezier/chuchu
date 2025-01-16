import {NonMovingObject} from "../non-moving-object";
import {Player} from "../../player";
import {Direction} from "../../direction";
import {Geometry} from "../../geometry";
import {MovingObject} from "../moving-object";

export class Goal extends NonMovingObject {
  norm: number;
  player: Player;

  constructor(position: [number, number], direction: Direction, player: Player) {
    super(position, direction);
    this.norm = Geometry.vectorNorm(this.size) / 2;
    this.player = player;
  }

  absorbing(objects: MovingObject[]) {
    return objects.filter((obj) => Geometry.segmentNorm([this.position, obj.position]) < this.norm);
  }

  override state() {
    return {
      position: this.position,
      direction: this.direction,
      color: this.player.color
    }
  }
}