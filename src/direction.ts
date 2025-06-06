export type Direction = 'up' | 'down' | 'left' | 'right';

export class DirectionUtils {
  static list(): Direction[] {
    return ['up', 'down', 'left', 'right'];
  }

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

  static vector(direction: Direction): [number, number] {
    switch (direction) {
      case 'up':
        return [0, -1];
      case 'down':
        return [0, 1];
      case 'left':
        return [-1, 0];
      case 'right':
        return [1, 0];
      default:
        return [0, -1]; // fallback
    }
  }
}