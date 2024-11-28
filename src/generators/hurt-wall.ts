import {CONFIG} from "../../browser/common/config";
import {Cat} from "../game/cat";
import {GameGenerator} from "./game-generator";
import {Player} from "../player";
import {WallsFactory} from "./walls-factory";

export class ManyWallsGenerator extends GameGenerator {
  constructor(players: Player[]) {
    super(players);
    this.name = 'Wall Valley';
    this.catSpeed = 5;
    this.mouseSpeed = 5;
    this.walls.push(...WallsFactory.create(),...WallsFactory.create(),...WallsFactory.create(),)
  }

  _step(index: number) {
    if (index % (CONFIG.CLASSIC_STEP_GENERATION * 3) === 0) {
      this.generateMouses();
    }
  }
}