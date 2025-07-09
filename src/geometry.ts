import {Direction} from "./direction";
import {CONFIG} from "../browser/common/config";

export class Geometry {
  static moving(position: [number, number], direction: Direction, speed: number): [number, number] {

    // align on grid on position with no speed
    switch (direction) {
      case 'up':
      case 'down':
        position[0] = Math.round(position[0] / CONFIG.GLOBAL_WIDTH * CONFIG.COLUMNS) * CONFIG.GLOBAL_WIDTH / CONFIG.COLUMNS;
        break;
      case 'left':
      case 'right':
        position[1] = Math.round(position[1] / CONFIG.GLOBAL_HEIGHT * CONFIG.ROWS) * CONFIG.GLOBAL_HEIGHT / CONFIG.ROWS;
        break;
    }

    switch (direction) {
      case 'up':
        return [position[0], position[1] - speed];
      case 'down':
        return [position[0], position[1] + speed];
      case 'left':
        return [position[0] - speed, position[1]];
      case 'right':
        return [position[0] + speed, position[1]];
      default:
        return [position[0], position[1] - speed];
    }
  }

  static vectorNorm(v: [number, number]) {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2))
  }

  static segmentNorm(s: [[number, number], [number, number]]) {
    const v = [s[1][0] - s[0][0], s[1][1] - s[0][1]] as [number, number];
    return Geometry.vectorNorm(v);
  }

  static randomCell(): [number, number] {
    const x = Math.floor(Math.random() * 1000 % (CONFIG.COLUMNS));
    const y = Math.floor(Math.random() * 1000 % (CONFIG.ROWS));
    return [x, y];
  }

  static randomDirection(): Direction {
    const directions = ['up', 'down', 'left', 'right'];
    return directions[Math.floor(Math.random() * 1000 % 4)] as Direction;
  }
}

