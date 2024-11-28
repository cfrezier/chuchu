import {CONFIG} from "../../browser/common/config";
import {Wall} from "../wall";
import {Arrow} from "./arrow";
import {Geometry} from "../geometry";
import {Direction, NextDirection} from "../direction";

export class MovingObject {
  position: [number, number];
  direction: Direction;
  size: [number, number];
  norm: number;

  constructor(position: [number, number], direction: Direction) {
    this.position = position;
    this.direction = direction;
    this.size = [CONFIG.GLOBAL_WIDTH / CONFIG.ROWS, CONFIG.GLOBAL_HEIGHT / CONFIG.COLUMNS];
    this.norm = Geometry.vectorNorm(this.size) / 2;
  }

  move(walls: Wall[], map: Arrow[][], speed: number) {
    walls.forEach(wall => {
      if (this.collides(wall)) {
        this.direction = NextDirection.next(this.direction);
        this.position = Geometry.moving(this.position, this.direction, speed);
      }
    });

    this.position = Geometry.moving(this.position, this.direction, speed);

    if (this.position[0] < 0) {
      this.position[0] = 0;
      this.direction = NextDirection.next(this.direction);
    } else if (this.position[0] > CONFIG.GLOBAL_WIDTH - this.size[0]) {
      this.position[0] = CONFIG.GLOBAL_WIDTH - this.size[0];
      this.direction = NextDirection.next(this.direction);
    } else if (this.position[1] < 0) {
      this.position[1] = 0;
      this.direction = NextDirection.next(this.direction);
    } else if (this.position[1] > CONFIG.GLOBAL_HEIGHT - this.size[1]) {
      this.position[1] = CONFIG.GLOBAL_HEIGHT - this.size[1];
      this.direction = NextDirection.next(this.direction);
    }
  }

  collides(obj: MovingObject) {
    return Geometry.segmentNorm([this.position, obj.position]) < this.norm;
  }

  state() {
    return {
      position: this.position,
      direction: this.direction
    }
  }
}