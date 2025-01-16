import {Wall} from "../../wall";
import {Goal} from "../../game/goal";
import {RandomSymetric4} from "./impl/random-symetric4";

export class WallFactory {
  static strategies: any[] = [RandomSymetric4];

  static create(goals: Goal[]): Wall[] {
    return WallFactory.strategies[0].implement(Math.floor(Math.random() * 1000 % 5), goals);
  }
}

