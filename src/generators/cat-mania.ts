import {CONFIG} from "../../browser/common/config";
import {Cat} from "../game/cat";
import {GameGenerator} from "./game-generator";
import {Player} from "../player";

export class CatManiaGenerator extends GameGenerator {
  constructor(players: Player[]) {
    super(players);
    this.name = 'Cat Mania';
    this.catSpeed = 2
  }

  _step(index: number) {
    if (index % (CONFIG.CLASSIC_STEP_GENERATION * 3) === 0) {
      this.generateCats();
    }
  }
}