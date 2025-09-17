import QueueDisplay from './queue.display';
import {ScoreDisplay} from "./score.display";
import {GameDisplay} from "./game.display";
import {QrCodeDisplay} from "./qrcode.display";
import {createWs} from '../common/ws';
import {CONFIG} from "../common/config";
import {decodeServerMessage, ServerMessage} from '../../src/messages_pb';

/**
 * Optimiseur de rendu avec requestAnimationFrame pour synchroniser
 * le rendu avec le refresh rate de l'écran et éviter les redraw inutiles
 */
class OptimizedRenderer {
  private needsRedraw: boolean = false;
  private isRendering: boolean = false;
  private lastFrameTime: number = 0;
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / this.targetFPS;
  private gameDisplay: GameDisplay;
  private pendingGameState: any = null;

  constructor(gameDisplay: GameDisplay) {
    this.gameDisplay = gameDisplay;
    this.startRenderLoop();
  }

  private startRenderLoop() {
    const renderFrame = (currentTime: number) => {
      if (currentTime - this.lastFrameTime >= this.frameInterval) {
        if (this.needsRedraw && !this.isRendering && this.pendingGameState) {
          this.isRendering = true;
          this.gameDisplay.display(this.pendingGameState);
          this.needsRedraw = false;
          this.isRendering = false;
          this.lastFrameTime = currentTime;
        }
      }
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  }

  // Appelé par les WebSocket messages
  markForRedraw(gameState: any) {
    this.pendingGameState = gameState;
    this.needsRedraw = true;
  }

  // FPS adaptatif selon la charge (nombre d'entités)
  setTargetFPS(fps: number) {
    this.targetFPS = Math.max(15, Math.min(60, fps));
    this.frameInterval = 1000 / this.targetFPS;
  }

  // Adaptation automatique du FPS selon le contenu
  adaptFPSBasedOnGameState(gameState: any) {
    if (!gameState?.state?.strategy) return;

    const entityCount = (gameState.state.strategy.mouses?.length || 0) +
                       (gameState.state.strategy.cats?.length || 0) +
                       (gameState.state.players?.length || 0);

    // Plus d'entités = FPS plus bas pour maintenir les performances
    let adaptedFPS = 60;
    if (entityCount > 100) {
      adaptedFPS = 30;
    } else if (entityCount > 50) {
      adaptedFPS = 45;
    }

    this.setTargetFPS(adaptedFPS);
  }
}

const queue = new QueueDisplay();
const score = new ScoreDisplay();
const game = new GameDisplay();
const qrcode = new QrCodeDisplay();
const optimizedRenderer = new OptimizedRenderer(game);

let ws: WebSocket;
let lastGameState: any = null;

fetch('/config.json').then(config => {
  config.json().then(json => {
    // @ts-ignore
    Object.keys(json).forEach(key => CONFIG[key] = json[key])
    console.log(JSON.stringify(CONFIG), 4);
    const connect = () => {
      ws = createWs();

      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({type: 'server'}));
        qrcode.init();
      })

      ws.addEventListener("message", function (event) {
        let handlePayload = (payload: ServerMessage) => {
          switch (payload.type) {
            case 'GAME_':
              lastGameState = { ...lastGameState, ...payload.game};
              const gameState = {state: lastGameState};

              // Adaptation automatique du FPS selon la charge
              optimizedRenderer.adaptFPSBasedOnGameState(gameState);

              // Demander un redraw avec le nouveau système optimisé
              optimizedRenderer.markForRedraw(gameState);
              break;
            case 'QU_':
              queue.update(payload.queue);
              break;
            case 'SC_':
              score.updateHighScore(payload.score);
              break;
          }
        };
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function() {
            const arrayBuffer = reader.result as ArrayBuffer;
            const data = new Uint8Array(arrayBuffer);
            const payload = decodeServerMessage(data);
            handlePayload(payload);
          };
          reader.readAsArrayBuffer(event.data);
        } else if (event.data instanceof ArrayBuffer) {
          const data = new Uint8Array(event.data);
          const payload = decodeServerMessage(data);
          handlePayload(payload);
        } else if (event.data instanceof Uint8Array) {
          const payload = decodeServerMessage(event.data);
          handlePayload(payload);
        } else if (event.data.buffer instanceof ArrayBuffer) {
          const data = new Uint8Array(event.data.buffer);
          const payload = decodeServerMessage(data);
          handlePayload(payload);
        } else {
          // fallback JSON si besoin (pour compatibilité)
          try {
            const payload = JSON.parse(event.data.toString());
            handlePayload(payload);
          } catch (e) {
            console.error('Impossible de décoder le message WebSocket', e);
          }
        }
      });

      ws.addEventListener('close', (event) => {
        setTimeout(() => connect(), 1000);
      });
    }

    connect();
  })
})