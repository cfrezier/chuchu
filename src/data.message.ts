export type DataMsg = {
  type: 'joined',
  name: string,
  key: string
} | {
  type: 'queue',
  key: string
} | {
  type: 'server'
} | {
  type: 'input',
  x: number,
  y: number,
  key: string
}| {
  type: 'arrow',
  direction: 'up' | 'down' | 'left' | 'right',
  key: string
};
