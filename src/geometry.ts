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
        return [Math.round(position[0]), Math.round(position[1] - speed)];
      case 'down':
        return [Math.round(position[0]), Math.round(position[1] + speed)];
      case 'left':
        return [Math.round(position[0] - speed), Math.round(position[1])];
      case 'right':
        return [Math.round(position[0] + speed), Math.round(position[1])];
      default:
        return [Math.round(position[0]), Math.round(position[1] - speed)];
    }
  }

  static intersects(segment1: [[number, number], [number, number]], segment2: [[number, number], [number, number]]) {
    // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
    const s1_x = segment1[1][0] - segment1[0][0];
    const s1_y = segment1[1][1] - segment1[0][1];
    const s2_x = segment2[1][0] - segment2[0][0];
    const s2_y = segment2[1][1] - segment2[0][1];

    const s = (-s1_y * (segment1[0][0] - segment2[0][0]) + s1_x * (segment1[0][1] - segment2[0][1])) / (-s2_x * s1_y + s1_x * s2_y);
    const t = (s2_x * (segment1[0][1] - segment2[0][1]) - s2_y * (segment1[0][0] - segment2[0][0])) / (-s2_x * s1_y + s1_x * s2_y);

    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
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

