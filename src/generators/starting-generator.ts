import {GameGenerator} from "./game-generator";

export class StartingGenerator extends GameGenerator {
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