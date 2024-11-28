import {CONFIG} from "../../browser/common/config";
import {Wall} from "../wall";
import {Geometry} from "../geometry";

export class WallsFactory {
  static create(): Wall[] {
    return WallsInLineFactory.implement(Math.floor(Math.random() * 1000 % 5));
  }
}

export class WallsInLineFactory extends WallsFactory {
  static implement(howMany: number): Wall[] {
    const walls = [];
    for (let i = 0; i < howMany; i++) {
      const random = Geometry.randomCell();
      walls.push(new Wall([random[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, random[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], 'up'));
      walls.push(new Wall([CONFIG.GLOBAL_WIDTH - ((random[0] + 1) / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH), random[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], 'up'));
      walls.push(new Wall([CONFIG.GLOBAL_WIDTH - ((random[0] + 1) / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH), CONFIG.GLOBAL_HEIGHT - ((random[1] + 1) / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT)], 'up'));
      walls.push(new Wall([random[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, CONFIG.GLOBAL_HEIGHT - ((random[1] + 1) / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT)], 'up'));
    }
    return walls;
  }
}