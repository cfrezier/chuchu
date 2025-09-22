import {CONFIG} from '../../common/config';
import {GameDisplay} from '../game.display';
import {GameState, PlayerState, StrategyState} from '../../../src/messages_pb';

type Snapshot = {
  state: GameState;
  timestamp: number;
  sequence: number;
  deltaMs: number;
  tickRate: number;
};

/**
 * Hybrid predictive renderer responsible for smoothing server updates
 * through interpolation and short-term prediction when needed.
 */
export class HybridPredictiveRenderer {
  private readonly gameDisplay: GameDisplay;
  private readonly stateBuffer: Snapshot[] = [];
  private authoritativeState: GameState = {};
  private targetFPS = 60;
  private frameInterval = 1000 / this.targetFPS;
  private lastFrameTime = 0;
  private serverTimeOffset: number | null = null;

  constructor(gameDisplay: GameDisplay) {
    this.gameDisplay = gameDisplay;
    this.startRenderLoop();
  }

  handleServerUpdate(partialState: GameState) {
    this.authoritativeState = this.mergeState(this.authoritativeState, partialState);

    const snapshotTimestamp = partialState.timestamp ?? Date.now();
    this.updateServerOffset(snapshotTimestamp);

    const snapshot: Snapshot = {
      state: this.cloneState(this.authoritativeState),
      timestamp: snapshotTimestamp,
      sequence: partialState.sequence ?? this.nextSequenceValue(),
      deltaMs: partialState.deltaMs ?? 0,
      tickRate: partialState.tickRate ?? this.defaultTickRate()
    };

    this.stateBuffer.push(snapshot);
    this.trimBuffer(snapshot.timestamp);
    this.updateTargetFps(snapshot.state);
  }

  private startRenderLoop() {
    const loop = () => {
      requestAnimationFrame(loop);
      const now = Date.now();
      if (now - this.lastFrameTime < this.frameInterval) {
        return;
      }

      const renderState = this.computeRenderState();
      if (renderState) {
        this.gameDisplay.display({state: renderState});
      }

      this.lastFrameTime = now;
    };

    requestAnimationFrame(loop);
  }

  private computeRenderState(): GameState | null {
    if (this.stateBuffer.length === 0) {
      return null;
    }

    if (this.serverTimeOffset === null) {
      return this.cloneState(this.stateBuffer[this.stateBuffer.length - 1].state);
    }

    const currentServerTime = Date.now() - this.serverTimeOffset;
    const targetTime = currentServerTime - this.interpolationDelay;
    const latest = this.stateBuffer[this.stateBuffer.length - 1];

    if (targetTime >= latest.timestamp) {
      return this.predictFutureState(latest, targetTime);
    }

    let previous = this.stateBuffer[0];
    let next = latest;

    for (const snapshot of this.stateBuffer) {
      if (snapshot.timestamp <= targetTime) {
        previous = snapshot;
      }
      if (snapshot.timestamp >= targetTime) {
        next = snapshot;
        break;
      }
    }

    if (previous === next || next.timestamp === previous.timestamp) {
      return this.cloneState(previous.state);
    }

    const factor = (targetTime - previous.timestamp) / (next.timestamp - previous.timestamp);
    return this.interpolateStates(previous.state, next.state, factor);
  }

  private predictFutureState(latest: Snapshot, targetTime: number): GameState {
    const previous = this.getPreviousSnapshot(latest.sequence);
    if (!previous) {
      return this.cloneState(latest.state);
    }

    const baseDelta = latest.timestamp - previous.timestamp;
    if (baseDelta <= 0) {
      return this.cloneState(latest.state);
    }

    const limitedTarget = Math.min(targetTime, latest.timestamp + this.maxPredictionWindow);
    const factor = 1 + (limitedTarget - latest.timestamp) / baseDelta;
    const predicted = this.interpolateStates(previous.state, latest.state, factor);
    predicted.timestamp = limitedTarget;
    predicted.sequence = latest.sequence;
    predicted.tickRate = latest.tickRate;
    predicted.deltaMs = latest.deltaMs;
    return predicted;
  }

  private interpolateStates(previous: GameState, next: GameState, factor: number): GameState {
    const interpolatedPlayers = this.interpolatePlayers(previous.players ?? [], next.players ?? [], factor);
    const interpolatedStrategy = this.interpolateStrategy(previous.strategy, next.strategy, factor);

    const interpolated: GameState = {
      ...next,
      players: interpolatedPlayers,
      strategy: interpolatedStrategy,
      timestamp: this.lerp(previous.timestamp ?? next.timestamp ?? 0, next.timestamp ?? previous.timestamp ?? 0, factor),
      sequence: next.sequence,
      tickRate: next.tickRate,
      deltaMs: next.deltaMs
    };

    return interpolated;
  }

