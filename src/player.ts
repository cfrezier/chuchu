import {WebSocket} from "ws";
import {v4 as uuid} from 'uuid';
import {colors} from "./colors";
import {Arrow} from "./game/arrow";
import {MovingObject} from "./game/moving-object";
import {Cat} from "./game/cat";
import {Mouse} from "./game/mouse";
import {CONFIG} from "../browser/common/config";

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
    this.position = [payload.x * CONFIG.GLOBAL_WIDTH, payload.y * CONFIG.GLOBAL_HEIGHT];
  }

  state() {
    return {
      color: this.color,
      name: this.name,
      position: this.position,
      total: this.totalPoints,
      arrows: this.arrows.map(a => a.state())
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
      this.totalPoints = Math.round(this.totalPoints * 0.9);
    }
    if (absorbedObject instanceof Mouse) {
      this.totalPoints++;
    }
  }

  arrow(payload: {
    type: "arrow";
    direction: "up" | "down" | "left" | "right";
    key: string
  }, position: [number, number], arrows: FlatArray<Arrow[][], 1>[]) {
    if (this.arrows.length > 2) {
      this.arrows.shift();
    }
    const gridAligned = [Math.floor(position[0] / CONFIG.GLOBAL_WIDTH * CONFIG.COLUMNS) * CONFIG.GLOBAL_WIDTH / CONFIG.COLUMNS, Math.floor(position[1] / CONFIG.GLOBAL_HEIGHT * CONFIG.ROWS) * CONFIG.GLOBAL_HEIGHT / CONFIG.ROWS] as [number, number];
    const newArrow = new Arrow(gridAligned, payload.direction, this);
    if (!arrows.some(arrow => arrow.collides(newArrow))) {
      this.arrows.push(newArrow);
    }
  }
}