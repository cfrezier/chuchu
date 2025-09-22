import {Mouse} from "../../game/mouse";
import {Cat} from "../../game/cat";
import {Wall} from "../../wall";
import {MovingObject} from "../../game/moving-object";
import {GoalFactory} from "../goal/goal-factory";
import {Player} from "../../player";
import {WallFactory} from "../wall/wall-factory";
import {Geometry} from "../../geometry";
import {Goal} from "../../game/impl/goal";
import {Start} from "../../start";
import {SpatialGrid} from "../../performance/spatial-grid";
import {CONFIG} from "../../../browser/common/config";

export abstract class GameStrategy {
  mouses: Mouse[] = [];
  cats: Cat[] = [];
  goals: Goal[] = [];
  walls: Wall[] = [];
  mouseSpeedCases: number = 1;
  catSpeedCases: number = 1;
  elapsedSteps = 0;
  name: string = '---';
  mouseStarts: Start[] = [];
  catStarts: Start[] = [];
  startDate: number;
  spatialGrid: SpatialGrid;
  mouseSpeed: number = 1;
  catSpeed: number = 1;

  abstract _step(index: number): void;

  protected constructor(players: Player[]) {
    this.applySpeedCorrection();
    this.goals = GoalFactory.create(players);

    // Calcul dynamique du nombre de mouseStarts et catStarts selon le nombre de joueurs
    const mouseStartCount = Math.max(1, Math.ceil(players.length / 1.5));
    const catStartCount = Math.max(1, Math.ceil(players.length / 3));

    this.mouseStarts = new Array(mouseStartCount).fill(1).map(() => new Start(Geometry.randomCell(), Geometry.randomDirection()));
    this.catStarts = new Array(catStartCount).fill(1).map(() => new Start(Geometry.randomCell(), Geometry.randomDirection()));
    this.walls = WallFactory.create([...this.goals, ...this.mouseStarts, ...this.catStarts]);
    this.startDate = Date.now();
    this.spatialGrid = new SpatialGrid();
  }

  /**
   * Corrige la vitesse des objets selon la taille des cases du plateau.
   * La vitesse de base de la stratégie (this.mouseSpeed/catSpeed) est ajustée dynamiquement.
   */
  applySpeedCorrection() {
    let speedFactor = 20;
    this.mouseSpeed = this.mouseSpeedCases * speedFactor;
    this.catSpeed = this.catSpeedCases * speedFactor;
    console.log(`GameStrategy: adjusted speeds mouseSpeed=${this.mouseSpeed}, catSpeed=${this.catSpeed}`);
    return;
  }

  step(): void {
    this.elapsedSteps++;
    this._step(this.elapsedSteps);
  };

  state() {
    return {
      mouses: this.mouses.map(m => m.state()), // mouses
      cats: this.cats.map(c => c.state()), // cats
      goals: this.goals.map(g => g.state()), // goals
      walls: this.walls.map(w => w.state()), // walls
      name: this.name // name
    }
  }

  remove(absorbed: MovingObject[]) {
    this.mouses = this.mouses.filter(mouse => !absorbed.includes(mouse));
    this.cats = this.cats.filter(cat => !absorbed.includes(cat));
  }

  hasEnded() {
    // Arrête la stratégie si la durée dépasse STEP_DURATION (en ms)
    return (Date.now() - (this.startDate ?? 0)) >= CONFIG.STEP_DURATION;
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

  /**
   * Optimized collision detection using spatial partitioning.
   * Returns pairs of [mouse, cat] that are colliding.
   */
  findCollisions(): [Mouse, Cat][] {
    const collisions: [Mouse, Cat][] = [];

    // Clear and populate spatial grid
    this.spatialGrid.clear();
    this.spatialGrid.optimizeCellSize(this.mouses.length + this.cats.length);

    // Insert all moving objects into spatial grid
    [...this.mouses, ...this.cats].forEach(obj => {
      this.spatialGrid.insert(obj);
    });

    // Check collisions only between nearby objects
    this.mouses.forEach(mouse => {
      const nearbyObjects = this.spatialGrid.getNearbyObjects(mouse);
      nearbyObjects.forEach(obj => {
        if (obj instanceof Cat && mouse.collides(obj)) {
          collisions.push([mouse, obj]);
        }
      });
    });

    return collisions;
  }

  /**
   * Gets spatial grid statistics for performance monitoring
   */
  getSpatialGridStats() {
    return this.spatialGrid.getStats();
  }
}