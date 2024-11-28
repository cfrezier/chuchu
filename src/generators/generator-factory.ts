import {GameGenerator} from "./game-generator";
import {BaseGenerator} from "./base";
import {MouseManiaGenerator} from "./mouse-mania";
import {CatManiaGenerator} from "./cat-mania";
import {Player} from "../player";
import {StartingGenerator} from "./starting-generator";
import {HurryGenerator} from "./hurry";

export class GeneratorFactory {
  static allGenerators: any[] = [BaseGenerator, MouseManiaGenerator, CatManiaGenerator, HurryGenerator];

  static next(previous: GameGenerator, players: Player[]) {
    if(previous instanceof StartingGenerator) {
      return new BaseGenerator(players);
    }
    const possibleNextGenerators = GeneratorFactory.allGenerators.filter(generator => !(previous instanceof generator));
    return new possibleNextGenerators[Math.floor(Math.random() * possibleNextGenerators.length)](players);
  }
}