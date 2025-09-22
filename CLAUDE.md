# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `npm run build` - Build all components (Node.js backend + browser bundles)
- `npm run build:node` - Compile TypeScript backend to `dist/`
- `npm run build:player` - Build player interface bundle
- `npm run build:server` - Build game display interface bundle
- `npm run start:dev` / `npm run start` - Build and start development server with hot reload
- `npm run protobuf` - Generate TypeScript types from protobuf schema

### Testing and Linting
No formal test suite or linting commands are configured. The project uses TypeScript compilation for type checking.

## Code Architecture

ChuChuV2 is a real-time multiplayer game inspired by ChuChu Rocket!, supporting up to 32 concurrent players. The architecture follows a client-server model with WebSocket communication.

### High-Level Architecture

The system consists of three main components:
1. **Node.js Server** (`src/`) - Game logic, WebSocket handling, player management
2. **Player Interface** (`browser/player/`) - Mobile-optimized control pad for players
3. **Display Interface** (`browser/server/`) - Main game view showing the board

Communication flow:
- Players connect via WebSocket and send input commands
- Server processes game logic at fixed intervals
- Server broadcasts game state updates to all connected clients
- Display interface renders the current game state on HTML5 Canvas

### Core Game Architecture

#### Game Management (`src/game.ts`, `src/queue.ts`)
- **Game**: Central game coordinator managing players, strategies, and execution loop
- **Queue**: Player queue management and message processing hub
- **Player**: Individual player state including position, arrows, score, and WebSocket connection

#### Strategy System (`src/generators/strategy/`)
The game uses a pluggable strategy system for different game modes:
- **GameStrategy** (abstract): Defines game behavior, object placement, speeds
- **Implementations**: `base-strategy`, `cat-mania`, `mouse-mania`, `hurry`, `many-wall`
- **StrategyFactory**: Handles strategy transitions and selection

#### Object Generation (`src/generators/`)
Modular generators create game elements:
- **Goals**: `goal-factory.ts` with placement strategies (random, line-based)
- **Walls**: `wall-factory.ts` for obstacle generation
- **Dynamic sizing**: Board size adjusts based on player count (15x15 to 45x45)

#### Game Objects (`src/game/`)
- **MovingObject** (abstract): Base for cats and mice with collision detection
- **NonMovingObject** (abstract): Base for walls, goals, arrows
- **Arrow**: Player-placed directional guides
- **Mouse/Cat**: Moving entities with AI behavior

### WebSocket Communication

Uses custom JSON messages for real-time communication:
- Player actions: `joined`, `queue`, `input`, `arrow`
- Server responses: `queued`, `score`, `can-queue`, `wait-over`
- Game state broadcasts using protobuf for efficiency (`messages.proto`)

### Browser Architecture

#### Webpack Configuration
- Separate builds for player (`browser/player/`) and server (`browser/server/`) interfaces
- TypeScript compilation with source maps
- Output to `static/js/` directories

#### Player Interface Components
- `input.component.ts`: Touch/mouse input handling
- `name.component.ts`: Player identification
- `queue.component.ts`: Queue status display
- `score.component.ts`: Score tracking

#### Display Interface Components  
- `game.display.ts`: Main canvas rendering
- `qrcode.display.ts`: Player connection QR codes
- `score.display.ts`: Leaderboard display

### Configuration System

Configuration is managed through:
- `browser/common/config.ts`: Shared configuration constants
- `static/config.json`: Runtime configuration file
- Dynamic board sizing based on player count
- Speed adjustment algorithms for different board sizes

### Key Patterns

1. **Factory Pattern**: Used extensively for generating game objects and strategies
2. **Observer Pattern**: WebSocket message handling and game state updates
3. **Strategy Pattern**: Pluggable game modes and AI behaviors
4. **Component Pattern**: Browser UI built as reusable components
5. **State Machine**: Game phases and player states

### File Structure Notes

- `src/`: TypeScript backend with shared game logic
- `browser/`: Client-side TypeScript compiled to JavaScript bundles  
- `static/`: Web assets (HTML, CSS, images, compiled JS)
- `deploy/`: Kubernetes deployment configuration