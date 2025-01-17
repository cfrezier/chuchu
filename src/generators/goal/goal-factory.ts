import {VerticalLinePlacement} from "./impl/vertical-line-placement";
import {Player} from "../../player";
import {Goal} from "../../game/impl/goal";
import {CONFIG} from "../../../browser/common/config";
import {HorizontalLinePlacement} from "./impl/horizontal-line-placement";
import {RandomPlacement} from "./impl/random-placement";

export class GoalFactory {

  static strategies: any[] = [VerticalLinePlacement, HorizontalLinePlacement, RandomPlacement];

  static create(players: Player[]): Goal[] {
    const shuffledPlayers = players.map(value => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}) => value);
    return GoalFactory.strategies[Math.floor(Math.random() * 13982845) % GoalFactory.strategies.length].implement(shuffledPlayers);
  }

  static cellNumToPosition(cellNums: [number, number]) {
    return [Math.floor(cellNums[0]) / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, Math.floor(cellNums[1]) / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT] as [number, number];
  }
}

