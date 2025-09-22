import {CONFIG} from "../../browser/common/config";
import {Wall} from "../wall";
import {Arrow} from "./arrow";
import {Geometry} from "../geometry";
import {Direction, DirectionUtils} from "../direction";

export class MovingObject {
  position: [number, number];
  direction: Direction;
  size: [number, number];
  norm: number;
  lastCollide: string = '----';

  constructor(position: [number, number], direction: Direction) {
    this.position = position;
    this.direction = direction;
    this.size = [CONFIG.GLOBAL_WIDTH / CONFIG.ROWS, CONFIG.GLOBAL_HEIGHT / CONFIG.COLUMNS];
    this.norm = Geometry.vectorNorm(this.size) / 2;
  }

  move(walls: Wall[], arrows: Arrow[], speed: number) {
    // Calculer la position cible avant déplacement
    const nextPosition = Geometry.moving(this.position, this.direction, speed);
    let collidedWall: Wall | null = null;

    // Vérifier collision avec les murs sur la position cible
    walls
      .filter(w => w.wallId !== this.lastCollide)
      .forEach(wall => {
        // On crée un objet temporaire à la position cible pour tester la collision
        const tempObj = { position: nextPosition, norm: this.norm } as MovingObject;
        if (wall.collides(tempObj)) {
          collidedWall = wall;
        }
      });

    if (collidedWall) {
      // Tourner avant d'entrer dans le mur
      this.direction = DirectionUtils.next(this.direction);
      this.lastCollide = (collidedWall as Wall).wallId;
      // On ne déplace pas dans le mur
    } else {
      // Déplacement normal
      this.position = nextPosition;
      this.lastCollide = "-----";
    }

    // Gestion des flèches
    arrows.forEach(arrow => {
      if (arrow.collides(this)) {
        this.direction = arrow.direction;
        this.lastCollide = "-----";
      }
    });

    // Gestion des bords
    if (this.position[0] < 0) {
      this.position[0] = 0;
      this.direction = DirectionUtils.next(this.direction);
      this.lastCollide = "-----";
    } else if (this.position[0] > CONFIG.GLOBAL_WIDTH - this.size[0] + 3) {
      this.position[0] = Math.round(CONFIG.GLOBAL_WIDTH - this.size[0]);
      this.direction = DirectionUtils.next(this.direction);
      this.lastCollide = "-----";
    } else if (this.position[1] < 0) {
      this.position[1] = 0;
      this.direction = DirectionUtils.next(this.direction);
      this.lastCollide = "-----";
    } else if (this.position[1] > CONFIG.GLOBAL_HEIGHT - this.size[1] + 3) {
      this.position[1] = Math.round(CONFIG.GLOBAL_HEIGHT - this.size[1]);
      this.direction = DirectionUtils.next(this.direction);
      this.lastCollide = "-----";
    }
  }

  collides(obj: MovingObject, tolerance: number = 0) {
    return Geometry.segmentNorm([this.position, obj.position]) < this.norm + tolerance;
  }

  state() {
    return {
      position: this.position, // position
      direction: this.direction // direction
    };
  }
}
