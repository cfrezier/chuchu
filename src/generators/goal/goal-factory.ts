import {EquiPlacement} from "./impl/equi-placement";
import {Player} from "../../player";
import {Goal} from "../../game/impl/goal";

export class GoalFactory {

  static strategies: any[] = [EquiPlacement];

  static create(players: Player[]): Goal[] {
    return GoalFactory.strategies[Math.floor(Math.random() * 13982845) % GoalFactory.strategies.length].implement(players);
  }
}

