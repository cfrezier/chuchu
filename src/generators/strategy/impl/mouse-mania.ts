import {CONFIG} from "../../../../browser/common/config";
import {Mouse} from "../../../game/mouse";
import {Cat} from "../../../game/cat";
import {GameStrategy} from "../game-strategy";
import {Player} from "../../../player";
import {WallFactory} from "../../wall/wall-factory";

export class MouseMania extends GameStrategy {
  constructor(players: Player[]) {
    super(players);
    this.name = 'Mouse Mania';
    this.mouseSpeedCases = 2;
    this.catStarts = [];
    this.walls = WallFactory.create([...this.goals, ...this.mouseStarts, ...this.catStarts]);
  }

  _step(index: number) {
    if (index % Math.round(CONFIG.CLASSIC_STEP_GENERATION / 2) === 0) {
      this.generateMouses()
    }
  }
}