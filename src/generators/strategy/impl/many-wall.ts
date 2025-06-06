import {CONFIG} from "../../../../browser/common/config";
import {Cat} from "../../../game/cat";
import {GameStrategy} from "../game-strategy";
import {Player} from "../../../player";
import {WallFactory} from "../../wall/wall-factory";

export class ManyWalls extends GameStrategy {
  constructor(players: Player[]) {
    super(players);
    this.name = 'Wall Valley';
    this.catSpeed = 5;
    this.mouseSpeed = 5;
    this.walls.push(...WallFactory.create(this.goals),...WallFactory.create(this.goals),...WallFactory.create(this.goals),)
  }

  _step(index: number) {
    if (index % (CONFIG.CLASSIC_STEP_GENERATION * 3) === 0) {
      this.generateMouses();
    }
  }
}