import fs from 'fs';
import {decodeServerMessage} from '../src/messages_pb';
import {Queue} from '../src/queue';
import {CONFIG} from '../browser/common/config';
import {WebSocket} from 'ws';

describe('Queue broadcast metadata', () => {
  const originalConfig = {...CONFIG};
  let dateNowSpy: jest.SpyInstance<number, []>;

  let readFileSpy: jest.SpyInstance;

  beforeAll(() => {
    readFileSpy = jest.spyOn(fs, 'readFile').mockImplementation(((path: any, callback: any) => {
      if (typeof callback === 'function') {
        callback(new Error('no-op'), null as unknown as Buffer);
      }
      return undefined as any;
    }) as any);
  });

  beforeEach(() => {
    Object.assign(CONFIG, {
      SERVER_BROADCAST_INTERVAL_MS: 50,
      GAME_LOOP_MS: 50,
      BASE_TICK_MS: 20,
      ADAPTIVE_FREQUENCY: false,
      BOTS: 0
    });

    dateNowSpy = jest.spyOn(Date, 'now');
  });

  afterEach(() => {
    Object.assign(CONFIG, originalConfig);
    dateNowSpy.mockRestore();
  });

  afterAll(() => {
    readFileSpy.mockRestore();
  });

  const createQueue = () => {
    const queue = new Queue('/tmp/ignore.json');
    queue.servers = [{
      sent: [] as Uint8Array[],
      send(buffer: Uint8Array) {
        (this as any).sent.push(buffer);
      }
    } as unknown as WebSocket];

    // Replace adaptive loop frequency getter for deterministic tick rate
    (queue as any).adaptiveLoop.getCurrentFrequency = () => CONFIG.GAME_LOOP_MS;

    // Provide deterministic game state snapshots
    queue.currentGame = {
      state: jest.fn(() => ({
        players: [],
        strategy: {
          mouses: [],
          cats: [],
          walls: [],
          goals: [],
          name: 'Test'
        },
        width: 100,
        height: 100,
        started: true,
        ready: true,
        cols: 10,
        rows: 10
      }))
    } as any;

    return queue;
  };

  const decodeSingleMessage = (queue: Queue) => {
    const server = queue.servers[0] as unknown as {sent: Uint8Array[]};
    expect(server.sent).toHaveLength(1);
    const payload = decodeServerMessage(server.sent[0]);
    return payload;
  };

  test('attaches authoritative metadata to first broadcast', () => {
    const queue = createQueue();

    dateNowSpy.mockReturnValueOnce(1_000);

    (queue as any).sendGameToServerInternal();

    const payload = decodeSingleMessage(queue);

    expect(payload.type).toBe('GAME_');
    expect(payload.game?.timestamp).toBe(1_000);
    expect(payload.game?.sequence).toBe(1);
    expect(payload.game?.tickRate).toBe(20); // 1000 / GAME_LOOP_MS
    expect(payload.game?.deltaMs).toBe(CONFIG.SERVER_BROADCAST_INTERVAL_MS);
  });

  test('increments sequence and delta on subsequent broadcast', () => {
    const queue = createQueue();

    dateNowSpy.mockReturnValueOnce(1_000);
    (queue as any).sendGameToServerInternal();
    // Clear captured message to focus on second broadcast
    (queue.servers[0] as any).sent = [];

    dateNowSpy.mockReturnValueOnce(1_090);
    (queue as any).sendGameToServerInternal();

    const payload = decodeSingleMessage(queue);

    expect(payload.game?.sequence).toBe(2);
    expect(payload.game?.deltaMs).toBe(90);
    expect(payload.game?.timestamp).toBe(1_090);
  });
});
