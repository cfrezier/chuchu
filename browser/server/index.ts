import QueueDisplay from './queue.display';
import {ScoreDisplay} from "./score.display";
import {GameDisplay} from "./game.display";
import {QrCodeDisplay} from "./qrcode.display";
import {createWs} from '../common/ws';
import {CONFIG} from "../common/config";
import {decodeServerMessage, ServerMessage} from '../../src/messages_pb';
import {HybridPredictiveRenderer} from './netcode/hybrid-predictive-renderer';

const queue = new QueueDisplay();
const score = new ScoreDisplay();
const game = new GameDisplay();
const qrcode = new QrCodeDisplay();
const predictiveRenderer = new HybridPredictiveRenderer(game);

let ws: WebSocket;

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
              if (payload.game) {
                predictiveRenderer.handleServerUpdate(payload.game);
              }
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
