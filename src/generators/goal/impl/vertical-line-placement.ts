import {Player} from "../../../player";
import {Goal} from "../../../game/impl/goal";
import {CONFIG} from "../../../../browser/common/config";
import {GoalFactory} from "../goal-factory";

export class VerticalLinePlacement {
  static implement(players: Player[]): Goal[] {
    if (Math.random() > 0.5) {
      const cellsInSplit = Math.floor(CONFIG.COLUMNS / players.length);
      return players.map((player, index) => new Goal(GoalFactory.cellNumToPosition([cellsInSplit / 2 + index * cellsInSplit, (CONFIG.ROWS / 2)]), 'up', player));
    } else {
      const cellsInSplit = Math.floor(CONFIG.ROWS / players.length);
      return players.map((player, index) => new Goal(GoalFactory.cellNumToPosition([(CONFIG.COLUMNS / 2), cellsInSplit / 2 + index * cellsInSplit]), 'up', player));
    }
  }
}