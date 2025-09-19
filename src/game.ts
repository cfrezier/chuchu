import {Player} from "./player";
import {Queue} from "./queue";
import {CONFIG} from "../browser/common/config";
import {GameStrategy} from "./generators/strategy/game-strategy";
import {StartingStrategy} from "./generators/strategy/impl/starting-strategy";
import {StrategyFactory} from "./generators/strategy/strategy-factory";
import {Bot} from './bot';
import {GameState} from "./messages_pb";
import {PerformanceMonitor} from "./performance/performance-monitor";

export class Game {
  players: Player[] = [];
  queue: Queue;
  started: boolean = false;
  ready = false;
  currentStrategy: GameStrategy;
  phases = 1;
  bots: Bot[] = [];
  private lastBotActionTime: number = 0;
  private lastPerformanceLog: number = 0;

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

  state(): GameState {
    return {
      players: this.players.map(player => player.state()).sort((p1, p2) => p1.totalPoints! - p2.totalPoints!),
      strategy: this.currentStrategy.state(),
      width: CONFIG.GLOBAL_WIDTH,
      height: CONFIG.GLOBAL_HEIGHT,
      started: this.started,
      ready: this.ready,
      cols: CONFIG.COLUMNS,
      rows: CONFIG.ROWS
    };
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

  execute(deltaMs: number, changeScoreListener: () => void) {
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

    const baselineTickMs = CONFIG.BASE_TICK_MS ?? 20;
    const effectiveDelta = Math.max(deltaMs, 1);
    const clampedDelta = Math.min(effectiveDelta, baselineTickMs * 3);
    const speedMultiplier = clampedDelta / baselineTickMs;
    const activeArrows = this.players.map(player => player.arrows).flat();

    this.currentStrategy.mouses.forEach(mouse => {
      const speed = this.currentStrategy.mouseSpeed * 2; // TEST: sans speedMultiplier
      mouse.move(this.currentStrategy.walls, activeArrows, speed);
    });
    this.currentStrategy.cats.forEach(cat => {
      const speed = this.currentStrategy.catSpeed; // TEST: sans speedMultiplier
      cat.move(this.currentStrategy.walls, activeArrows, speed);
    });
    this.currentStrategy.goals.map(goal => {
      // Optimisation: utiliser SpatialGrid au lieu de tester toutes les souris
      const nearbyObjects = this.currentStrategy.spatialGrid.getNearbyObjects(goal);
      const absorbed = goal.absorbing(nearbyObjects);
      if (absorbed && absorbed.length > 0) {
        absorbed.forEach(absorbedObject => goal.player.absorb(absorbedObject));
        this.currentStrategy.remove(absorbed);
        sendUpdate = true;
      }
    });

    // Optimized collision detection using spatial partitioning
    const collisionStartTime = PerformanceMonitor.startTiming('collision-detection');
    const collisions = this.currentStrategy.findCollisions();
    PerformanceMonitor.endTiming('collision-detection', collisionStartTime);

    if (collisions.length > 0) {
      const mousesToRemove = collisions.map(([mouse, cat]) => mouse);
      this.currentStrategy.remove(mousesToRemove);
    }

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

    // Log performance statistics every 30 seconds
    const currentTime = Date.now();
    if (currentTime - this.lastPerformanceLog >= 30000) {
      this.lastPerformanceLog = currentTime;
      const spatialStats = this.currentStrategy.getSpatialGridStats();
      console.log(`🗺️ Spatial Grid Stats - Objects: ${spatialStats.totalObjects}, Cells: ${spatialStats.occupiedCells}/${spatialStats.totalCells}, Avg/Cell: ${spatialStats.averageObjectsPerCell.toFixed(1)}`);

      const perfStats = PerformanceMonitor.getStats('collision-detection');
      if (perfStats) {
        console.log(`⚡ Collision Detection - Avg: ${perfStats.average.toFixed(3)}ms, Min: ${perfStats.min.toFixed(3)}ms, Max: ${perfStats.max.toFixed(3)}ms`);
      }
    }
  }

  clear() {
    this.currentStrategy = new StartingStrategy();
  }
}
