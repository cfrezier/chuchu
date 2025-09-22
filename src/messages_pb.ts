export interface ArrowState {
  position?: number[];
  direction?: string;
  color?: string;
}

export function encodeArrowState(message: ArrowState): Uint8Array {
  let bb = popByteBuffer();
  _encodeArrowState(message, bb);
  return toUint8Array(bb);
}

function _encodeArrowState(message: ArrowState, bb: ByteBuffer): void {
  // repeated int32 position = 1;
  let array$position = message.position;
  if (array$position !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$position) {
      writeVarint64(packed, intToLong(value));
    }
    writeVarint32(bb, 10);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // optional string direction = 2;
  let $direction = message.direction;
  if ($direction !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $direction);
  }

  // optional string color = 3;
  let $color = message.color;
  if ($color !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $color);
  }
}

export function decodeArrowState(binary: Uint8Array): ArrowState {
  return _decodeArrowState(wrapByteBuffer(binary));
}

function _decodeArrowState(bb: ByteBuffer): ArrowState {
  let message: ArrowState = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated int32 position = 1;
      case 1: {
        let values = message.position || (message.position = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(readVarint32(bb));
          }
          bb.limit = outerLimit;
        } else {
          values.push(readVarint32(bb));
        }
        break;
      }

      // optional string direction = 2;
      case 2: {
        message.direction = readString(bb, readVarint32(bb));
        break;
      }

      // optional string color = 3;
      case 3: {
        message.color = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface PlayerState {
  colorIndex?: number;
  name?: string;
  position?: number[];
  totalPoints?: number;
  arrows?: ArrowState[];
  key?: string;
}

export function encodePlayerState(message: PlayerState): Uint8Array {
  let bb = popByteBuffer();
  _encodePlayerState(message, bb);
  return toUint8Array(bb);
}

function _encodePlayerState(message: PlayerState, bb: ByteBuffer): void {
  // optional int32 colorIndex = 1;
  let $colorIndex = message.colorIndex;
  if ($colorIndex !== undefined) {
    writeVarint32(bb, 8);
    writeVarint64(bb, intToLong($colorIndex));
  }

  // optional string name = 2;
  let $name = message.name;
  if ($name !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $name);
  }

  // repeated int32 position = 3;
  let array$position = message.position;
  if (array$position !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$position) {
      writeVarint64(packed, intToLong(value));
    }
    writeVarint32(bb, 26);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // optional int32 totalPoints = 4;
  let $totalPoints = message.totalPoints;
  if ($totalPoints !== undefined) {
    writeVarint32(bb, 32);
    writeVarint64(bb, intToLong($totalPoints));
  }

  // repeated ArrowState arrows = 5;
  let array$arrows = message.arrows;
  if (array$arrows !== undefined) {
    for (let value of array$arrows) {
      writeVarint32(bb, 42);
      let nested = popByteBuffer();
      _encodeArrowState(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional string key = 6;
  let $key = message.key;
  if ($key !== undefined) {
    writeVarint32(bb, 50);
    writeString(bb, $key);
  }
}

export function decodePlayerState(binary: Uint8Array): PlayerState {
  return _decodePlayerState(wrapByteBuffer(binary));
}

function _decodePlayerState(bb: ByteBuffer): PlayerState {
  let message: PlayerState = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional int32 colorIndex = 1;
      case 1: {
        message.colorIndex = readVarint32(bb);
        break;
      }

      // optional string name = 2;
      case 2: {
        message.name = readString(bb, readVarint32(bb));
        break;
      }

      // repeated int32 position = 3;
      case 3: {
        let values = message.position || (message.position = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(readVarint32(bb));
          }
          bb.limit = outerLimit;
        } else {
          values.push(readVarint32(bb));
        }
        break;
      }

      // optional int32 totalPoints = 4;
      case 4: {
        message.totalPoints = readVarint32(bb);
        break;
      }

      // repeated ArrowState arrows = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        let values = message.arrows || (message.arrows = []);
        values.push(_decodeArrowState(bb));
        bb.limit = limit;
        break;
      }

      // optional string key = 6;
      case 6: {
        message.key = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface MovingObjectState {
  position?: number[];
  direction?: string;
  color?: string;
}

export function encodeMovingObjectState(message: MovingObjectState): Uint8Array {
  let bb = popByteBuffer();
  _encodeMovingObjectState(message, bb);
  return toUint8Array(bb);
}

function _encodeMovingObjectState(message: MovingObjectState, bb: ByteBuffer): void {
  // repeated int32 position = 1;
  let array$position = message.position;
  if (array$position !== undefined) {
    let packed = popByteBuffer();
    for (let value of array$position) {
      writeVarint64(packed, intToLong(value));
    }
    writeVarint32(bb, 10);
    writeVarint32(bb, packed.offset);
    writeByteBuffer(bb, packed);
    pushByteBuffer(packed);
  }

  // optional string direction = 2;
  let $direction = message.direction;
  if ($direction !== undefined) {
    writeVarint32(bb, 18);
    writeString(bb, $direction);
  }

  // optional string color = 3;
  let $color = message.color;
  if ($color !== undefined) {
    writeVarint32(bb, 26);
    writeString(bb, $color);
  }
}

export function decodeMovingObjectState(binary: Uint8Array): MovingObjectState {
  return _decodeMovingObjectState(wrapByteBuffer(binary));
}

function _decodeMovingObjectState(bb: ByteBuffer): MovingObjectState {
  let message: MovingObjectState = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated int32 position = 1;
      case 1: {
        let values = message.position || (message.position = []);
        if ((tag & 7) === 2) {
          let outerLimit = pushTemporaryLength(bb);
          while (!isAtEnd(bb)) {
            values.push(readVarint32(bb));
          }
          bb.limit = outerLimit;
        } else {
          values.push(readVarint32(bb));
        }
        break;
      }

      // optional string direction = 2;
      case 2: {
        message.direction = readString(bb, readVarint32(bb));
        break;
      }

      // optional string color = 3;
      case 3: {
        message.color = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface StrategyState {
  mouses?: MovingObjectState[];
  cats?: MovingObjectState[];
  walls?: MovingObjectState[];
  goals?: MovingObjectState[];
  name?: string;
}

export function encodeStrategyState(message: StrategyState): Uint8Array {
  let bb = popByteBuffer();
  _encodeStrategyState(message, bb);
  return toUint8Array(bb);
}

function _encodeStrategyState(message: StrategyState, bb: ByteBuffer): void {
  // repeated MovingObjectState mouses = 1;
  let array$mouses = message.mouses;
  if (array$mouses !== undefined) {
    for (let value of array$mouses) {
      writeVarint32(bb, 10);
      let nested = popByteBuffer();
      _encodeMovingObjectState(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // repeated MovingObjectState cats = 2;
  let array$cats = message.cats;
  if (array$cats !== undefined) {
    for (let value of array$cats) {
      writeVarint32(bb, 18);
      let nested = popByteBuffer();
      _encodeMovingObjectState(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // repeated MovingObjectState walls = 3;
  let array$walls = message.walls;
  if (array$walls !== undefined) {
    for (let value of array$walls) {
      writeVarint32(bb, 26);
      let nested = popByteBuffer();
      _encodeMovingObjectState(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // repeated MovingObjectState goals = 4;
  let array$goals = message.goals;
  if (array$goals !== undefined) {
    for (let value of array$goals) {
      writeVarint32(bb, 34);
      let nested = popByteBuffer();
      _encodeMovingObjectState(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional string name = 5;
  let $name = message.name;
  if ($name !== undefined) {
    writeVarint32(bb, 42);
    writeString(bb, $name);
  }
}

export function decodeStrategyState(binary: Uint8Array): StrategyState {
  return _decodeStrategyState(wrapByteBuffer(binary));
}

function _decodeStrategyState(bb: ByteBuffer): StrategyState {
  let message: StrategyState = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated MovingObjectState mouses = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        let values = message.mouses || (message.mouses = []);
        values.push(_decodeMovingObjectState(bb));
        bb.limit = limit;
        break;
      }

      // repeated MovingObjectState cats = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        let values = message.cats || (message.cats = []);
        values.push(_decodeMovingObjectState(bb));
        bb.limit = limit;
        break;
      }

      // repeated MovingObjectState walls = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        let values = message.walls || (message.walls = []);
        values.push(_decodeMovingObjectState(bb));
        bb.limit = limit;
        break;
      }

      // repeated MovingObjectState goals = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        let values = message.goals || (message.goals = []);
        values.push(_decodeMovingObjectState(bb));
        bb.limit = limit;
        break;
      }

      // optional string name = 5;
      case 5: {
        message.name = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface GameState {
  players?: PlayerState[];
  strategy?: StrategyState;
  width?: number;
  height?: number;
  started?: boolean;
  ready?: boolean;
  cols?: number;
  rows?: number;
  timestamp?: number;
  sequence?: number;
  tickRate?: number;
  deltaMs?: number;
}

export function encodeGameState(message: GameState): Uint8Array {
  let bb = popByteBuffer();
  _encodeGameState(message, bb);
  return toUint8Array(bb);
}

function _encodeGameState(message: GameState, bb: ByteBuffer): void {
  // repeated PlayerState players = 1;
  let array$players = message.players;
  if (array$players !== undefined) {
    for (let value of array$players) {
      writeVarint32(bb, 10);
      let nested = popByteBuffer();
      _encodePlayerState(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }

  // optional StrategyState strategy = 2;
  let $strategy = message.strategy;
  if ($strategy !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeStrategyState($strategy, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional int32 width = 3;
  let $width = message.width;
  if ($width !== undefined) {
    writeVarint32(bb, 24);
    writeVarint64(bb, intToLong($width));
  }

  // optional int32 height = 4;
  let $height = message.height;
  if ($height !== undefined) {
    writeVarint32(bb, 32);
    writeVarint64(bb, intToLong($height));
  }

  // optional bool started = 5;
  let $started = message.started;
  if ($started !== undefined) {
    writeVarint32(bb, 40);
    writeByte(bb, $started ? 1 : 0);
  }

  // optional bool ready = 6;
  let $ready = message.ready;
  if ($ready !== undefined) {
    writeVarint32(bb, 48);
    writeByte(bb, $ready ? 1 : 0);
  }

  // optional int32 cols = 7;
  let $cols = message.cols;
  if ($cols !== undefined) {
    writeVarint32(bb, 56);
    writeVarint64(bb, intToLong($cols));
  }

  // optional int32 rows = 8;
  let $rows = message.rows;
  if ($rows !== undefined) {
    writeVarint32(bb, 64);
    writeVarint64(bb, intToLong($rows));
  }

  // optional double timestamp = 9;
  let $timestamp = message.timestamp;
  if ($timestamp !== undefined) {
    writeVarint32(bb, 73);
    writeDouble(bb, $timestamp);
  }

  // optional uint32 sequence = 10;
  let $sequence = message.sequence;
  if ($sequence !== undefined) {
    writeVarint32(bb, 80);
    writeVarint64(bb, intToLong($sequence));
  }

  // optional uint32 tickRate = 11;
  let $tickRate = message.tickRate;
  if ($tickRate !== undefined) {
    writeVarint32(bb, 88);
    writeVarint64(bb, intToLong($tickRate));
  }

  // optional uint32 deltaMs = 12;
  let $deltaMs = message.deltaMs;
  if ($deltaMs !== undefined) {
    writeVarint32(bb, 96);
    writeVarint64(bb, intToLong($deltaMs));
  }
}

export function decodeGameState(binary: Uint8Array): GameState {
  return _decodeGameState(wrapByteBuffer(binary));
}

function _decodeGameState(bb: ByteBuffer): GameState {
  let message: GameState = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated PlayerState players = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        let values = message.players || (message.players = []);
        values.push(_decodePlayerState(bb));
        bb.limit = limit;
        break;
      }

      // optional StrategyState strategy = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.strategy = _decodeStrategyState(bb);
        bb.limit = limit;
        break;
      }

      // optional int32 width = 3;
      case 3: {
        message.width = readVarint32(bb);
        break;
      }

      // optional int32 height = 4;
      case 4: {
        message.height = readVarint32(bb);
        break;
      }

      // optional bool started = 5;
      case 5: {
        message.started = !!readByte(bb);
        break;
      }

      // optional bool ready = 6;
      case 6: {
        message.ready = !!readByte(bb);
        break;
      }

      // optional int32 cols = 7;
      case 7: {
        message.cols = readVarint32(bb);
        break;
      }

      // optional int32 rows = 8;
      case 8: {
        message.rows = readVarint32(bb);
        break;
      }

      // optional double timestamp = 9;
      case 9: {
        message.timestamp = readDouble(bb);
        break;
      }

      // optional uint32 sequence = 10;
      case 10: {
        message.sequence = readVarint32(bb);
        break;
      }

      // optional uint32 tickRate = 11;
      case 11: {
        message.tickRate = readVarint32(bb);
        break;
      }

      // optional uint32 deltaMs = 12;
      case 12: {
        message.deltaMs = readVarint32(bb);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ScoreState {
  players?: PlayerState[];
}

export function encodeScoreState(message: ScoreState): Uint8Array {
  let bb = popByteBuffer();
  _encodeScoreState(message, bb);
  return toUint8Array(bb);
}

function _encodeScoreState(message: ScoreState, bb: ByteBuffer): void {
  // repeated PlayerState players = 1;
  let array$players = message.players;
  if (array$players !== undefined) {
    for (let value of array$players) {
      writeVarint32(bb, 10);
      let nested = popByteBuffer();
      _encodePlayerState(value, nested);
      writeVarint32(bb, nested.limit);
      writeByteBuffer(bb, nested);
      pushByteBuffer(nested);
    }
  }
}

export function decodeScoreState(binary: Uint8Array): ScoreState {
  return _decodeScoreState(wrapByteBuffer(binary));
}

function _decodeScoreState(bb: ByteBuffer): ScoreState {
  let message: ScoreState = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // repeated PlayerState players = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        let values = message.players || (message.players = []);
        values.push(_decodePlayerState(bb));
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface QueueState {
  state?: GameState;
}

export function encodeQueueState(message: QueueState): Uint8Array {
  let bb = popByteBuffer();
  _encodeQueueState(message, bb);
  return toUint8Array(bb);
}

function _encodeQueueState(message: QueueState, bb: ByteBuffer): void {
  // optional GameState state = 1;
  let $state = message.state;
  if ($state !== undefined) {
    writeVarint32(bb, 10);
    let nested = popByteBuffer();
    _encodeGameState($state, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeQueueState(binary: Uint8Array): QueueState {
  return _decodeQueueState(wrapByteBuffer(binary));
}

function _decodeQueueState(bb: ByteBuffer): QueueState {
  let message: QueueState = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional GameState state = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        message.state = _decodeGameState(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ServerMessage {
  game?: GameState;
  score?: ScoreState;
  queue?: QueueState;
  type?: string;
}

export function encodeServerMessage(message: ServerMessage): Uint8Array {
  let bb = popByteBuffer();
  _encodeServerMessage(message, bb);
  return toUint8Array(bb);
}

function _encodeServerMessage(message: ServerMessage, bb: ByteBuffer): void {
  // optional GameState game = 1;
  let $game = message.game;
  if ($game !== undefined) {
    writeVarint32(bb, 10);
    let nested = popByteBuffer();
    _encodeGameState($game, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional ScoreState score = 2;
  let $score = message.score;
  if ($score !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeScoreState($score, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional QueueState queue = 3;
  let $queue = message.queue;
  if ($queue !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeQueueState($queue, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional string type = 10;
  let $type = message.type;
  if ($type !== undefined) {
    writeVarint32(bb, 82);
    writeString(bb, $type);
  }
}

export function decodeServerMessage(binary: Uint8Array): ServerMessage {
  return _decodeServerMessage(wrapByteBuffer(binary));
}

function _decodeServerMessage(bb: ByteBuffer): ServerMessage {
  let message: ServerMessage = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional GameState game = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        message.game = _decodeGameState(bb);
        bb.limit = limit;
        break;
      }

      // optional ScoreState score = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.score = _decodeScoreState(bb);
        bb.limit = limit;
        break;
      }

      // optional QueueState queue = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.queue = _decodeQueueState(bb);
        bb.limit = limit;
        break;
      }

      // optional string type = 10;
      case 10: {
        message.type = readString(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Long {
  low: number;
  high: number;
  unsigned: boolean;
}

interface ByteBuffer {
  bytes: Uint8Array;
  offset: number;
  limit: number;
}

function pushTemporaryLength(bb: ByteBuffer): number {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb: ByteBuffer, type: number): void {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

function stringToLong(value: string): Long {
  return {
    low: value.charCodeAt(0) | (value.charCodeAt(1) << 16),
    high: value.charCodeAt(2) | (value.charCodeAt(3) << 16),
    unsigned: false,
  };
}

function longToString(value: Long): string {
  let low = value.low;
  let high = value.high;
  return String.fromCharCode(
    low & 0xFFFF,
    low >>> 16,
    high & 0xFFFF,
    high >>> 16);
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let f32 = new Float32Array(1);
let f32_u8 = new Uint8Array(f32.buffer);

let f64 = new Float64Array(1);
let f64_u8 = new Uint8Array(f64.buffer);

function intToLong(value: number): Long {
  value |= 0;
  return {
    low: value,
    high: value >> 31,
    unsigned: value >= 0,
  };
}

let bbStack: ByteBuffer[] = [];

function popByteBuffer(): ByteBuffer {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb: ByteBuffer): void {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes: Uint8Array): ByteBuffer {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb: ByteBuffer): Uint8Array {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb: ByteBuffer, offset: number): void {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb: ByteBuffer): boolean {
  return bb.offset >= bb.limit;
}

function grow(bb: ByteBuffer, count: number): number {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb: ByteBuffer, count: number): number {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb: ByteBuffer, count: number): Uint8Array {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb: ByteBuffer, buffer: Uint8Array): void {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}

function readString(bb: ByteBuffer, count: number): string {
  // Sadly a hand-coded UTF8 decoder is much faster than subarray+TextDecoder in V8
  let offset = advance(bb, count);
  let fromCharCode = String.fromCharCode;
  let bytes = bb.bytes;
  let invalid = '\uFFFD';
  let text = '';

  for (let i = 0; i < count; i++) {
    let c1 = bytes[i + offset], c2: number, c3: number, c4: number, c: number;

    // 1 byte
    if ((c1 & 0x80) === 0) {
      text += fromCharCode(c1);
    }

    // 2 bytes
    else if ((c1 & 0xE0) === 0xC0) {
      if (i + 1 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        if ((c2 & 0xC0) !== 0x80) text += invalid;
        else {
          c = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
          if (c < 0x80) text += invalid;
          else {
            text += fromCharCode(c);
            i++;
          }
        }
      }
    }

    // 3 bytes
    else if ((c1 & 0xF0) == 0xE0) {
      if (i + 2 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        if (((c2 | (c3 << 8)) & 0xC0C0) !== 0x8080) text += invalid;
        else {
          c = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
          if (c < 0x0800 || (c >= 0xD800 && c <= 0xDFFF)) text += invalid;
          else {
            text += fromCharCode(c);
            i += 2;
          }
        }
      }
    }

    // 4 bytes
    else if ((c1 & 0xF8) == 0xF0) {
      if (i + 3 >= count) text += invalid;
      else {
        c2 = bytes[i + offset + 1];
        c3 = bytes[i + offset + 2];
        c4 = bytes[i + offset + 3];
        if (((c2 | (c3 << 8) | (c4 << 16)) & 0xC0C0C0) !== 0x808080) text += invalid;
        else {
          c = ((c1 & 0x07) << 0x12) | ((c2 & 0x3F) << 0x0C) | ((c3 & 0x3F) << 0x06) | (c4 & 0x3F);
          if (c < 0x10000 || c > 0x10FFFF) text += invalid;
          else {
            c -= 0x10000;
            text += fromCharCode((c >> 10) + 0xD800, (c & 0x3FF) + 0xDC00);
            i += 3;
          }
        }
      }
    }

    else text += invalid;
  }

  return text;
}

function writeString(bb: ByteBuffer, text: string): void {
  // Sadly a hand-coded UTF8 encoder is much faster than TextEncoder+set in V8
  let n = text.length;
  let byteCount = 0;

  // Write the byte count first
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    byteCount += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
  }
  writeVarint32(bb, byteCount);

  let offset = grow(bb, byteCount);
  let bytes = bb.bytes;

  // Then write the bytes
  for (let i = 0; i < n; i++) {
    let c = text.charCodeAt(i);
    if (c >= 0xD800 && c <= 0xDBFF && i + 1 < n) {
      c = (c << 10) + text.charCodeAt(++i) - 0x35FDC00;
    }
    if (c < 0x80) {
      bytes[offset++] = c;
    } else {
      if (c < 0x800) {
        bytes[offset++] = ((c >> 6) & 0x1F) | 0xC0;
      } else {
        if (c < 0x10000) {
          bytes[offset++] = ((c >> 12) & 0x0F) | 0xE0;
        } else {
          bytes[offset++] = ((c >> 18) & 0x07) | 0xF0;
          bytes[offset++] = ((c >> 12) & 0x3F) | 0x80;
        }
        bytes[offset++] = ((c >> 6) & 0x3F) | 0x80;
      }
      bytes[offset++] = (c & 0x3F) | 0x80;
    }
  }
}

function writeByteBuffer(bb: ByteBuffer, buffer: ByteBuffer): void {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb: ByteBuffer): number {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}

function readFloat(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f32_u8[0] = bytes[offset++];
  f32_u8[1] = bytes[offset++];
  f32_u8[2] = bytes[offset++];
  f32_u8[3] = bytes[offset++];
  return f32[0];
}

function writeFloat(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  f32[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f32_u8[0];
  bytes[offset++] = f32_u8[1];
  bytes[offset++] = f32_u8[2];
  bytes[offset++] = f32_u8[3];
}

function readDouble(bb: ByteBuffer): number {
  let offset = advance(bb, 8);
  let bytes = bb.bytes;

  // Manual copying is much faster than subarray+set in V8
  f64_u8[0] = bytes[offset++];
  f64_u8[1] = bytes[offset++];
  f64_u8[2] = bytes[offset++];
  f64_u8[3] = bytes[offset++];
  f64_u8[4] = bytes[offset++];
  f64_u8[5] = bytes[offset++];
  f64_u8[6] = bytes[offset++];
  f64_u8[7] = bytes[offset++];
  return f64[0];
}

function writeDouble(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 8);
  let bytes = bb.bytes;
  f64[0] = value;

  // Manual copying is much faster than subarray+set in V8
  bytes[offset++] = f64_u8[0];
  bytes[offset++] = f64_u8[1];
  bytes[offset++] = f64_u8[2];
  bytes[offset++] = f64_u8[3];
  bytes[offset++] = f64_u8[4];
  bytes[offset++] = f64_u8[5];
  bytes[offset++] = f64_u8[6];
  bytes[offset++] = f64_u8[7];
}

function readInt32(bb: ByteBuffer): number {
  let offset = advance(bb, 4);
  let bytes = bb.bytes;
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

function writeInt32(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 4);
  let bytes = bb.bytes;
  bytes[offset] = value;
  bytes[offset + 1] = value >> 8;
  bytes[offset + 2] = value >> 16;
  bytes[offset + 3] = value >> 24;
}

function readInt64(bb: ByteBuffer, unsigned: boolean): Long {
  return {
    low: readInt32(bb),
    high: readInt32(bb),
    unsigned,
  };
}

function writeInt64(bb: ByteBuffer, value: Long): void {
  writeInt32(bb, value.low);
  writeInt32(bb, value.high);
}

function readVarint32(bb: ByteBuffer): number {
  let c = 0;
  let value = 0;
  let b: number;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb: ByteBuffer, value: number): void {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb: ByteBuffer, unsigned: boolean): Long {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b: number;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb: ByteBuffer, value: Long): void {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
  }
}

function readVarint32ZigZag(bb: ByteBuffer): number {
  let value = readVarint32(bb);

  // ref: src/google/protobuf/wire_format_lite.h
  return (value >>> 1) ^ -(value & 1);
}

function writeVarint32ZigZag(bb: ByteBuffer, value: number): void {
  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint32(bb, (value << 1) ^ (value >> 31));
}

function readVarint64ZigZag(bb: ByteBuffer): Long {
  let value = readVarint64(bb, /* unsigned */ false);
  let low = value.low;
  let high = value.high;
  let flip = -(low & 1);

  // ref: src/google/protobuf/wire_format_lite.h
  return {
    low: ((low >>> 1) | (high << 31)) ^ flip,
    high: (high >>> 1) ^ flip,
    unsigned: false,
  };
}

function writeVarint64ZigZag(bb: ByteBuffer, value: Long): void {
  let low = value.low;
  let high = value.high;
  let flip = high >> 31;

  // ref: src/google/protobuf/wire_format_lite.h
  writeVarint64(bb, {
    low: (low << 1) ^ flip,
    high: ((high << 1) | (low >>> 31)) ^ flip,
    unsigned: false,
  });
}
