import {Wall} from "../../wall";
import {RandomSymetric4} from "./impl/random-symetric4";
import {CONFIG} from "../../../browser/common/config";
import {NonMovingObject} from "../../game/non-moving-object";

export class WallFactory {
  static strategies: any[] = [RandomSymetric4];

  static create(goals: NonMovingObject[]): Wall[] {
    return WallFactory.strategies[Math.floor(Math.random() * 13982845) % WallFactory.strategies.length].implement(Math.ceil(Math.random() * 1000 % Math.floor(CONFIG.ROWS / 3)), goals);
  }
}

