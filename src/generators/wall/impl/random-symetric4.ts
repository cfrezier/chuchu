import {Wall} from "../../../wall";
import {Geometry} from "../../../geometry";
import {CONFIG} from "../../../../browser/common/config";
import {Goal} from "../../../game/impl/goal";

export class RandomSymetric4 {
  static implement(howMany: number, goals: Goal[]): Wall[] {
    const walls = [];
    for (let i = 0; i < howMany; i++) {
      const random = Geometry.randomCell();
      walls.push(new Wall([random[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, random[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], 'up'));
      walls.push(new Wall([CONFIG.GLOBAL_WIDTH - ((random[0] + 1) / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH), random[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], 'up'));
      walls.push(new Wall([CONFIG.GLOBAL_WIDTH - ((random[0] + 1) / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH), CONFIG.GLOBAL_HEIGHT - ((random[1] + 1) / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT)], 'up'));
      walls.push(new Wall([random[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, CONFIG.GLOBAL_HEIGHT - ((random[1] + 1) / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT)], 'up'));
    }
    return walls.filter(w => !goals.some(g => w.collides(g)));
  }
}