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
  mouseImg2: HTMLImageElement;
  catImg: HTMLImageElement;
  catImg2: HTMLImageElement;
  wallImg: HTMLImageElement;
  goalImg: { [color: string]: HTMLImageElement } = {};
  cursorImg: { [color: string]: HTMLImageElement } = {};
  arrowImg: { [color: string]: HTMLImageElement } = {};
  ready: boolean = false;
  cellSize: [number, number] = [0, 0];
  useAlt: boolean = false;

  constructor() {
    this.mouseImg = new Image();
    this.mouseImg.src = "/img/mouse.svg";
    this.mouseImg2 = new Image();
    this.mouseImg2.src = "/img/mouse2.svg";
    this.catImg = new Image();
    this.catImg.src = "/img/cat.svg";
    this.catImg2 = new Image();
    this.catImg2.src = "/img/cat2.svg";
    this.wallImg = new Image();
    this.wallImg.src = "/img/wall.svg";

    colors.forEach((color) => {
      this.initImagesForColor(color);
    });

    setTimeout(() => this.init(), 100);
  }

  private initImagesForColor(color: string) {
    this.goalImg[color] = goalImg(color);
    this.cursorImg[color] = cursorImg(color);
    this.arrowImg[color] = arrowImg(color);
  }

  resize(cols: number, rows: number) {
    CONFIG.ROWS = rows ?? CONFIG.ROWS;
    CONFIG.COLUMNS = cols ?? CONFIG.COLUMNS;
    this.cellSize = [CONFIG.GLOBAL_WIDTH / CONFIG.ROWS, CONFIG.GLOBAL_HEIGHT / CONFIG.COLUMNS];
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

  previousPayload = {state: {players: []}};

  display(newPayload: any) {
    const payload = {...this.previousPayload, ...newPayload, state: {...this.previousPayload.state, ...newPayload.state}};

    this.resize(payload.state.cols, payload.state.rows);

    if (this.ready) {
      if (this.context) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }

      this.useAlt = Math.floor(Date.now() / 500) % 2 === 1;

      this.drawGrid();
      if (!!payload.state && !!payload.state.strategy) {
        this.drawStrategyName(payload.state);
        this.drawWalls(payload.state);
        this.drawMouses(payload.state);
        this.drawCats(payload.state);
        this.drawPlayers(payload.state);
      }
    }

    this.previousPayload = payload;
  }

  private drawMouses(state: any) {
    const img = this.useAlt ? this.mouseImg2 : this.mouseImg;
    (state.strategy.mouses ?? []).forEach((mouse: any) => {
      this.drawRotated(img, mouse.position[0], mouse.position[1], this.angleFor(mouse.direction, 'mouse'));
    });
  }

  private drawCats(state: any) {
    const img = this.useAlt ? this.catImg : this.catImg2;
    (state.strategy.cats ?? []).forEach((cat: any) => {
      this.drawRotated(img, cat.position[0], cat.position[1], this.angleFor(cat.direction, 'cat'));
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
      if (this.cursorImg[colors[player.colorIndex]] === undefined) {
        console.warn(`Cursor image for color ${colors[player.colorIndex]} not found.`);
        this.initImagesForColor(colors[player.colorIndex]);
      }
      this.context.drawImage(this.cursorImg[colors[player.colorIndex]], player.position[0], player.position[1], this.cellSize[0], this.cellSize[1]);
      //player arrows
      (player.arrows || []).forEach((arrow: any) => {
        this.drawRotated(this.arrowImg[colors[player.colorIndex]], arrow.position[0], arrow.position[1], this.angleFor(arrow.direction, 'arrow'));
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
        case 'U':
          return Math.PI / 2;
        case 'D':
          return -Math.PI / 2;
        case 'L':
          return 0;
        case 'R':
          return Math.PI;
      }
    } else if (type === 'cat') {
      return this.angleFor(direction, 'mouse') + Math.PI;
    }
    switch (direction) {
      case 'U':
        return 0;
      case 'D':
        return Math.PI;
      case 'L':
        return -Math.PI / 2;
      case 'R':
        return Math.PI / 2;
    }
  }

  private drawStrategyName(state: any) {
    this.context.fillStyle = "#a0ffff";
    this.context.font = "50px Arial";
    this.context.textAlign = "center";
    this.context.fillText(state.strategy.name, CONFIG.GLOBAL_HEIGHT / 2, 100);
  }
}
