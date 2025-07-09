import {GameStrategy} from "./game-strategy";
import {BaseStrategy} from "./impl/base-strategy";
import {MouseMania} from "./impl/mouse-mania";
import {CatMania} from "./impl/cat-mania";
import {Player} from "../../player";
import {StartingStrategy} from "./impl/starting-strategy";
import {Hurry} from "./impl/hurry";
import {ManyWalls} from "./impl/many-wall";

export class StrategyFactory {
  static baseStrategy: any = BaseStrategy;
  static otherStrategies: any[] = [MouseMania, CatMania, Hurry, ManyWalls];

  static next(previous: GameStrategy, players: Player[]) {
    let strategy = null;
    switch (true) {
      case previous instanceof StartingStrategy:
      case !(previous instanceof BaseStrategy):
        strategy = new StrategyFactory.baseStrategy(players);
        break;
      default:
        strategy = new StrategyFactory.otherStrategies[Math.floor(Math.random() * 13982845) % StrategyFactory.otherStrategies.length](players);
    }
    strategy.applySpeedCorrection();
    console.log(`New Strategy: ${strategy.name} (${strategy.constructor.name})`);
    return strategy
  }
}