  private interpolatePlayers(previousPlayers: PlayerState[], nextPlayers: PlayerState[], factor: number): PlayerState[] {
    const previousById = new Map<string, PlayerState>();
    (previousPlayers ?? []).forEach((player, index) => {
      previousById.set(this.playerId(player, index), player);
    });

    return nextPlayers.map((nextPlayer, index) => {
      const key = this.playerId(nextPlayer, index);
      const previous = previousById.get(key);

      const position = previous
          ? this.interpolatePosition(previous.position, nextPlayer.position, factor)
          : this.clonePosition(nextPlayer.position);

      return {
        ...nextPlayer,
        position,
        arrows: nextPlayer.arrows?.map(arrow => ({...arrow, position: this.clonePosition(arrow.position)}))
      };
    });
  }

  private interpolateStrategy(previousStrategy: StrategyState | undefined, nextStrategy: StrategyState | undefined, factor: number): StrategyState | undefined {
    if (!nextStrategy) {
      return nextStrategy;
    }

    return {
      ...nextStrategy,
      mouses: this.interpolateMovingObjects(previousStrategy?.mouses ?? [], nextStrategy.mouses ?? [], factor),
      cats: this.interpolateMovingObjects(previousStrategy?.cats ?? [], nextStrategy.cats ?? [], factor)
    };
  }

  private interpolateMovingObjects(previousObjects: any[], nextObjects: any[], factor: number): any[] {
    if (previousObjects.length === 0) {
      return nextObjects.map(obj => ({...obj, position: this.clonePosition(obj.position)}));
    }

    const matches = this.matchObjectsByProximity(previousObjects, nextObjects);

    return matches.map(({previous, current}) => {
      const position = previous
          ? this.interpolatePosition(previous.position, current.position, factor)
          : this.clonePosition(current.position);

      return {
        ...current,
        position
      };
    });
  }

