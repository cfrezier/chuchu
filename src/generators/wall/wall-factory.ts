import {Wall} from "../../wall";
import {RandomSymetric4} from "./impl/random-symetric4";
import {Goal} from "../../game/impl/goal";

export class WallFactory {
  static strategies: any[] = [RandomSymetric4];

  static create(goals: Goal[]): Wall[] {
    return WallFactory.strategies[Math.floor(Math.random() * 13982845) % WallFactory.strategies.length].implement(Math.floor(Math.random() * 1000 % 5), goals);
  }
}

