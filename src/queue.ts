import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";
import * as fs from "fs";
import {CONFIG} from "../browser/common/config";
import {Bot} from "./bot";
import { encodeServerMessage, ServerMessage } from './messages_pb';

/**
 * Optimiseur de batching WebSocket pour éviter les envois redondants
 * Regroupe les mises à jour similaires et évite les envois multiples par frame
 */
class WebSocketBatcher {
  private pendingUpdates = new Set<string>();
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 5; // ms - délai minimal entre envois
  private queue: Queue;

  constructor(queue: Queue) {
    this.queue = queue;
  }

  /**
   * Programme une mise à jour pour envoi groupé
   */
  scheduleUpdate(updateType: 'game' | 'queue' | 'highscore') {
    this.pendingUpdates.add(updateType);

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushUpdates();
      }, this.BATCH_DELAY);
    }
  }

  /**
   * Envoi immédiat pour les mises à jour critiques
   */
  sendImmediate(updateType: 'game' | 'queue' | 'highscore') {
    this.pendingUpdates.add(updateType);
    this.flushUpdates();
  }

  /**
   * Traite et envoie toutes les mises à jour en attente
   */
  private flushUpdates() {
    if (this.pendingUpdates.has('game')) {
      this.queue.sendGameToServerInternal();
    }
    if (this.pendingUpdates.has('queue')) {
      this.queue.sendQueueUpdateInternal();
    }
    if (this.pendingUpdates.has('highscore')) {
      this.queue.sendHighScoreToServerInternal();
    }

    this.pendingUpdates.clear();
    this.batchTimer = null;
  }

  /**
   * Force l'envoi de toutes les mises à jour en attente (pour cleanup)
   */
  flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.flushUpdates();
    }
  }
}

/**
 * Gestionnaire de fréquence adaptative pour optimiser les performances
 * selon le nombre de joueurs et d'entités dans le jeu
 */
class AdaptiveGameLoop {
  private currentFrequency: number = CONFIG.GAME_LOOP_MS;

  /**
   * Calcule la fréquence optimale basée sur la charge du jeu
   */
  calculateOptimalFrequency(playerCount: number, entityCount: number): number {
    if (!CONFIG.ADAPTIVE_FREQUENCY) {
      return CONFIG.GAME_LOOP_MS;
    }

    // Formule adaptative : plus de joueurs/entités = fréquence plus lente
    const baseFrequency = CONFIG.GAME_LOOP_MIN_MS;

    // Facteur basé sur le nombre de joueurs (moins critique)
    const playerFactor = Math.floor(playerCount / 8) * 5;

    // Facteur basé sur le nombre d'entités (plus critique)
    const entityFactor = Math.floor(entityCount / 50) * 3;

    // Calcul de la fréquence avec contraintes min/max
    const calculatedFrequency = baseFrequency + playerFactor + entityFactor;

    this.currentFrequency = Math.max(
      CONFIG.GAME_LOOP_MIN_MS,
      Math.min(CONFIG.GAME_LOOP_MAX_MS, calculatedFrequency)
    );

    return this.currentFrequency;
  }

  /**
   * Retourne la fréquence actuelle
   */
  getCurrentFrequency(): number {
    return this.currentFrequency;
  }

  /**
   * Log des informations de performance (pour debug)
   */
  logPerformanceInfo(playerCount: number, entityCount: number): void {
    if (CONFIG.ADAPTIVE_FREQUENCY) {
      console.log(`[AdaptiveLoop] Players: ${playerCount}, Entities: ${entityCount}, Frequency: ${this.currentFrequency}ms (${Math.round(1000/this.currentFrequency)} FPS)`);
    }
  }
}

export class Queue {
  players = [] as Player[];
  currentGame: Game;
  servers: (WebSocket | undefined)[] = [];
  path: string;
  lastSave: string = '[]';
  savePlanned = false;
  private adaptiveLoop: AdaptiveGameLoop;
  private batcher: WebSocketBatcher;
  private lastSentGameState: any = null;
  private lastBroadcastTime = 0;
  private broadcastSequence = 0;
  private lastSnapshot: any = null;
  private lastTickTime: number = Date.now();

  constructor(path: string) {
    this.path = path;
    this.adaptiveLoop = new AdaptiveGameLoop();
    this.batcher = new WebSocketBatcher(this);
    fs.readFile(this.path, 'utf8', (err, data) => {
      if (err) {
        console.error('Cannont initialize', err);
      } else {
        this.players = JSON.parse(data).map((playerObj: Player) => Player.from(playerObj));
      }
    });
    this.currentGame = new Game(this);
  }

