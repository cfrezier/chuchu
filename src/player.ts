import {WebSocket} from "ws";
import {v4 as uuid} from 'uuid';
import {colors} from "./colors";
import {Arrow} from "./game/arrow";
import {MovingObject} from "./game/moving-object";
import {Cat} from "./game/cat";
import {Mouse} from "./game/mouse";
import {CONFIG} from "../browser/common/config";
import {PlayerState} from "./messages_pb";
import {Direction} from "./direction";

export class Player {
  connected = true;
  color: string = '#000000';
  name = 'Player';
  key: string;
  ws?: WebSocket;
  time: number = 0;

  position: [number, number] = [0, 0];
  arrows: Arrow[] = [];

  totalPoints = 0;
  ratio: number = 0;

  constructor(name: string, key?: string) {
    this.name = name;
    this.key = key ?? uuid();
  }

  connect(ws?: WebSocket) {
    this.connected = true;
    this.ws = ws;
  }

  init(idx: number) {
    this.color = colors[idx];
    this.updateRatio();
  }

  disconnect() {
    this.connected = false;
    this.ws = undefined;
  }

  move(payload: { type: "input"; x: number; y: number }) {
    this.position = [Math.round(payload.x * CONFIG.GLOBAL_WIDTH), Math.round(payload.y * CONFIG.GLOBAL_HEIGHT)];
  }

  state() {
    return {
      colorIndex: colors.indexOf(this.color),
      name: this.name,
      position: this.position,
      totalPoints: this.totalPoints,
      arrows: this.arrows.map(a => a.state()),
      key: this.key
    };
  }

  reward(time: number) {
    this.time += time;
    this.updateRatio();
    this.ws?.send(JSON.stringify({type: 'score', score: this.totalPoints}));
  }

  queued() {
    this.ws?.send(JSON.stringify({type: 'queued', color: this.color}));
  }

  stopWait() {
    this.ws?.send(JSON.stringify({type: 'wait-over', color: this.color}));
  }

  canQueue() {
    this.ws?.send(JSON.stringify({type: 'can-queue'}));
  }

  static from(playerObj: Player) {
    const player = new Player(playerObj.name, playerObj.key);
    player.totalPoints = playerObj.totalPoints;
    player.time = playerObj.time;
    player.connected = false;
    return player;
  }

  serializable() {
    return {
      totalPoints: this.totalPoints,
      time: this.time,
      name: this.name,
      key: this.key,
    };
  }

  public updateRatio() {
    this.ratio = (this.totalPoints) / (this.time + 1000);
  }

  absorb(absorbedObject: MovingObject) {
    if (absorbedObject instanceof Cat) {
      this.totalPoints = Math.round(this.totalPoints * CONFIG.PLAYER_ABSORB_CAT_RATIO);
    }
    if (absorbedObject instanceof Mouse) {
      this.totalPoints += CONFIG.PLAYER_ABSORB_MOUSE_POINTS;
    }
  }

  arrow(payload: {
    type: "arrow";
    direction: Direction;
    key: string
  }, position: [number, number], forbiddenPlaces: MovingObject[]) {
    if (this.arrows.length > 2) {
      this.arrows.shift();
    }
    const cellWidth = CONFIG.GLOBAL_WIDTH / CONFIG.COLUMNS;
    const cellHeight = CONFIG.GLOBAL_HEIGHT / CONFIG.ROWS;
    // Centrer l'input sur la case la plus proche
    const gridAligned = [
      Math.floor((position[0]) / cellWidth) * cellWidth,
      Math.floor((position[1]) / cellHeight) * cellHeight
    ] as [number, number];
    // Vérification : ne pas placer de flèche sur un wall, un goal ou une flèche d'un autre joueur
    const isOnForbiddenPlace = forbiddenPlaces.some(obj => {
      const dx = Math.abs(obj.position[0] - gridAligned[0]);
      const dy = Math.abs(obj.position[1] - gridAligned[1]);
      return dx < obj.norm && dy < obj.norm;
    });
    if (isOnForbiddenPlace) {
      return;
    }
    this.arrows.push(new Arrow(gridAligned, payload.direction, this));
  }
}
