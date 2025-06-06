import {NonMovingObject} from "./non-moving-object";
import {Player} from "../player";
import {Direction} from "../direction";

export class Arrow extends NonMovingObject {
  private player: Player;

  constructor(position: [number, number], direction: Direction, player: Player) {
    super(position, direction);
    this.player = player;
    this.norm = this.norm / 2;
  }

  override state() {
    return {
      position: this.position,
      direction: this.direction,
      color: this.player.color
    }
  }
}