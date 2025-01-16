import {CONFIG} from "../../../../browser/common/config";
import {Mouse} from "../../../game/mouse";
import {Cat} from "../../../game/cat";
import {GameStrategy} from "../game-strategy";
import {Player} from "../../../player";

export class MouseMania extends GameStrategy {
  constructor(players: Player[]) {
    super(players);
    this.name = 'Mouse Mania';
    this.mouseSpeed = 2
  }

  _step(index: number) {
    if (index % Math.round(CONFIG.CLASSIC_STEP_GENERATION / 2) === 0) {
      this.generateMouses()
    }
  }
}