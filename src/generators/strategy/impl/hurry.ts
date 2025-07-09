import {CONFIG} from "../../../../browser/common/config";
import {GameStrategy} from "../game-strategy";
import {Player} from "../../../player";

export class Hurry extends GameStrategy {

  constructor(players: Player[]) {
    super(players);
    this.name = 'Hurry Up';
    this.mouseSpeed = 3;
    this.catSpeed = 2;
  }

  _step(index: number) {
    if (index % CONFIG.CLASSIC_STEP_GENERATION === 0) {
      this.generateMouses();
    }
    if (index % Math.round(CONFIG.CLASSIC_STEP_GENERATION * 20) === 0) {
      this.generateCats();
    }
  }
}