import {NonMovingObject} from "./non-moving-object";
import {Player} from "../player";
import {Direction} from "../direction";
import {MovingObject} from "./moving-object";

export class Arrow extends NonMovingObject {
  private player: Player;

  constructor(position: [number, number], direction: Direction, player: Player) {
    super(position, direction);
    this.player = player;
    this.norm = this.norm / 2;
  }

  override state() {
    return {
      p: this.position, // position
      d: MovingObject.encodeDirection(this.direction), // direction encodée
      c: this.player.color // color
    }
  }
}