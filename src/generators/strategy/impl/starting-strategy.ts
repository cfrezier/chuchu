import {GameStrategy} from "../game-strategy";

export class StartingStrategy extends GameStrategy {
  constructor() {
    super([]);
    this.name = 'Starting';
  }

  _step(index: number) {
  }

  hasEnded(): boolean {
    return true;
  }
}