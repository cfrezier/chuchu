import {Player} from "./player";
import {Game} from "./game";
import {DataMsg} from "./data.message";
import {WebSocket} from "ws";
import * as fs from "fs";
import {CONFIG} from "../browser/common/config";
import {Bot} from "./bot";

export class Queue {
  players = [] as Player[];
  currentGame: Game;
  servers: (WebSocket | undefined)[] = [];
  path: string;
  lastSave: string = '[]';
  savePlanned = false;

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
          playerArrow.arrow(payload, playerArrow.position, [...this.players.map(player => player.arrows).flat(), ...this.currentGame.currentStrategy.goals]);
        }
        break;
      case 'server':
        this.servers.push(ws);
        this.sendQueueUpdate();
        this.sendGameTo(ws!);
        this.sendHighScoreToServer();
        break;
    }
  }

  executeGame() {
    this.currentGame!.started = this.currentGame.players.length >= CONFIG.MIN_PLAYERS;
    this.currentGame!.execute(() => {
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

  private previousGameState: any = null;

  public sendGameToServer() {
    const currentState = this.currentGame?.state();
    let diff: any = {};

    if (this.previousGameState) {
      for (const key in currentState) {
        // @ts-ignore
        if (JSON.stringify(currentState[key]) !== JSON.stringify(this.previousGameState[key])) {
          // @ts-ignore
          diff[key] = currentState[key];
        }
      }
    } else {
      diff = currentState;
    }

    this.previousGameState = currentState;

    if (Object.keys(diff).length > 0) {
      const state = JSON.stringify({type: 'GAME_', state: diff});
      this.servers.forEach((ws) => ws?.send(state));
    }
  }

  public sendGameTo(ws: WebSocket) {
    ws.send(JSON.stringify({type: 'GAME_', state: this.currentGame?.state()}));
  }

  public sendQueueUpdate() {
    const state = JSON.stringify({
      type: 'QU_',
      state: {...this.currentGame?.state()}
    });
    this.servers.forEach((ws) => ws?.send(state));
  }

  private sendHighScoreToServer() {
    const state = JSON.stringify({type: 'SC_', state: this.state()});
    this.servers.forEach((ws) => ws?.send(state));
  }

  private state() {
    const list = [...this.players.map(player => player.state())];
    list.sort((p1, p2) => p2.t - p1.t);
    return {p: list.slice(0, 10)};
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
