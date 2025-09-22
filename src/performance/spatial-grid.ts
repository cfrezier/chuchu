import {MovingObject} from "../game/moving-object";
import {CONFIG} from "../../browser/common/config";

/**
 * Spatial partitioning system for optimizing collision detection.
 * Divides the game area into a grid and only checks collisions between
 * objects in the same or adjacent cells.
 *
 * Performance improvement: O(n²) → O(n)
 */
export class SpatialGrid {
  private grid: Map<string, Set<MovingObject>>;
  private cellSize: number;
  private width: number;
  private height: number;

  constructor(cellSize: number = 50) {
    this.grid = new Map();
    this.cellSize = cellSize;
    this.width = CONFIG.GLOBAL_WIDTH;
    this.height = CONFIG.GLOBAL_HEIGHT;
  }

  /**
   * Generates a unique key for a grid cell based on coordinates
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Clears the grid for the next frame
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * Inserts a moving object into the appropriate grid cell
   */
  insert(object: MovingObject): void {
    const key = this.getCellKey(object.position[0], object.position[1]);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(object);
  }

  /**
   * Gets all objects in the same cell and adjacent cells
   */
  getNearbyObjects(object: MovingObject): MovingObject[] {
    const objects: MovingObject[] = [];
    const x = object.position[0];
    const y = object.position[1];

    // Check the object's cell and all 8 adjacent cells
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighborKey = `${cellX + dx},${cellY + dy}`;
        const cell = this.grid.get(neighborKey);
        if (cell) {
          objects.push(...Array.from(cell));
        }
      }
    }

    // Remove the object itself from the list
    return objects.filter(obj => obj !== object);
  }

  /**
   * Gets all objects in a specific area (useful for debugging/visualization)
   */
  getObjectsInArea(x: number, y: number, width: number, height: number): MovingObject[] {
    const objects: MovingObject[] = [];
    const startCellX = Math.floor(x / this.cellSize);
    const endCellX = Math.floor((x + width) / this.cellSize);
    const startCellY = Math.floor(y / this.cellSize);
    const endCellY = Math.floor((y + height) / this.cellSize);

    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
      for (let cellY = startCellY; cellY <= endCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cell = this.grid.get(key);
        if (cell) {
          objects.push(...Array.from(cell));
        }
      }
    }

    return objects;
  }

  /**
   * Returns statistics about the grid for performance monitoring
   */
  getStats(): {totalCells: number, occupiedCells: number, totalObjects: number, averageObjectsPerCell: number} {
    const occupiedCells = this.grid.size;
    let totalObjects = 0;

    for (const cell of this.grid.values()) {
      totalObjects += cell.size;
    }

    const maxCells = Math.ceil(this.width / this.cellSize) * Math.ceil(this.height / this.cellSize);

    return {
      totalCells: maxCells,
      occupiedCells,
      totalObjects,
      averageObjectsPerCell: occupiedCells > 0 ? totalObjects / occupiedCells : 0
    };
  }

  /**
   * Optimizes cell size based on object density
   */
  optimizeCellSize(objectCount: number): void {
    // Dynamic cell size based on object density
    // More objects = smaller cells for better distribution
    // Fewer objects = larger cells for fewer checks
    if (objectCount > 150) {
      this.cellSize = 40;
    } else if (objectCount > 100) {
      this.cellSize = 50;
    } else if (objectCount > 50) {
      this.cellSize = 70;
    } else {
      this.cellSize = 100;
    }
  }
}