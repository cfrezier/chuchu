export type Direction = 'U' | 'D' | 'L' | 'R';

export class DirectionUtils {
  static list(): Direction[] {
    return ['U', 'D', 'L', 'R'];
  }

  static next(direction: Direction): Direction {
    switch (direction) {
      case 'U':
        return 'R';
      case 'R':
        return 'D';
      case 'D':
        return 'L';
      case 'L':
        return 'U';
    }
  }

  static vector(direction: Direction): [number, number] {
    switch (direction) {
      case 'U':
        return [0, -1];
      case 'D':
        return [0, 1];
      case 'L':
        return [-1, 0];
      case 'R':
        return [1, 0];
    }
  }
}