import {Player} from "../../../player";
import {Goal} from "../../../game/impl/goal";
import {CONFIG} from "../../../../browser/common/config";

export class EquiPlacement {

  static cellNumToPosition(cellNums: [number, number]) {
    return [Math.floor(cellNums[0]) * CONFIG.GLOBAL_WIDTH, Math.floor(cellNums[1]) * CONFIG.GLOBAL_HEIGHT] as [number, number];
  }

  static implement(_players: Player[]): Goal[] {
    // Shuffle players
    const players = _players.map(value => ({value, sort: Math.random()}))
      .sort((a, b) => a.sort - b.sort)
      .map(({value}) => value);

    const positions: [number, number][] = [];
    const gridSize = Math.ceil(Math.sqrt(players.length));
    const spacingX = CONFIG.COLUMNS / (gridSize + 1);
    const spacingY = CONFIG.ROWS / (gridSize + 1);

    for (let i = 0; i < players.length; i++) {
      const row = Math.floor(i / gridSize) + 1;
      const col = (i % gridSize) + 1;
      positions.push([col * spacingX, row * spacingY]);
    }

    // Adjust positions to avoid "holes" and ensure symmetry
    const adjustedPositions = positions.slice(0, players.length);
    while (adjustedPositions.length < gridSize * gridSize) {
      const row = Math.floor(adjustedPositions.length / gridSize) + 1;
      const col = (adjustedPositions.length % gridSize) + 1;
      adjustedPositions.push([col * spacingX, row * spacingY]);
    }

    return players.map((player, index) =>
      new Goal(EquiPlacement.cellNumToPosition(adjustedPositions[index]), 'up', player)
    );
  }
}