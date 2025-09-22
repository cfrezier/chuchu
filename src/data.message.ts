import {Direction} from "./direction";

export type DataMsg = {
  type: 'joined',
  name: string,
  key: string,
  bot?: boolean
} | {
  type: 'queue',
  key: string
} | {
  type: 'quit',
  key: string
} | {
  type: 'server',
  allowLongServerView?: boolean
} | {
  type: 'input',
  x: number,
  y: number,
  key: string
}| {
  type: 'arrow',
  direction: Direction,
  key: string
};
