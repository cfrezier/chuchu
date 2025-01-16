import {Player} from "./player";
import {Queue} from "./queue";
import {CONFIG} from "../browser/common/config";
import {GameStrategy} from "./generators/strategy/game-strategy";
import {StartingStrategy} from "./generators/strategy/impl/starting-strategy";
import {StrategyFactory} from "./generators/strategy/strategy-factory";

export class Game {
  players: Player[] = [];
  queue: Queue;
  started: boolean = false;
  ready = false;
  currentStrategy: GameStrategy;
  phases = 1;

  constructor(queue: Queue) {
    this.queue = queue;
    this.currentStrategy = new StartingStrategy();
  }

  apply(player: Player) {
    if (!this.players.filter(player => player.connected).find(playerInGame => playerInGame.key === player.key)) {
      if (this.players.length <= CONFIG.MAX_PLAYERS) {
        this.players.push(player);
        player.init(this.players.length - 1);
        player.queued();
        if (this.players.length >= 1) {
          console.log('starting game execution...')
          this.queue.doneWaiting();
          this.queue.executeGame();
          this.queue.sendQueueUpdate();
        }
        this.queue.sendGameToServer();
      } else {
        console.log('Game full');
        player.canQueue();
      }
    }
  }

  unapply(player: Player) {
    if (this.players.find(playerInGame => playerInGame.key === player.key)) {
      this.players = this.players.filter(playerInGame => playerInGame.key !== player.key);
      this.currentStrategy.unapply(player);
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
      players: this.players.map(player => player.state()).sort((p1, p2) => p1.total - p2.total),
      generator: this.currentStrategy.state(),
      width: CONFIG.GLOBAL_WIDTH,
      height: CONFIG.GLOBAL_HEIGHT,
      started: this.started,
      ready: this.ready,
    }
  }

  execute(changeScoreListener: () => void) {
    let sendUpdate = false;

    this.currentStrategy.mouses.forEach(mouse => mouse.move(this.currentStrategy.walls, this.players.map(player => player.arrows).flat(), this.currentStrategy.mouseSpeed));
    this.currentStrategy.cats.forEach(cat => cat.move(this.currentStrategy.walls, this.players.map(player => player.arrows).flat(), this.currentStrategy.catSpeed));
    this.currentStrategy.goals.map(goal => {
      const absorbed = goal.absorbing([...this.currentStrategy.mouses, ...this.currentStrategy.cats]);
      if (absorbed && absorbed.length > 0) {
        absorbed.forEach(absorbedObject => goal.player.absorb(absorbedObject));
        this.currentStrategy.remove(absorbed);
        sendUpdate = true;
      }
    });

    this.currentStrategy.mouses.forEach(mouse => {
      this.currentStrategy.cats.forEach(cat => {
        if (mouse.collides(cat)) {
          this.currentStrategy.remove([mouse]);
        }
      });
    });

    // Phase Management
    this.currentStrategy.step();
    if (this.currentStrategy.hasEnded()) {
      this.currentStrategy = StrategyFactory.next(this.currentStrategy, this.players);
      this.players.forEach(player => player.arrows = []);
      this.phases++;
      this.currentStrategy.reward(this.players);
      sendUpdate = true;
    }

    if (sendUpdate) {
      changeScoreListener();
    }
  }

  clear() {
    this.currentStrategy = new StartingStrategy();
  }
}