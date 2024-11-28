import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";
import * as fs from "fs";
import {CONFIG} from "../browser/common/config";
import {StartingGenerator} from "./generators/starting-generator";

export class Queue {
  players = [] as Player[];
  currentGame: Game;
  servers: (WebSocket | undefined)[] = [];
  path: string;

  constructor(path: string) {
    this.path = path;
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
          const player = new Player(payload.name, payload.key);
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
          console.log(`New player ${player.name} joined`);
          player.updateRatio();
        } else {
          console.log(`Previous player ${previous.name} > ${payload.name} joined`);
          previous.name = payload.name;
          previous.connect(ws);
          previous.updateRatio();
        }
        this.sendHighScoreToServer();
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
          playerArrow.arrow(payload, playerArrow.position, this.players.map(player => player.arrows).flat());
        }
        break;
      case 'server':
        this.servers.push(ws);
        this.sendQueueUpdate();
        this.sendGameToServer();
        this.sendHighScoreToServer();
        break;
    }
  }

  executeGame() {
    this.currentGame!.started = this.currentGame.players.length >= 1;
    this.currentGame!.execute(() => {
      this.sendCurrentScoreToServer();
      this.sendHighScoreToServer();
      this.sendGameToServer();
      this.sendQueueUpdate();
      this.asyncSave();
    });
    this.sendGameToServer();
    if (this.currentGame!.started) {
      setTimeout(() => this.executeGame(), CONFIG.GAME_LOOP_MS);
    } else {
      this.currentGame.clear();
      this.sendGameToServer();
    }
  }

  disconnect(ws: InstanceType<typeof WebSocket.WebSocket>) {
    this.players.find(player => player.ws === ws)?.disconnect();
    this.servers = this.servers.filter(server => server !== ws);
  }

  public sendGameToServer() {
    const state = JSON.stringify({type: 'game-state', state: this.currentGame?.state()});
    this.servers.forEach((ws) => ws?.send(state));
  }

  public sendQueueUpdate() {
    const state = JSON.stringify({
      type: 'queue-state',
      state: {...this.currentGame?.state()}
    });
    this.servers.forEach((ws) => ws?.send(state));
  }

  private sendCurrentScoreToServer() {
    const mostPlayedTime = Math.max(...this.players.map((p) => p.time));
    const mostEfficientRatio = Math.max(...this.players.map((p) => p.ratio));
    const leastEfficientRatio = Math.min(...this.players.map((p) => p.ratio));
    const state = JSON.stringify({
      type: 'game-score',
      state: {players: (this.currentGame?.players ?? []).map(player => player.state())},
      awards: {
        mostPlayed: this.players.find(p => p.time === mostPlayedTime)?.state(),
        mostEfficient: this.players.find(p => p.ratio === mostEfficientRatio)?.state(),
        leastEfficient: this.players.find(p => p.ratio === leastEfficientRatio)?.state(),
      }
    });
    this.servers.forEach((ws) => ws?.send(state));
  }

  private sendHighScoreToServer() {
    const state = JSON.stringify({type: 'score-state', state: this.state()});
    this.servers.forEach((ws) => ws?.send(state));
  }

  private state() {
    const list = [...this.players.map(player => player.state())];
    list.sort((p1, p2) => p2.total - p1.total);
    return {players: list.slice(0, 10)};
  }

  private asyncSave() {
    fs.writeFile(this.path, JSON.stringify(this.players.map(player => player.serializable())), 'utf8', (err) => {
      if (!err) {
        console.log(`State saved under ${this.path}`);
      } else {
        console.log('Cannot save', err);
      }
    });
  }

  doneWaiting() {
    this.players.forEach(pl => pl.stopWait());
  }
}
