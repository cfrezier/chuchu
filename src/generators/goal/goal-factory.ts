import {Goal} from "../../game/impl/goal";
import {RandomPlacement} from "./impl/random-placement";
import {Wall} from "../../wall";
import {EquiPlacement} from "./impl/equi-placement";

export class GoalFactory {

  static strategies: any[] = [EquiPlacement, RandomPlacement];

  static create(goals: Goal[]): Wall[] {
    return GoalFactory.strategies[Math.floor(Math.random() * 13982845) % GoalFactory.strategies.length].implement(Math.floor(Math.random() * 1000 % 5), goals);
  }
}

