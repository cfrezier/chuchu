import {Player} from "../../../player";
import {Goal} from "../../../game/impl/goal";
import {Geometry} from "../../../geometry";
import {CONFIG} from "../../../../browser/common/config";

export class RandomPlacement {
  static implement(players: Player[]): Goal[] {
    return players.map(player => {
      const cell = Geometry.randomCell();
      const cellPosition = [(cell[0] / CONFIG.COLUMNS) * CONFIG.GLOBAL_WIDTH, (cell[1] / CONFIG.ROWS) * CONFIG.GLOBAL_HEIGHT] as [number, number];
      return new Goal(cellPosition, 'U', player)
    })
  }
}