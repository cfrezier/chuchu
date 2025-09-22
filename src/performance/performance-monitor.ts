/**
 * Performance monitoring utility for measuring collision detection improvements
 */
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  /**
   * Start timing a specific operation
   */
  static startTiming(operation: string): number {
    return performance.now();
  }

  /**
   * End timing and record the duration
   */
  static endTiming(operation: string, startTime: number): number {
    const duration = performance.now() - startTime;

    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }

    this.measurements.get(operation)!.push(duration);

    // Keep only the last 100 measurements to prevent memory bloat
    const measurements = this.measurements.get(operation)!;
    if (measurements.length > 100) {
      measurements.shift();
    }

    return duration;
  }

  /**
   * Get statistics for a specific operation
   */
  static getStats(operation: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const total = measurements.reduce((sum, time) => sum + time, 0);
    const average = total / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      count: measurements.length,
      average,
      min,
      max,
      total
    };
  }

  /**
   * Get all performance statistics
   */
  static getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [operation, measurements] of this.measurements) {
      stats[operation] = this.getStats(operation);
    }

    return stats;
  }

  /**
   * Reset all measurements
   */
  static reset(): void {
    this.measurements.clear();
  }

  /**
   * Log performance summary to console
   */
  static logSummary(): void {
    const stats = this.getAllStats();
    console.log('=== Performance Summary ===');

    for (const [operation, data] of Object.entries(stats)) {
      if (data) {
        console.log(`${operation}:`);
        console.log(`  Average: ${data.average.toFixed(3)}ms`);
        console.log(`  Min: ${data.min.toFixed(3)}ms`);
        console.log(`  Max: ${data.max.toFixed(3)}ms`);
        console.log(`  Count: ${data.count}`);
        console.log('');
      }
    }
  }
}