import {NonMovingObject} from "../non-moving-object";
import {Player} from "../../player";
import {Direction} from "../../direction";
import {Geometry} from "../../geometry";
import {MovingObject} from "../moving-object";

export class Goal extends NonMovingObject {
  norm: number;
  normSquared: number;
  player: Player;

  constructor(position: [number, number], direction: Direction, player: Player) {
    super(position, direction);
    this.norm = Geometry.vectorNorm(this.size) / 2;
    this.normSquared = this.norm * this.norm;
    this.player = player;
  }

  absorbing(objects: MovingObject[]) {
    return objects.filter((obj) => {
      const dx = this.position[0] - obj.position[0];
      const dy = this.position[1] - obj.position[1];
      const distanceSquared = dx * dx + dy * dy;
      return distanceSquared < this.normSquared;
    });
  }

  override state() {
    return {
      position: this.position, // position
      direction: this.direction, // direction
      color: this.player.color // color
    }
  }
}