  private matchObjectsByProximity(previousObjects: any[], nextObjects: any[]): Array<{ previous?: any; current: any }> {
    const remainingPrev = (previousObjects ?? []).map(obj => ({obj, used: false} as { obj: any; used: boolean }));
    const maxDistanceSq = this.maxMatchDistanceSquared();

    return nextObjects.map(current => {
      let bestMatchIndex = -1;
      let bestDistance = Number.POSITIVE_INFINITY;
      (remainingPrev ?? []).forEach(({obj, used}, index) => {
        if (used || !obj?.position || !current?.position) {
          return;
        }
        const distance = this.distanceSquared(obj.position, current.position);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatchIndex = index;
        }
      });

      let previous = undefined;
      if (bestMatchIndex >= 0 && bestDistance <= maxDistanceSq) {
        previous = remainingPrev[bestMatchIndex].obj;
        remainingPrev[bestMatchIndex].used = true;
      }

      return {previous, current};
    });
  }

  private maxMatchDistanceSquared(): number {
    const state = this.authoritativeState ?? {};
    const cols = Math.max(1, Number(state.cols ?? CONFIG.COLUMNS ?? 1));
    const rows = Math.max(1, Number(state.rows ?? CONFIG.ROWS ?? 1));
    const width = Number(state.width ?? CONFIG.GLOBAL_WIDTH ?? 1);
    const height = Number(state.height ?? CONFIG.GLOBAL_HEIGHT ?? 1);

    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const maxAxis = Math.max(cellWidth, cellHeight);
    const threshold = maxAxis * 2; // tolerate up to ~2 cells before treating as a new entity
    return threshold * threshold;
  }

  private distanceSquared(a: number[] | undefined, b: number[] | undefined): number {
    if (!a || !b) {
      return Number.POSITIVE_INFINITY;
    }
    const dx = (a[0] ?? 0) - (b[0] ?? 0);
    const dy = (a[1] ?? 0) - (b[1] ?? 0);
    return dx * dx + dy * dy;
  }

  private interpolatePosition(previous: number[] | undefined, next: number[] | undefined, factor: number): number[] {
    const prev = previous ?? next ?? [0, 0];
    const nxt = next ?? previous ?? [0, 0];
    return [
      this.lerp(prev[0] ?? 0, nxt[0] ?? 0, factor),
      this.lerp(prev[1] ?? 0, nxt[1] ?? 0, factor)
    ];
  }

  private mergeState(current: GameState, update: GameState): GameState {
    const merged: GameState = {...current};

    if (update.players !== undefined) {
      merged.players = update.players;
    }
    if (update.strategy !== undefined) {
      merged.strategy = update.strategy;
    }
    if (update.width !== undefined) {
      merged.width = update.width;
    }
    if (update.height !== undefined) {
      merged.height = update.height;
    }
    if (update.started !== undefined) {
      merged.started = update.started;
    }
    if (update.ready !== undefined) {
      merged.ready = update.ready;
    }
    if (update.cols !== undefined) {
      merged.cols = update.cols;
    }
    if (update.rows !== undefined) {
      merged.rows = update.rows;
    }
    if (update.timestamp !== undefined) {
      merged.timestamp = update.timestamp;
    }
    if (update.sequence !== undefined) {
      merged.sequence = update.sequence;
    }
    if (update.tickRate !== undefined) {
      merged.tickRate = update.tickRate;
    }
    if (update.deltaMs !== undefined) {
      merged.deltaMs = update.deltaMs;
    }

    return merged;
  }

  private updateTargetFps(state: GameState) {
    const strategy = state.strategy;
    if (!strategy) {
      return;
    }

    const entityCount = (strategy.mouses?.length ?? 0) + (strategy.cats?.length ?? 0) + (state.players?.length ?? 0);
    let adaptedFPS = 60;
    if (entityCount > 100) {
      adaptedFPS = 30;
    } else if (entityCount > 50) {
      adaptedFPS = 45;
    }

    this.setTargetFPS(adaptedFPS);
  }

  private setTargetFPS(fps: number) {
    const clamped = Math.max(30, Math.min(60, fps));
    if (clamped === this.targetFPS) {
      return;
    }
    this.targetFPS = clamped;
    this.frameInterval = 1000 / this.targetFPS;
  }

  private trimBuffer(currentTimestamp: number) {
    const minTimestamp = currentTimestamp - this.bufferDuration;
    while (this.stateBuffer.length > 2 && this.stateBuffer[0].timestamp < minTimestamp) {
      this.stateBuffer.shift();
    }
  }

  private nextSequenceValue(): number {
    const last = this.stateBuffer[this.stateBuffer.length - 1];
    return last ? last.sequence + 1 : 0;
  }

  private getPreviousSnapshot(sequence: number): Snapshot | undefined {
    for (let i = this.stateBuffer.length - 2; i >= 0; i -= 1) {
      const candidate = this.stateBuffer[i];
      if (candidate.sequence < sequence) {
        return candidate;
      }
    }
    return undefined;
  }

  private updateServerOffset(serverTimestamp: number) {
    const clientNow = Date.now();
    const offset = clientNow - serverTimestamp;
    if (!Number.isFinite(offset)) {
      return;
    }

    if (this.serverTimeOffset === null) {
      this.serverTimeOffset = offset;
    } else {
      this.serverTimeOffset = this.serverTimeOffset * 0.9 + offset * 0.1;
    }
  }

  private cloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state)) as GameState;
  }

  private clonePosition(position: number[] | undefined): number[] {
    if (!position) {
      return [0, 0];
    }
    return [position[0] ?? 0, position[1] ?? 0];
  }

  private playerId(player: PlayerState, fallbackIndex: number): string {
    if (player.key) {
      return player.key;
    }
    if (player.name) {
      return player.name;
    }
    return `idx-${fallbackIndex}`;
  }

  private lerp(a: number, b: number, factor: number): number {
    return a + (b - a) * factor;
  }

  private defaultTickRate(): number {
    const tickRate = Number(CONFIG.SERVER_TICK_RATE);
    return Number.isFinite(tickRate) && tickRate > 0 ? tickRate : 20;
  }

  private get interpolationDelay(): number {
    const value = Number(CONFIG.RENDER_INTERPOLATION_DELAY_MS);
    return Number.isFinite(value) ? value : 120;
  }

  private get maxPredictionWindow(): number {
    const value = Number(CONFIG.RENDER_MAX_PREDICTION_MS);
    return Number.isFinite(value) ? value : 120;
  }

  private get bufferDuration(): number {
    const value = Number(CONFIG.RENDER_BUFFER_MS);
    return Number.isFinite(value) ? value : 800;
  }
}
