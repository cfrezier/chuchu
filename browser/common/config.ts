export const CONFIG = {
  PATH: '/tmp/chuchu-save.json',
  GAME_LOOP_MS: 50,
  GAME_LOOP_MIN_MS: 50,    // Fréquence maximale (20 TPS)
  GAME_LOOP_MAX_MS: 90,    // Fréquence minimale (11 TPS)
  ADAPTIVE_FREQUENCY: true, // Active/désactive la fréquence adaptative
  SERVER_TICK_RATE: 20,     // Nombre de ticks autoritaires par seconde
  SERVER_BROADCAST_INTERVAL_MS: 50,
  RENDER_INTERPOLATION_DELAY_MS: 120,
  RENDER_MAX_PREDICTION_MS: 120,
  RENDER_BUFFER_MS: 800,
  BASE_TICK_MS: 20,         // Référence historique utilisée pour normaliser les vitesses
  GLOBAL_HEIGHT: 2000,
  GLOBAL_WIDTH: 2000,
  MAX_PLAYERS: 32,
  MIN_PLAYERS: 2,
  QUEUE_TIME: 2,
  RETRY_TIME: 10,
  SERVER_PORT: 8080,
  WSS_PORT: 8081,
  WSS_EXTERNAL_URL: 'ws://localhost:8081',
  AUTO_RECONNECT_DELAY: 100,
  ACTIVITY_TIMEOUT: 1000 * 60 * 30,
  SERVER_TIMEOUT: 1000 * 60 * 15,
  ROWS: 2,
  COLUMNS: 2,
  MAX_PHASES: 10,
  STEP_DURATION: 10000,
  CLASSIC_STEP_GENERATION: 50,
  PLAYER_ABSORB_CAT_RATIO: 0.5,
  PLAYER_ABSORB_MOUSE_POINTS: 1,
  BOTS: 5,
  MAX_MOUSES: 200,
  MAX_CATS: 20,
  BOT_LIMIT_ACTIONS_MS: 1000
} as Record<string, any>;
