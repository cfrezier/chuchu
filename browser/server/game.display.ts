import {CONFIG} from "../common/config";
import {colors} from "../../src/colors";
import {arrowImg, cursorImg, goalImg} from "./images";
import {Direction} from "../../src/direction";

export class GameDisplay {
  canvas!: HTMLCanvasElement;
  debug?: HTMLDivElement;
  context!: CanvasRenderingContext2D;
  size: number = 10;
  drawElement!: HTMLDivElement;
  mouseImg: HTMLImageElement;
  catImg: HTMLImageElement;
  wallImg: HTMLImageElement;
  goalImg: { [color: string]: HTMLImageElement } = {};
  cursorImg: { [color: string]: HTMLImageElement } = {};
  arrowImg: { [color: string]: HTMLImageElement } = {};
  ready: boolean = false;
  cellSize: [number, number] = [0, 0];

  constructor() {
    this.mouseImg = new Image();
    this.mouseImg.src = "/img/mouse.svg";
    this.catImg = new Image();
    this.catImg.src = "/img/cat.svg";
    this.wallImg = new Image();
    this.wallImg.src = "/img/wall.svg";

    colors.forEach((color, index) => {
      this.goalImg[color] = goalImg(color);
      this.cursorImg[color] = cursorImg(color);
      this.arrowImg[color] = arrowImg(color);
    });

    setTimeout(() => this.init(), 100);
  }

  init() {
    this.canvas = window.document.body.querySelector(".game-canvas")!;
    this.drawElement = window.document.body.querySelector("div.draw")!;
    this.context = this.canvas.getContext('2d')!;
    this.size = Math.min(this.drawElement.getBoundingClientRect().width, this.drawElement.getBoundingClientRect().height);
    this.canvas.width = CONFIG.GLOBAL_WIDTH;
    this.canvas.height = CONFIG.GLOBAL_HEIGHT;
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.debug = window.document.body.querySelector(".debug-game-state")!;
    this.cellSize = [CONFIG.GLOBAL_WIDTH / CONFIG.ROWS, CONFIG.GLOBAL_HEIGHT / CONFIG.COLUMNS];
    this.ready = true;
  }

  previousPayload = undefined;

  display(payload: any = this.previousPayload) {
    if (this.debug) {
      this.debug.innerText = JSON.stringify(payload.state);
    }

    if (this.ready) {
      if (this.context) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }

      this.previousPayload = payload;

      this.drawGrid();
      if (!!payload.state && !!payload.state.strategy) {
        this.drawstrategyName(payload.state);
        this.drawWalls(payload.state);
        this.drawMouses(payload.state);
        this.drawCats(payload.state);
        this.drawPlayers(payload.state);
      }
    }
  }

  private drawMouses(state: any) {
    state.strategy.mouses.forEach((mouse: any) => {
      this.drawRotated(this.mouseImg, mouse.position[0], mouse.position[1], this.angleFor(mouse.direction, 'mouse'));
    });
  }

  private drawCats(state: any) {
    state.strategy.cats.forEach((cat: any) => {
      this.drawRotated(this.catImg, cat.position[0], cat.position[1], this.angleFor(cat.direction, 'cat'));
    });
  }

  private drawPlayers(state: any) {
    // player goal
    state.strategy.goals.forEach((goal: any) => {
      this.context.drawImage(this.goalImg[goal.color], goal.position[0], goal.position[1], this.cellSize[0], this.cellSize[1]);
    });

    //player
    state.players.forEach((player: any) => {
      // player position
      this.context.fillStyle = "#FFFFFF";
      this.context.beginPath();
      this.context.arc(player.position[0], player.position[1], 3, 0, 2 * Math.PI, true);
      this.context.fill();


      this.context.drawImage(this.cursorImg[player.color], player.position[0], player.position[1], this.cellSize[0], this.cellSize[1]);
      //player arrows
      (player.arrows || []).forEach((arrow: any) => {
        this.drawRotated(this.arrowImg[player.color], arrow.position[0], arrow.position[1], this.angleFor(arrow.direction, 'arrow'));
      });
    });
  }

  private drawWalls(state: any) {
    state.strategy.walls.forEach((wall: any) => {
      this.context.drawImage(this.wallImg, wall.position[0], wall.position[1], this.cellSize[0], this.cellSize[1]);
    });
  }

  private drawGrid() {
    this.context.lineWidth = 1;
    this.context.strokeStyle = 'white';
    for (let i = 0; i < CONFIG.COLUMNS + 1; i++) {
      this.context.beginPath();
      this.context.moveTo((CONFIG.GLOBAL_WIDTH / CONFIG.COLUMNS) * i, 0);
      this.context.lineTo((CONFIG.GLOBAL_WIDTH / CONFIG.COLUMNS) * i, this.canvas.height);
      this.context.stroke();
    }
    for (let i = 0; i < CONFIG.ROWS + 1; i++) {
      this.context.beginPath();
      this.context.moveTo(0, (CONFIG.GLOBAL_HEIGHT / CONFIG.ROWS) * i);
      this.context.lineTo(this.canvas.width, (CONFIG.GLOBAL_HEIGHT / CONFIG.ROWS) * i);
      this.context.stroke();
    }
  }

  drawRotated(image: HTMLImageElement, positionX: number, positionY: number, angle: number) {
    const x = this.cellSize[0] / 2;
    const y = this.cellSize[1] / 2;
    this.context.save();
    this.context.translate(positionX + x, positionY + y);
    this.context.rotate(angle);
    this.context.translate(-x, -y);
    this.context.drawImage(image, 0, 0, this.cellSize[0], this.cellSize[1]);
    this.context.restore();
  }

  angleFor(direction: Direction, type: 'mouse' | 'cat' | 'arrow'): number {
    if (type === 'mouse') {
      switch (direction) {
        case 'up':
          return Math.PI / 2;
        case 'down':
          return -Math.PI / 2;
        case 'left':
          return 0;
        case 'right':
          return Math.PI;
      }
    } else if (type === 'cat') {
      return this.angleFor(direction, 'mouse') + Math.PI;
    }
    switch (direction) {
      case 'up':
        return 0;
      case 'down':
        return Math.PI;
      case 'left':
        return -Math.PI / 2;
      case 'right':
        return Math.PI / 2;
    }
  }

  private drawstrategyName(state: any) {
    this.context.fillStyle = "#a0ffff";
    this.context.font = "50px Arial";
    this.context.textAlign = "center";
    this.context.fillText(state.strategy.name, CONFIG.GLOBAL_HEIGHT / 2, 100);
  }
}