import {GameGenerator} from "./game-generator";
import {BaseGenerator} from "./base";
import {MouseManiaGenerator} from "./mouse-mania";
import {CatManiaGenerator} from "./cat-mania";
import {Player} from "../player";
import {StartingGenerator} from "./starting-generator";
import {HurryGenerator} from "./hurry";
import {ManyWallsGenerator} from "./hurt-wall";

export class GeneratorFactory {
  static allGenerators: any[] = [BaseGenerator, MouseManiaGenerator, CatManiaGenerator, HurryGenerator, ManyWallsGenerator];

  static next(previous: GameGenerator, players: Player[]) {
    if(previous instanceof StartingGenerator) {
      return new GeneratorFactory.allGenerators[0](players);
    }
    const possibleNextGenerators = GeneratorFactory.allGenerators.filter(generator => !(previous instanceof generator));
    return new possibleNextGenerators[Math.floor(Math.random() * 13982845) % possibleNextGenerators.length](players);
  }
}