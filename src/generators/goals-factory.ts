import {Goal} from "../game/goal";
import {Player} from "../player";
import {CONFIG} from "../../browser/common/config";
import {Geometry} from "../geometry";

export class GoalsFactory {
  static create(players: Player[]): Goal[] {
    return GoalsInLineFactory.implement(players);
  }
}

export class GoalsInLineFactory extends GoalsFactory {
  static implement(players: Player[]): Goal[] {
    // TODO: generate a correct repartition of players in empty spaces, according to number of players
    return players.map(player => {
      const cell = Geometry.randomCell();
      const cellPosition = [(cell[0] / CONFIG.COLUMNS) * CONFIG.GLOBAL_WIDTH, (cell[1] / CONFIG.ROWS) * CONFIG.GLOBAL_HEIGHT] as [number, number];
      return new Goal(cellPosition, 'up', player)
    })
  }
}