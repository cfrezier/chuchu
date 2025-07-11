import {Player} from "../../../player";
import {Goal} from "../../../game/impl/goal";
import {CONFIG} from "../../../../browser/common/config";
import {GoalFactory} from "../goal-factory";

export class HorizontalLinePlacement {
  static implement(players: Player[]): Goal[] {
    const cellsInSplit = Math.floor(CONFIG.COLUMNS / players.length);
    return players.map((player, index) => new Goal(GoalFactory.cellNumToPosition([cellsInSplit / 2 + index * cellsInSplit, (CONFIG.ROWS / 2)]), 'U', player));
  }
}