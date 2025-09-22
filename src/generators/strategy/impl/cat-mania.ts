import {CONFIG} from "../../../../browser/common/config";
import {Cat} from "../../../game/cat";
import {GameStrategy} from "../game-strategy";
import {Player} from "../../../player";
import {WallFactory} from "../../wall/wall-factory";

export class CatMania extends GameStrategy {
  constructor(players: Player[]) {
    super(players);
    this.name = 'Cat Mania';
    this.catSpeedCases = 2;
    this.mouseStarts = [];
    this.walls = WallFactory.create([...this.goals, ...this.mouseStarts, ...this.catStarts]);
  }

  _step(index: number) {
    if (index % (CONFIG.CLASSIC_STEP_GENERATION * 3) === 0) {
      this.generateCats();
    }
  }
}