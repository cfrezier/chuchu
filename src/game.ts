import {Player} from "./player";
import {Queue} from "./queue";
import {CONFIG} from "../browser/common/config";
import {GameGenerator} from "./generators/game-generator";
import {GeneratorFactory} from "./generators/generator-factory";
import {StartingGenerator} from "./generators/starting-generator";

export class Game {
  players: Player[] = [];
  startDate?: number;
  queue: Queue;
  finished = false;
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
      if (this.players.length < CONFIG.MAX_PLAYERS) {
        this.players.push(player);
        this.players.forEach((player, idx, arr) => player.init(idx, arr));
        player.queued();
        this.checkForStartedBelow1Min();
      }
      if (this.players.length > (CONFIG.MIN_PLAYERS - 1) && !this.startDate) {
        console.log(`Starting in ${CONFIG.QUEUE_TIME}s`);
        player.queued();
        this.startDate = new Date().getTime() + 1000 * CONFIG.QUEUE_TIME;
        setTimeout(() => this.start(), 1000 * CONFIG.QUEUE_TIME);
        this.queue.initGame();
      }
      this.queue.sendGameToServer();
    }
  }

  start(retry = 0) {
    this.clearCheckTimer();
    this.ready = true;
    if (this.players.length >= CONFIG.MIN_PLAYERS) {
      this.started = true;
      this.queue.doneWaiting();
      this.queue.executeGame();
      this.startDate = new Date().getTime();
      this.queue.sendQueueUpdate();
    } else {
      console.log(`Not enough players... retry in ${CONFIG.RETRY_TIME}s`);
      this.startDate = new Date().getTime() + 1000 * CONFIG.QUEUE_TIME;
      this.queue.sendQueueUpdate();
      if (retry > 3) {
        console.log(`Clearing queue.`);
        this.queue.clear();
      } else {
        setTimeout(() => {
          console.log(`Retrying...`);
          this.start(retry + 1);
        }, CONFIG.RETRY_TIME * 1000);
      }
    }
  }

  state() {
    return {
      players: this.players.map(player => player.state()).sort((p1, p2) => p1.points - p2.points),
      generator: this.currentGenerator.state(),
      startDate: this.startDate,
      width: CONFIG.GLOBAL_WIDTH,
      height: CONFIG.GLOBAL_HEIGHT,
      finished: this.finished,
      started: this.started,
      ready: this.ready,
    }
  }

  reward() {
    const elapsed = Math.round(new Date().getTime() - (this.startDate ?? 0)) / 1000;
    console.log('elapsed', elapsed);
    this.players.forEach((player) => player.reward(elapsed));
  }

  checkTimer?: any;

  private checkForStartedBelow1Min() {
    this.clearCheckTimer();
    console.log('...setting check timer');
    this.checkTimer = setTimeout(() => {
      this.queue.clear();
    }, 60000);
  }

  clearCheckTimer() {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      console.log('...clearing check timer');
    }
  }

  execute(changeScoreListener: () => void) {
    this.currentGenerator.mouses.forEach(mouse => mouse.move(this.currentGenerator.walls, this.players.map(player => player.arrows), this.currentGenerator.mouseSpeed));
    this.currentGenerator.cats.forEach(cat => cat.move(this.currentGenerator.walls, this.players.map(player => player.arrows), this.currentGenerator.catSpeed));
    this.currentGenerator.goals.map(goal => {
      const absorbed = goal.absorbing([...this.currentGenerator.mouses, ...this.currentGenerator.cats]);
      if (absorbed && absorbed.length > 0) {
        absorbed.forEach(absorbedObject => goal.player.absorb(absorbedObject));
        this.currentGenerator.remove(absorbed);
        changeScoreListener();
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
    }

    if (this.phases > CONFIG.MAX_PHASES) {
      this.finished = true;
      this.reward();
    }

    if (this.finished) {
      this.players.forEach(player => player.canQueue());
    }
  }
}