import QueueDisplay from './queue.display';
import {ScoreDisplay} from "./score.display";
import {GameDisplay} from "./game.display";
import {QrCodeDisplay} from "./qrcode.display";
import {createWs} from '../common/ws';
import {CONFIG} from "../common/config";

const queue = new QueueDisplay();
const score = new ScoreDisplay();
const game = new GameDisplay();
const qrcode = new QrCodeDisplay();

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
        const payload = JSON.parse(event.data.toString());

        function decodeObj(arr: any[] = [], extra: any = {}) {
          return arr.map((o: any) => ({
            position: o.p,
            direction: o.d,
            color: o.c,
            ...extra
          }));
        }

        function decodeState(state: any) {
          return {
            ...lastGameState,
            players: state.p ? ((state.p).map((pl: any) => ({
              color: pl.c,
              name: pl.n,
              position: pl.p,
              total: pl.t,
              arrows: decodeObj(pl.a)
            }))) : lastGameState?.players,
            strategy: state.s ? {
              mouses: decodeObj(state.s.m),
              cats: decodeObj(state.s.c),
              goals: decodeObj(state.s.g),
              walls: decodeObj(state.s.w),
              name: state.s.n
            } : lastGameState?.strategy,
            width: state.w || lastGameState?.width,
            height: state.h || lastGameState?.height,
            started: state.st || lastGameState?.started,
            ready: state.r || lastGameState?.ready,
            cols: state.c || lastGameState?.cols,
            rows: state.ro || lastGameState?.rows
          };
        }

        // Appliquer la décompression si besoin
        if (payload.state) {
          payload.state = decodeState(payload.state);
          lastGameState = payload.state; // Mémoriser le dernier état du jeu
        }

        switch (payload.type) {
          case 'GAME_':
            game.display({state: payload.state});
            break;
          case 'QU_':
            queue.update(payload);
            break;
          case 'SC_':
            score.updateHighScore(payload);
            break;
        }
      });

      ws.addEventListener('close', (event) => {
        setTimeout(() => connect(), 1000);
      });
    }

    connect();
  })
})