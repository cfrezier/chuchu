import {CONFIG} from '../browser/common/config';
import {HybridPredictiveRenderer} from '../browser/server/netcode/hybrid-predictive-renderer';
import {GameDisplay} from '../browser/server/game.display';
import {GameState, PlayerState, StrategyState} from '../src/messages_pb';

describe('HybridPredictiveRenderer', () => {
  const originalConfig = {...CONFIG};

  beforeEach(() => {
    Object.assign(CONFIG, {
      RENDER_INTERPOLATION_DELAY_MS: 120,
      RENDER_MAX_PREDICTION_MS: 120,
      RENDER_BUFFER_MS: 800,
      SERVER_TICK_RATE: 20,
      BASE_TICK_MS: 20
    });
  });

  afterEach(() => {
    Object.assign(CONFIG, originalConfig);
  });

  const createRenderer = () => {
    const display: GameDisplay = {
      display: jest.fn()
    } as unknown as GameDisplay;

    return new HybridPredictiveRenderer(display) as unknown as Record<string, any>;
  };

  const player = (id: string, position: [number, number]): PlayerState => ({
    key: id,
    name: id,
    position: position.slice(),
    totalPoints: 0,
    arrows: []
  });

  const strategy = (mouses: Array<{position: [number, number]}>, cats: Array<{position: [number, number]}>) => ({
    mouses: mouses.map(mouse => ({ position: mouse.position.slice(), direction: 'R' })),
    cats: cats.map(cat => ({ position: cat.position.slice(), direction: 'U' })),
    walls: [],
    goals: [],
    name: 'test'
  }) as StrategyState;

  test('interpolates entity positions between snapshots', () => {
    const renderer = createRenderer();

    const previous: GameState = {
      players: [player('p1', [0, 0])],
      strategy: strategy([{position: [10, 10]}], []),
      timestamp: 1000,
      sequence: 1,
      tickRate: 20,
      deltaMs: 50
    };

    const next: GameState = {
      players: [player('p1', [100, 0])],
      strategy: strategy([{position: [110, 10]}], []),
      timestamp: 1100,
      sequence: 2,
      tickRate: 20,
      deltaMs: 50
    };

    const interpolated = renderer.interpolateStates(previous, next, 0.5) as GameState;

    expect(interpolated.players?.[0]?.position).toEqual([50, 0]);
    expect(interpolated.strategy?.mouses?.[0]?.position).toEqual([60, 10]);
    expect(interpolated.timestamp).toBeCloseTo(1050);
  });

  test('limits future prediction to configured window', () => {
    const renderer = createRenderer();

    const prevSnapshot = {
      state: {
        players: [player('p1', [0, 0])],
        strategy: strategy([{position: [0, 0]}], [])
      } as GameState,
      timestamp: 1_000,
      sequence: 1,
      deltaMs: 50,
      tickRate: 20
    };

    const latestSnapshot = {
      state: {
        players: [player('p1', [50, 0])],
        strategy: strategy([{position: [50, 0]}], [])
      } as GameState,
      timestamp: 1_100,
      sequence: 2,
      deltaMs: 50,
      tickRate: 20
    };

    renderer.stateBuffer.push(prevSnapshot, latestSnapshot);

    const targetTime = latestSnapshot.timestamp + 500; // Request far prediction
    const predicted = renderer.predictFutureState(latestSnapshot, targetTime) as GameState;

    // Prediction is capped to 120ms beyond latest snapshot timestamp
    const predictionWindow = Number(CONFIG.RENDER_MAX_PREDICTION_MS);
    expect(predicted.timestamp).toBe(latestSnapshot.timestamp + predictionWindow);

    // Player should be extrapolated forward along X axis proportionally
    const latestX = latestSnapshot.state.players?.[0]?.position?.[0] ?? 0;
    expect(predicted.players?.[0]?.position?.[0]).toBeGreaterThan(latestX);
    const baseDelta = latestSnapshot.timestamp - prevSnapshot.timestamp;
    const maxExpected = 50 + (50 * (predictionWindow / baseDelta));
    expect(predicted.players?.[0]?.position?.[0]).toBeCloseTo(maxExpected, 5);
  });
});
