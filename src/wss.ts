import {WebSocket} from 'ws';
import {DataMsg} from "./data.message";
import {Queue} from "./queue";
import {CONFIG} from "../browser/common/config";

const wss = () => {
  const wss = new WebSocket.Server({port: CONFIG.WSS_PORT});
  const queue = new Queue(CONFIG.PATH as string);

  wss.on('connection', (ws) => {
    console.log('New client');
    let disconnectTimer: NodeJS.Timeout | null = null;
    let isServer = false;
    let allowLongServerView = false;
    let firstMsgReceived = false;

    ws.on('message', (data) => {
      const payload = JSON.parse(data.toString()) as DataMsg | {type?: string, allowLongServerView?: boolean};

      if (!firstMsgReceived) {
        if (payload.type === 'server') {
          isServer = true;
          allowLongServerView = !!payload.allowLongServerView;
          if (!allowLongServerView) {
            disconnectTimer = setTimeout(() => {
              ws.close(4000, 'Déconnexion automatique serveur après 3 minutes');
            }, 3 * 60 * 1000);
          }
        } else {
          // Client : timer 30 min
          disconnectTimer = setTimeout(() => {
            ws.close(4000, 'Déconnexion automatique client après 30 minutes');
          }, 30 * 60 * 1000);
        }
        firstMsgReceived = true;
      }

      queue.processMsg(payload as DataMsg, ws);
    });
    ws.on('close', () => {
      if (disconnectTimer) clearTimeout(disconnectTimer);
      queue.disconnect(ws);
    })
  });

  console.log(`WSS server listening on port http://0.0.0.0:${CONFIG.WSS_PORT}`);

  return wss;
}


export {wss};
