export type Direction = 'up' | 'down' | 'left' | 'right';

export class NextDirection {
  static next(direction: Direction): Direction {
    switch (direction) {
      case 'up':
        return 'right';
      case 'right':
        return 'down';
      case 'down':
        return 'left';
      case 'left':
        return 'up';
    }
  }
}