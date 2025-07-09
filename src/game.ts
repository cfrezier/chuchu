import {Player} from "./player";
import {Queue} from "./queue";
import {CONFIG} from "../browser/common/config";
import {GameStrategy} from "./generators/strategy/game-strategy";
import {StartingStrategy} from "./generators/strategy/impl/starting-strategy";
import {StrategyFactory} from "./generators/strategy/strategy-factory";
import {Bot} from './bot';

export class Game {
  players: Player[] = [];
  queue: Queue;
  started: boolean = false;
  ready = false;
  currentStrategy: GameStrategy;
  phases = 1;
  bots: Bot[] = [];
  private lastBotActionTime: number = 0;

  constructor(queue: Queue) {
    this.queue = queue;
    this.currentStrategy = new StartingStrategy();

    setTimeout(() => this.createBots(), 100);
  }

  createBots() {
    // Création automatique des bots selon CONFIG.BOTS
    for (let i = 0; i < CONFIG.BOTS; i++) {
      const botName = `Bot ${i + 1}`;
      const bot = new Bot(this, botName);
      // Message 'joined'
      this.queue.processMsg({
        type: 'joined',
        name: botName,
        key: bot.key,
        bot: true
      });
      // Message 'queue'
      this.queue.processMsg({
        type: 'queue',
        key: bot.key
      });
      console.log(`Bot ${i + 1} joined and queued.`);
      this.bots.push(bot);
    }
  }

  apply(player: Player) {
    if (!this.players.filter(player => player.connected).find(playerInGame => playerInGame.key === player.key)) {
      if (this.players.length <= CONFIG.MAX_PLAYERS) {
        this.players.push(player);
        player.init(this.players.length - 1);
        player.queued();
        if (this.players.length > CONFIG.MIN_PLAYERS) {
          console.log('starting game execution...')
          this.currentStrategy = StrategyFactory.next(this.currentStrategy, this.players);
          this.currentStrategy.applySpeedCorrection();
          this.queue.doneWaiting();
          this.queue.executeGame();
          this.queue.sendQueueUpdate();
        }
        this.size();
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
      this.size();
      this.queue.sendGameToServer();
      this.queue.sendQueueUpdate();
    }
  }

  state() {
    return {
      p: this.players.map(player => player.state()).sort((p1, p2) => p1.t - p2.t), // players
      s: this.currentStrategy.state(), // strategy
      w: CONFIG.GLOBAL_WIDTH, // width
      h: CONFIG.GLOBAL_HEIGHT, // height
      st: this.started, // started
      r: this.ready, // ready
      c: CONFIG.COLUMNS, // cols
      ro: CONFIG.ROWS // rows
    }
  }

  size() {
    let size = 15;
    if (this.players.length > 25) {
      size = 45;
    } else if (this.players.length > 20) {
      size = 41;
    } else if (this.players.length > 15) {
      size = 35;
    } else if (this.players.length > 10) {
      size = 31;
    } else if (this.players.length > 6) {
      size = 25;
    } else if (this.players.length > 3) {
      size = 21;
    } else {
      size = 15;
    }
    CONFIG.ROWS = size;
    CONFIG.COLUMNS = size;
  }

  execute(changeScoreListener: () => void) {
    let sendUpdate = false;

    // Limite globale d'action des bots
    const now = Date.now();
    const botCooldown = CONFIG.BOT_LIMIT_ACTIONS_MS || 1000;
    let canBotsAct = false;
    if (now - this.lastBotActionTime >= botCooldown) {
      canBotsAct = true;
      this.lastBotActionTime = now;
    }
    if (canBotsAct) {
      this.bots.forEach(bot => {
        bot.play();
      });
    }

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
      this.currentStrategy.reward(this.players);
      this.currentStrategy = StrategyFactory.next(this.currentStrategy, this.players);
      this.currentStrategy.applySpeedCorrection();
      this.players.forEach(player => player.arrows = []);
      this.phases++;
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