  processMsg(payload: DataMsg, ws?: WebSocket) {
    switch (payload.type) {
      case 'joined':
        const previous = this.players.find((player) => payload.key === player.key);
        if (!previous) {
          let player;
          if (payload.bot) {
            // Si c'est un bot, on va chercher l'instance déjà créée dans le jeu
            player = this.currentGame.players.find((p) => p.key === payload.key);
            if (!player) {
              player = new Bot(this.currentGame, payload.name);
            }
          } else {
            player = new Player(payload.name, payload.key);
          }
          this.players.push(player);
          ws?.send(
              JSON.stringify({
                type: 'key',
                payload: {
                  key: player.key
                }
              })
          );
          player.connect(ws);
          console.log(`New ${payload.bot ? 'bot' : 'player'} ${player.name} joined`);
          player.updateRatio();
        } else {
          console.log(`Previous player ${previous.name} > ${payload.name} joined`);
          previous.name = payload.name;
          previous.connect(ws);
          previous.updateRatio();
        }
        this.sendHighScoreToServer();
        this.currentGame.size();
        break;
      case 'queue':
        const player = this.players.find((player) => payload.key === player.key);
        const playerInCurrentGame = this.currentGame?.players.find((player) => payload.key === player.key);

        if (!playerInCurrentGame && !!player) {
          console.log(`Adding Player ${player.name}`);
          this.currentGame.apply(player);
          this.sendQueueUpdate();
        }
        if (!!player && playerInCurrentGame) {
          //already in game
          player.queued();
          player.stopWait();
        }
        break;
      case 'quit':
        const playerQuitting = this.players.find((player) => payload.key === player.key);
        if (playerQuitting) {
          this.currentGame!.unapply(playerQuitting);
          console.log(`Player ${playerQuitting?.name} quitting`);
          this.currentGame.size();
        }
        break;
      case 'input':
        const playerInput = this.players.find((player) => payload.key === player.key);
        if (!!playerInput) {
          playerInput.move(payload)
        }
        break;
      case 'arrow':
        const playerArrow = this.players.find((player) => payload.key === player.key);
        if (!!playerArrow) {
          // Inclure uniquement les flèches des autres joueurs (pas du joueur actuel)
          const otherPlayersArrows = this.players
            .filter(p => p.key !== playerArrow.key)
            .map(player => player.arrows)
            .flat();

          const forbiddenPlaces = [
            ...otherPlayersArrows,
            ...this.currentGame.currentStrategy.goals,
            ...this.currentGame.currentStrategy.walls
          ];

          playerArrow.arrow(payload, playerArrow.position, forbiddenPlaces);
        }
        break;
      case 'server':
        this.servers.push(ws);
        // Send immediate state to newly connected server
        this.sendGameTo(ws!);
        this.batcher.sendImmediate('queue');
        this.batcher.sendImmediate('highscore');
        break;
    }
  }

  executeGame() {
    this.currentGame!.started = this.currentGame.players.length >= CONFIG.MIN_PLAYERS;
    const now = Date.now();
    const rawDelta = now - this.lastTickTime;
    const baselineTick = CONFIG.BASE_TICK_MS ?? 20;
    const fallbackDelta = CONFIG.SERVER_BROADCAST_INTERVAL_MS ?? CONFIG.GAME_LOOP_MS ?? baselineTick;
    const deltaMs = rawDelta > 0 ? rawDelta : fallbackDelta;
    this.lastTickTime = now;

    this.currentGame!.execute(deltaMs, () => {
      this.sendHighScoreToServer();
      this.sendGameToServer();
      this.sendQueueUpdate();
      this.asyncSave();
    });
    this.sendGameToServer();
    if (this.currentGame!.started) {
      // Calcul de la fréquence adaptative
      const playerCount = this.currentGame.players.filter(p => p.connected).length;
      const strategy = this.currentGame.currentStrategy;
      const entityCount = (strategy?.mouses?.length || 0) + (strategy?.cats?.length || 0);

      const optimalFrequency = this.adaptiveLoop.calculateOptimalFrequency(playerCount, entityCount);

      // Log pour debug (seulement si la fréquence change)
      if (optimalFrequency !== this.adaptiveLoop.getCurrentFrequency()) {
        this.adaptiveLoop.logPerformanceInfo(playerCount, entityCount);
      }

      setTimeout(() => this.executeGame(), optimalFrequency);
    } else {
      this.currentGame.clear();
      this.sendGameToServer();
    }
  }

