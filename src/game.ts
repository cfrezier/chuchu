import {Player} from "./player";
import {Queue} from "./queue";
import {CONFIG} from "../browser/common/config";
import {GameGenerator} from "./generators/game-generator";
import {GeneratorFactory} from "./generators/generator-factory";
import {StartingGenerator} from "./generators/starting-generator";

export class Game {
  players: Player[] = [];
  queue: Queue;
  started: boolean = false;
  ready = false;
  currentGenerator: GameGenerator;
  phases = 1;

  constructor(queue: Queue) {
    this.queue = queue;
    this.currentGenerator = new StartingGenerator();
  }

  apply(player: Player) {
    if (!this.players.filter(player => player.connected).find(playerInGame => playerInGame.key === player.key)) {
      this.players.push(player);
      player.init(this.players.length - 1);
      player.queued();
      console.log(this.players.map(pl => pl.state()));
      if (this.players.length >= 1) {
        console.log('starting game execution...')
        this.queue.doneWaiting();
        this.queue.executeGame();
        this.queue.sendQueueUpdate();
      }
      this.queue.sendGameToServer();
    }
  }

  unapply(player: Player) {
    if (this.players.find(playerInGame => playerInGame.key === player.key)) {
      this.players = this.players.filter(playerInGame => playerInGame.key !== player.key);
      this.currentGenerator.unapply(player);
      player.canQueue();
      if (this.players.length === 0) {
        this.started = false;
        console.log('Game stopped');
      }
      this.queue.sendGameToServer();
      this.queue.sendQueueUpdate();
    }
  }

  state() {
    return {
      players: this.players.map(player => player.state()).sort((p1, p2) => p1.points - p2.points),
      generator: this.currentGenerator.state(),
      width: CONFIG.GLOBAL_WIDTH,
      height: CONFIG.GLOBAL_HEIGHT,
      started: this.started,
      ready: this.ready,
    }
  }

  execute(changeScoreListener: () => void) {
    let sendUpdate = false;

    this.currentGenerator.mouses.forEach(mouse => mouse.move(this.currentGenerator.walls, this.players.map(player => player.arrows), this.currentGenerator.mouseSpeed));
    this.currentGenerator.cats.forEach(cat => cat.move(this.currentGenerator.walls, this.players.map(player => player.arrows), this.currentGenerator.catSpeed));
    this.currentGenerator.goals.map(goal => {
      const absorbed = goal.absorbing([...this.currentGenerator.mouses, ...this.currentGenerator.cats]);
      if (absorbed && absorbed.length > 0) {
        absorbed.forEach(absorbedObject => goal.player.absorb(absorbedObject));
        this.currentGenerator.remove(absorbed);
        sendUpdate = true;
      }
    });

    this.currentGenerator.mouses.forEach(mouse => {
      this.currentGenerator.cats.forEach(cat => {
        if (mouse.collides(cat)) {
          this.currentGenerator.remove([mouse]);
        }
      });
    });

    [...this.currentGenerator.mouses, ...this.currentGenerator.cats].forEach(mouse => {
      this.players.forEach(player => {
        player.arrows.forEach(arrow => {
          if (arrow.collides(mouse)) {
            mouse.direction = arrow.direction;
          }
        });
      });
    });

    // Phase Management
    this.currentGenerator.step();
    if (this.currentGenerator.hasEnded()) {
      this.currentGenerator = GeneratorFactory.next(this.currentGenerator, this.players);
      this.players.forEach(player => player.arrows = []);
      this.phases++;
      this.currentGenerator.reward(this.players);
      sendUpdate = true;
    }

    if (sendUpdate) {
      changeScoreListener();
    }
  }

  clear() {
    this.currentGenerator = new StartingGenerator();
  }
}