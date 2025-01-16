import {GameStrategy} from "./game-strategy";
import {BaseStrategy} from "./strategy/base-strategy";
import {MouseMania} from "./strategy/mouse-mania";
import {CatMania} from "./strategy/cat-mania";
import {Player} from "../../player";
import {StartingStrategy} from "./strategy/starting-strategy";
import {Hurry} from "./strategy/hurry";
import {ManyWalls} from "./strategy/many-wall";

export class StrategyFactory {
  static baseStrategy: any = BaseStrategy;
  static otherStrategies: any[] = [MouseMania, CatMania, Hurry, ManyWalls];

  static next(previous: GameStrategy, players: Player[]) {
    switch (true) {
      case previous instanceof StartingStrategy:
      case !(previous instanceof BaseStrategy):
        return new StrategyFactory.baseStrategy(players);
      default:
        return new StrategyFactory.otherStrategies[Math.floor(Math.random() * 13982845) % StrategyFactory.otherStrategies.length](players);
    }
  }
}