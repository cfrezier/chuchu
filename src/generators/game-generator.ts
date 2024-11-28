import {Mouse} from "../game/mouse";
import {Cat} from "../game/cat";
import {Goal} from "../game/goal";
import {Wall} from "../wall";
import {MovingObject} from "../game/moving-object";
import {GoalsFactory} from "./goals-factory";
import {Player} from "../player";
import {CONFIG} from "../../browser/common/config";
import {WallsFactory} from "./walls-factory";
import {Direction} from "../direction";
import {Geometry} from "../geometry";

export abstract class GameGenerator {
  mouses: Mouse[] = [];
  cats: Cat[] = [];
  goals: Goal[] = [];
  walls: Wall[] = [];
  mouseSpeed: number = 1;
  catSpeed: number = 1;
  elapsedSteps = 0;
  stepsDuration = CONFIG.STEP_DURATION * 2;
  name: string = '---';
  mouseStartingPoints: [number, number][];
  mouseStartingDirections: Direction[];
  catStartingPoints: [number, number][];
  catStartingDirections: Direction[];
  startDate: number;

  abstract _step(index: number): void;

  protected constructor(players: Player[]) {
    this.goals = GoalsFactory.create(players);
    this.walls = WallsFactory.create();
    this.goals.forEach(goal => {
      this.walls.forEach(wall => {
        if(goal.collides(wall)) {
          this.walls = this.walls.filter(w => w !== wall);
        }
      });
    });
    this.mouseStartingPoints = new Array(Math.round((Math.random() * 1000 % 4) + 2)).fill(1).map(() => Geometry.randomCell());
    this.mouseStartingDirections = this.mouseStartingPoints.map(() => Geometry.randomDirection());
    this.catStartingPoints = new Array(Math.round((Math.random() * 1000 % 2) + 1)).fill(1).map(() => Geometry.randomCell());
    this.catStartingDirections = this.catStartingPoints.map(() => Geometry.randomDirection());
    this.startDate = Date.now();
  }

  step(): void {
    this.elapsedSteps++;
    this._step(this.elapsedSteps);
  };

  state() {
    return {
      mouses: this.mouses.map(m => m.state()),
      cats: this.cats.map(c => c.state()),
      goals: this.goals.map(g => g.state()),
      walls: this.walls.map(w => w.state()),
      name: this.name
    }
  }

  remove(absorbed: MovingObject[]) {
    this.mouses = this.mouses.filter(mouse => !absorbed.includes(mouse));
    this.cats = this.cats.filter(cat => !absorbed.includes(cat));
  }

  hasEnded() {
    return this.elapsedSteps >= this.stepsDuration;
  }

  generateMouses() {
    this.mouseStartingPoints.forEach((point, idx) => {
      this.mouses.push(new Mouse([point[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, point[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], this.mouseStartingDirections[idx]));
    });
  }

  generateCats() {
    this.catStartingPoints.forEach((point, idx) => {
      this.cats.push(new Cat([point[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, point[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], this.catStartingDirections[idx]));
    });
  }

  reward(players: Player[]) {
    const elapsed = Math.round(new Date().getTime() - (this.startDate ?? 0)) / 1000;
    console.log('elapsed', elapsed);
    players.forEach((player) => player.reward(elapsed));
  }

  unapply(player: Player) {
    this.goals = this.goals.filter(goal => goal.player.key !== player.key);
    this.reward([player]);
  }
}