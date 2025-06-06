// Bot pour jouer automatiquement à Chuchu
// Place les flèches pour envoyer les souris dans ses goals et les chats dans les goals adverses

import {Game} from './game';
import {Mouse} from './game/mouse';
import {Cat} from './game/cat';
import {Player} from './player';
import {Goal} from "./game/impl/goal";
import {CONFIG} from "../browser/common/config";
import {Direction, DirectionUtils} from "./direction";
import {MovingObject} from "./game/moving-object";

export class Bot extends Player {
  private game: Game;
  private lastArrowTime: number = 0;
  private arrowCooldown: number = 1000;
  private pendingArrowDirection: 'up' | 'down' | 'left' | 'right' | null = null;

  constructor(game: Game, name: string = 'Bot') {
    super(name, name);
    this.game = game;
  }

  // Nouvelle méthode principale pour placer une flèche optimisée
  public play() {
    const now = Date.now();
    if (now - this.lastArrowTime < this.arrowCooldown) return;
    this.lastArrowTime = now;
    const mice: Mouse[] = this.game.currentStrategy.mouses;
    const cats: Cat[] = this.game.currentStrategy.cats;
    const myGoal: Goal | undefined = this.game.currentStrategy.goals.find(g => g.player.key === this.key);
    if (!myGoal) return;
    let best = this.findBestArrowPlacement(myGoal, mice, cats);
    if (!best) {
      // Si aucune case n'améliore l'espérance, essayer d'envoyer un chat vers un goal adverse
      let bestCatScore = -Infinity;
      let bestCatArrow: { x: number, y: number, direction: 'up' | 'down' | 'left' | 'right' } | null = null;
      // On cible les chats proches de notre goal
      for (const cat of cats) {
        // Pour chaque goal adverse
        for (const goal of this.game.currentStrategy.goals) {
          if (goal.player.key === this.key) continue;
          // Calculer la direction vers le goal adverse
          const dx = goal.position[0] - cat.position[0];
          const dy = goal.position[1] - cat.position[1];
          let dir: 'up' | 'down' | 'left' | 'right';
          if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'right' : 'left';
          } else {
            dir = dy > 0 ? 'down' : 'up';
          }
          // Placer une flèche sur la case devant le chat
          const gridSize = 15;
          const cellSizeX = CONFIG.GLOBAL_WIDTH / gridSize;
          const cellSizeY = CONFIG.GLOBAL_HEIGHT / gridSize;
          let col = Math.round(cat.position[0] / cellSizeX);
          let row = Math.round(cat.position[1] / cellSizeY);
          if (dir === 'left') col--;
          if (dir === 'right') col++;
          if (dir === 'up') row--;
          if (dir === 'down') row++;
          if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) continue;
          const x = (col + 0.5) * cellSizeX;
          const y = (row + 0.5) * cellSizeY;
          // Vérifier qu'il n'y a pas déjà une flèche ou un goal
          let blocked = false;
          for (const g of this.game.currentStrategy.goals) {
            if (typeof g.collides === 'function' && g.collides({
              position: [x, y],
              size: [cellSizeX, cellSizeY]
            } as MovingObject)) blocked = true;
          }
          for (const player of this.game.players) {
            for (const arrow of player.arrows) {
              if (Math.abs(x - arrow.position[0]) < cellSizeX / 2 && Math.abs(y - arrow.position[1]) < cellSizeY / 2) blocked = true;
            }
          }
          if (blocked) continue;
          // Score : plus le chat est proche du goal adverse, mieux c'est
          const dist = Math.abs(goal.position[0] - cat.position[0]) + Math.abs(goal.position[1] - cat.position[1]);
          const score = -dist;
          if (score > bestCatScore) {
            bestCatScore = score;
            bestCatArrow = {x: x / CONFIG.GLOBAL_WIDTH, y: y / CONFIG.GLOBAL_HEIGHT, direction: dir};
          }
        }
      }
      if (bestCatArrow) {
        best = bestCatArrow;
      }
    }
    if (best) {
      // 1. Envoie un message input pour placer la flèche (position en % de la taille de la grille)
      this.game.queue.processMsg({
        type: "input",
        x: best.x,
        y: best.y,
        key: this.key
      });
      // 2. Stocke la direction à utiliser au tick suivant
      this.pendingArrowDirection = best.direction;
    }
    // Si une direction est en attente, envoie le message arrow ce tick-ci
    if (this.pendingArrowDirection) {
      this.game.queue.processMsg({
        type: "arrow",
        direction: this.pendingArrowDirection,
        key: this.key
      });
      this.pendingArrowDirection = null;
    }
  }

  // Nouvelle méthode pour trouver la meilleure case autour du goal
  private findBestArrowPlacement(goal: Goal, mice: Mouse[], cats: Cat[]): {
    x: number,
    y: number,
    direction: 'up' | 'down' | 'left' | 'right'
  } | null {
    // On ne regarde que les cases autour du goal à un rayon de 1 à 5 cases
    const gridSize = 15;
    const cellSizeX = CONFIG.GLOBAL_WIDTH / gridSize;
    const cellSizeY = CONFIG.GLOBAL_HEIGHT / gridSize;
    let best = null;
    let bestScore = -Infinity;
    let bestDir: 'up' | 'down' | 'left' | 'right' = 'up';
    for (let radius = 1; radius <= 7; radius++) {
      for (const dir of DirectionUtils.list() as ('up' | 'down' | 'left' | 'right')[]) {
        const [dx, dy] = DirectionUtils.vector(dir);
        // Calcul de la position cible en indices de grille
        const col = Math.round((goal.position[0] + dx * radius * cellSizeX) / cellSizeX);
        const row = Math.round((goal.position[1] + dy * radius * cellSizeY) / cellSizeY);
        // On s'assure que la case est dans la grille
        if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) continue;
        // Position centrale de la case
        const x = (col + 0.5) * cellSizeX;
        const y = (row + 0.5) * cellSizeY;
        // Ne pas placer sur un goal (aucun goal, pas seulement le sien)
        let isOnGoal = false;
        for (const g of this.game.currentStrategy.goals) {
          if (typeof g.collides === 'function' && g.collides({position: [x, y], size: [cellSizeX, cellSizeY]} as MovingObject)) {
            isOnGoal = true;
            break;
          }
        }
        if (isOnGoal) continue;
        // Ne pas placer sur une flèche déjà présente
        let isOnArrow = false;
        for (const player of this.game.players) {
          for (const arrow of player.arrows) {
            if (Math.abs(x - arrow.position[0]) < cellSizeX / 2 && Math.abs(y - arrow.position[1]) < cellSizeY / 2) {
              isOnArrow = true;
              break;
            }
          }
          if (isOnArrow) break;
        }
        if (isOnArrow) continue;
        // Pour cette case, compter les souris qui vont passer dessus et leur direction
        let miceOnCell = 0;
        let miceNotToGoal = 0;
        let catsToGoal = 0;
        let dirCount: Record<'up' | 'down' | 'left' | 'right', number> = {up: 0, down: 0, left: 0, right: 0};
        // Liste des souris déjà dans le goal (à ne pas compter dans les calculs de placement)
        const miceAlreadyInGoal = mice.filter(mouse => typeof goal.collides === 'function' && goal.collides(mouse));
        for (const mouse of mice) {
          // Si la souris est déjà dans le goal du joueur, on l'ignore pour le placement de flèche
          if (miceAlreadyInGoal.includes(mouse)) continue;
          // Si la souris passe sur la case et va vers le goal, elle sera détournée
          if (typeof mouse.collides === 'function' && mouse.collides({position: [x, y], size: [cellSizeX, cellSizeY]} as MovingObject)) {
            miceOnCell++;
            if (mouse.direction && dirCount[mouse.direction] !== undefined) dirCount[mouse.direction]++;
            // Est-ce que la souris va vers le goal ?
            const [mdx, mdy] = DirectionUtils.vector(mouse.direction);
            const toGoal = [goal.position[0] - mouse.position[0], goal.position[1] - mouse.position[1]];
            const dot = mdx * toGoal[0] + mdy * toGoal[1];
            if (dot < 0) miceNotToGoal++;
          }
        }
        // Pour cette case, compter les chats qui vont passer dessus et qui vont vers le goal
        for (const cat of cats) {
          if (typeof cat.collides === 'function' && cat.collides({position: [x, y], size: [cellSizeX, cellSizeY]} as MovingObject)) {
            const [cdx, cdy] = DirectionUtils.vector(cat.direction);
            const toGoal = [goal.position[0] - cat.position[0], goal.position[1] - cat.position[1]];
            const dot = cdx * toGoal[0] + cdy * toGoal[1];
            if (dot > 0) catsToGoal++;
          }
        }
        if (miceOnCell === 0 && catsToGoal === 0) continue;
        // Calcul de l'espérance de points si on détourne les souris/chats passant sur cette case
        let miceExpected = 0;
        let catsExpected = 0;
        let penalty = 0;
        for (const mouse of mice) {
          // Si la souris est déjà dans le goal du joueur, on ne la compte pas ici
          if (miceAlreadyInGoal.includes(mouse)) continue;
          // Si la souris passe sur la case et va vers le goal, elle sera détournée
          if (typeof mouse.collides === 'function' && mouse.collides({position: [x, y], size: [cellSizeX, cellSizeY]} as MovingObject)) {
            const [mdx, mdy] = DirectionUtils.vector(mouse.direction);
            const toGoal = [goal.position[0] - mouse.position[0], goal.position[1] - mouse.position[1]];
            const dot = mdx * toGoal[0] + mdy * toGoal[1];
            if (dot > 0) continue; // détournée, ne va plus au goal
          }
          // Sinon, on regarde si elle va vers le goal
          const [mdx, mdy] = DirectionUtils.vector(mouse.direction);
          const toGoal = [goal.position[0] - mouse.position[0], goal.position[1] - mouse.position[1]];
          const dot = mdx * toGoal[0] + mdy * toGoal[1];
          if (dot > 0) {
            // Vérifier si la souris passe sur un goal adverse ou rencontre un mur avant d'atteindre le goal du bot
            let crossesAdverseGoal = false;
            let blockedByWall = false;
            for (let t = 1; t <= 20; t++) {
              const px = mouse.position[0] + mdx * t * (toGoal[0] / 20);
              const py = mouse.position[1] + mdy * t * (toGoal[1] / 20);
              // Vérifie les goals adverses
              for (const otherGoal of this.game.currentStrategy.goals) {
                if (otherGoal.player.key !== this.key && typeof otherGoal.collides === 'function' && otherGoal.collides({position: [px, py], size: [cellSizeX, cellSizeY]} as MovingObject)) {
                  crossesAdverseGoal = true;
                }
              }
              // Vérifie les murs
              for (const wall of this.game.currentStrategy.walls || []) {
                if (typeof wall.collides === 'function' && wall.collides({position: [px, py], size: [cellSizeX, cellSizeY]} as MovingObject)) {
                  blockedByWall = true;
                }
              }
              if (crossesAdverseGoal || blockedByWall) break;
            }
            if (blockedByWall) {
              // La souris ne peut pas atteindre le goal, on ne compte pas de point
              continue;
            } else if (crossesAdverseGoal) {
              penalty -= 2; // Pénalité forte
            } else {
              miceExpected++;
            }
          }
        }
        for (const cat of cats) {
          // Si le chat passe sur la case et va vers le goal, il sera détourné
          if (typeof cat.collides === 'function' && cat.collides({position: [x, y], size: [cellSizeX, cellSizeY]} as MovingObject)) {
            const [cdx, cdy] = DirectionUtils.vector(cat.direction);
            const toGoal = [goal.position[0] - cat.position[0], goal.position[1] - cat.position[1]];
            const dot = cdx * toGoal[0] + cdy * toGoal[1];
            if (dot > 0) continue; // détourné, ne va plus au goal
          }
          // Sinon, on regarde si il va vers le goal
          const [cdx, cdy] = DirectionUtils.vector(cat.direction);
          const toGoal = [goal.position[0] - cat.position[0], goal.position[1] - cat.position[1]];
          const dot = cdx * toGoal[0] + cdy * toGoal[1];
          if (dot > 0) catsExpected++;
        }
        // Espérance de points : +1 par souris, divisé par 2 par chat, pénalité si souris passe sur goal adverse avant le sien
        const expectedScore = (miceExpected + penalty) / Math.pow(2, catsExpected);
        if (expectedScore > bestScore) {
          bestScore = expectedScore;
          best = {x: x / CONFIG.GLOBAL_WIDTH, y: y / CONFIG.GLOBAL_HEIGHT, direction: 'up' as Direction};
          // On choisit la direction qui rapproche le plus du goal
          let minDist = Infinity;
          for (const d of DirectionUtils.list() as ('up' | 'down' | 'left' | 'right')[]) {
            const [ddx, ddy] = DirectionUtils.vector(d);
            const nx = x + ddx * cellSizeX;
            const ny = y + ddy * cellSizeY;
            const dist = Math.sqrt((goal.position[0] - nx) ** 2 + (goal.position[1] - ny) ** 2);
            if (dist < minDist) {
              minDist = dist;
              bestDir = d;
            }
          }
        }
      }
    }
    if (best) best.direction = bestDir;
    return best;
  }

  // Détermine si un objet passera près de la case (x, y) en suivant sa direction
  private isOnPath(obj: Mouse | Cat, x: number, y: number): boolean {
    const objX = obj.position[0];
    const objY = obj.position[1];
    // Utilise DirectionUtils.vector pour obtenir le vecteur de direction
    const [objDx, objDy] = DirectionUtils.vector(obj.direction);
    // On simule le mouvement de l'objet sur quelques pas
    for (let t = 0; t < 10; t++) {
      const px = objX + objDx * t * 6; // 6px par pas
      const py = objY + objDy * t * 6;
      if (Math.abs(px - x) < 12 && Math.abs(py - y) < 12) return true;
    }
    return false;
  }
}

