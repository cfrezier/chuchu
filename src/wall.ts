import {NonMovingObject} from "./game/non-moving-object";
import {Direction} from "./direction";

export class Wall extends NonMovingObject {

  intersectLine(direction: Direction): [[number, number], [number, number]] {
    switch (direction) {
      case "left":
        return [[this.position[0] + this.size[0] / 2, this.position[1] - this.size[1] / 2], [this.position[0] + this.size[1] / 2, this.position[1] + this.size[1] / 2]];
      case "right":
        return [[this.position[0] - this.size[0] / 2, this.position[1] - this.size[1] / 2], [this.position[0] - this.size[1] / 2, this.position[1] + this.size[1] / 2]];
      case "up":
        return [[this.position[0] - this.size[0] / 2, this.position[1] + this.size[1] / 2], [this.position[0] + this.size[1] / 2, this.position[1] + this.size[1] / 2]];
      case "down":
        return [[this.position[0] + this.size[0] / 2, this.position[1] - this.size[1] / 2], [this.position[0] - this.size[1] / 2, this.position[1] - this.size[1] / 2]];
      default:
        console.warn("Default intersectLine");
        return [[this.position[0] + this.size[0] / 2, this.position[1] - this.size[1] / 2], [this.position[0] - this.size[1] / 2, this.position[1] - this.size[1] / 2]];
    }
  }

}