  disconnect(ws: InstanceType<typeof WebSocket.WebSocket>) {
    this.players.find(player => player.ws === ws)?.disconnect();
    this.servers = this.servers.filter(server => server !== ws);
    // Flush pending updates before disconnect
    this.batcher.flush();
  }

  public sendGameToServer() {
    this.batcher.scheduleUpdate('game');
  }

  public sendGameToServerInternal() {
    const now = Date.now();
    const targetInterval = Math.max(CONFIG.SERVER_BROADCAST_INTERVAL_MS ?? 50, this.adaptiveLoop.getCurrentFrequency());
    if (this.lastBroadcastTime && now - this.lastBroadcastTime < targetInterval) {
      return;
    }

    const currentState = this.currentGame?.state();
    let diff: any = {};

    if (this.lastSentGameState) {
      for (const key in currentState) {
        // @ts-ignore
        if (JSON.stringify(currentState[key]) !== JSON.stringify(this.lastSentGameState[key])) {
          // @ts-ignore
          diff[key] = currentState[key];
        }
      }
    } else {
      diff = currentState;
    }

    const deltaMs = this.lastBroadcastTime ? now - this.lastBroadcastTime : targetInterval;
    this.broadcastSequence += 1;
    const tickRate = Math.round(1000 / this.adaptiveLoop.getCurrentFrequency());
    const metadata = {
      timestamp: now,
      sequence: this.broadcastSequence,
      deltaMs,
      tickRate
    };

    diff = { ...diff, ...metadata };

    this.lastSentGameState = currentState;
    this.lastBroadcastTime = now;
    this.lastSnapshot = { ...currentState, ...metadata };

    if (Object.keys(diff).length > 0) {
      const msg: ServerMessage = {
        type: 'GAME_',
        game: diff
      };
      const buffer = encodeServerMessage(msg);
      this.servers.forEach((ws) => ws?.send(buffer));
    }
  }

  public sendGameTo(ws: WebSocket) {
    if (!this.currentGame) return;
    const now = Date.now();
    const currentFrequency = this.adaptiveLoop.getCurrentFrequency();
    const tickRate = Math.round(1000 / currentFrequency);
    const deltaMs = this.lastBroadcastTime ? now - this.lastBroadcastTime : currentFrequency;
    const baseState = this.currentGame.state();

    const snapshot = this.lastSnapshot ?? { ...baseState, timestamp: now, sequence: this.broadcastSequence, deltaMs, tickRate };
    if (!this.lastSnapshot) {
      this.lastSnapshot = snapshot;
    }

    const msg: ServerMessage = {
      type: 'GAME_',
      game: snapshot
    };
    const buffer = encodeServerMessage(msg);
    ws.send(buffer);
  }

  public sendQueueUpdate() {
    this.batcher.scheduleUpdate('queue');
  }

  public sendQueueUpdateInternal() {
    if (!this.currentGame) return;
    const gameState = this.currentGame.state();
    const msg: ServerMessage = {
      type: 'QU_',
      queue: { state: gameState }
    };
    const buffer = encodeServerMessage(msg);
    this.servers.forEach((ws) => ws?.send(buffer));
  }

  public sendHighScoreToServer() {
    this.batcher.scheduleUpdate('highscore');
  }

  public sendHighScoreToServerInternal() {
    const scoreState = this.state();
    const msg: ServerMessage = {
      type: 'SC_',
      score: { players: scoreState.players }
    };
    const buffer = encodeServerMessage(msg);
    this.servers.forEach((ws) => ws?.send(buffer));
  }

  private state() {
    const list = [...this.players.map(player => player.state())];
    list.sort((p1, p2) => p2.totalPoints! - p1.totalPoints!);
    return {players: list.slice(0, 10)};
  }

  private asyncSave() {
    this.lastSave = JSON.stringify(this.players.map(player => player.serializable()));

    if (!this.savePlanned) {
      this.savePlanned = true;
      setTimeout(() => {
        fs.writeFile(this.path, this.lastSave, 'utf8', (err) => {
          this.savePlanned = false;
          if (!!err) {
            console.log('Cannot save state', err);
          }
        });
      }, 1000);
    }
  }

  doneWaiting() {
    this.players.forEach(pl => pl.stopWait());
  }
}
