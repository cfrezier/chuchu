import {Mouse} from "../../game/mouse";
import {Cat} from "../../game/cat";
import {Wall} from "../../wall";
import {MovingObject} from "../../game/moving-object";
import {GoalFactory} from "../goal/goal-factory";
import {Player} from "../../player";
import {CONFIG} from "../../../browser/common/config";
import {WallFactory} from "../wall/wall-factory";
import {Geometry} from "../../geometry";
import {Goal} from "../../game/impl/goal";
import {Start} from "../../start";

export abstract class GameStrategy {
  mouses: Mouse[] = [];
  cats: Cat[] = [];
  goals: Goal[] = [];
  walls: Wall[] = [];
  mouseSpeed: number = 1;
  catSpeed: number = 1;
  elapsedSteps = 0;
  stepsDuration = CONFIG.STEP_DURATION * 2;
  name: string = '---';
  mouseStarts: Start[] = [];
  catStarts: Start[] = [];
  startDate: number;

  abstract _step(index: number): void;

  protected constructor(players: Player[]) {
    this.goals = GoalFactory.create(players);
    this.mouseStarts = new Array(Math.round((Math.random() * 1000 % 4) + 2)).fill(1).map(() => new Start(Geometry.randomCell(), Geometry.randomDirection()));
    this.catStarts = new Array(Math.round((Math.random() * 1000 % 2) + 1)).fill(1).map(() => new Start(Geometry.randomCell(), Geometry.randomDirection()));
    this.walls = WallFactory.create([...this.goals, ...this.mouseStarts, ...this.catStarts]);
    this.startDate = Date.now();
  }

  step(): void {
    this.elapsedSteps++;
    this._step(this.elapsedSteps);
  };

  state() {
    return {
      m: this.mouses.map(m => m.state()), // mouses
      c: this.cats.map(c => c.state()), // cats
      g: this.goals.map(g => g.state()), // goals
      w: this.walls.map(w => w.state()), // walls
      n: this.name // name
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
    if (this.mouses.length < CONFIG.MAX_MOUSES) {
      this.mouseStarts.forEach((start) => {
        this.mouses.push(new Mouse([start.position[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, start.position[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], start.direction));
      });
    }
  }

  generateCats() {
    if (this.cats.length < CONFIG.MAX_CATS) {
      this.catStarts.forEach((start) => {
        this.cats.push(new Cat([start.position[0] / CONFIG.COLUMNS * CONFIG.GLOBAL_WIDTH, start.position[1] / CONFIG.ROWS * CONFIG.GLOBAL_HEIGHT], start.direction));
      });
    }
  }

  reward(players: Player[]) {
    const elapsed = Math.round(new Date().getTime() - (this.startDate ?? 0)) / 1000;
    players.forEach((player) => player.reward(elapsed));
  }

  unapply(player: Player) {
    this.goals = this.goals.filter(goal => goal.player.key !== player.key);
    this.reward([player]);
  }
}