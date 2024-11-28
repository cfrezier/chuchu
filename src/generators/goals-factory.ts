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
    switch (players.length) {
      case 1:
        return [new Goal(Geometry.randomCell(), 'up', players[0])];
      case 2:
        const cell = Geometry.randomCell();
        return [
          new Goal(cell, 'up', players[0]),
          new Goal([CONFIG.GLOBAL_WIDTH - ((cell[0] + 1) / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH), CONFIG.GLOBAL_HEIGHT - ((cell[1] + 1) / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT)], 'up', players[1])
        ];
        // TODO: add more situations
    }

    return players.map((player, idx) => {
      const x = Math.round((CONFIG.GLOBAL_WIDTH / CONFIG.COLUMNS) * (idx + 1) * (players.length + 1));
      return new Goal([x, CONFIG.GLOBAL_HEIGHT / 2], 'up', player);
    });
  }
}