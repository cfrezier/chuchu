import { Goal } from '../src/game/impl/goal';
import { Mouse } from '../src/game/mouse';
import { Player } from '../src/player';
import { Geometry } from '../src/geometry';

describe('Goal Absorption Optimization', () => {
  let goal: Goal;
  let player: Player;
  let testMouses: Mouse[];

  beforeEach(() => {
    player = new Player('TestPlayer', 'test-player-key');
    goal = new Goal([100, 100], 'U', player);

    // Create test mice at various distances
    testMouses = [
      new Mouse([95, 95], 'R'),   // Close - should be absorbed
      new Mouse([105, 105], 'L'), // Close - should be absorbed
      new Mouse([120, 120], 'U'), // Far - should NOT be absorbed
      new Mouse([80, 80], 'D'),   // Close - should be absorbed
      new Mouse([200, 200], 'R'), // Very far - should NOT be absorbed
    ];
  });

  test('optimized absorbing produces same results as original method', () => {
    // Test the current optimized version
    const optimizedResults = goal.absorbing(testMouses);

    // Manually test with the old algorithm for comparison
    const originalResults = testMouses.filter((mouse) =>
      Geometry.segmentNorm([goal.position, mouse.position]) < goal.norm
    );

    // Results should be identical
    expect(optimizedResults).toHaveLength(originalResults.length);

    // Check that exactly the same mice are selected
    optimizedResults.forEach(mouse => {
      expect(originalResults).toContain(mouse);
    });

    originalResults.forEach(mouse => {
      expect(optimizedResults).toContain(mouse);
    });
  });

  test('normSquared is correctly pre-calculated', () => {
    const expectedNormSquared = goal.norm * goal.norm;
    expect(goal.normSquared).toBe(expectedNormSquared);
  });

  test('distance squared calculation is mathematically equivalent', () => {
    const testMouse = testMouses[0];

    // Optimized calculation
    const dx = goal.position[0] - testMouse.position[0];
    const dy = goal.position[1] - testMouse.position[1];
    const distanceSquared = dx * dx + dy * dy;

    // Original calculation
    const originalDistance = Geometry.segmentNorm([goal.position, testMouse.position]);
    const originalDistanceSquared = originalDistance * originalDistance;

    // Should be mathematically equivalent (within floating point precision)
    expect(Math.abs(distanceSquared - originalDistanceSquared)).toBeLessThan(0.000001);
  });

  test('performance: optimized version avoids Math.sqrt calls', () => {
    // This test validates that we're not calling expensive operations
    const originalMathSqrt = Math.sqrt;
    let sqrtCallCount = 0;

    Math.sqrt = jest.fn((...args) => {
      sqrtCallCount++;
      return originalMathSqrt(...args);
    });

    // Run the optimized absorption
    goal.absorbing(testMouses);

    // Our optimized version should not call Math.sqrt at all
    expect(sqrtCallCount).toBe(0);

    // Restore original Math.sqrt
    Math.sqrt = originalMathSqrt;
  });

  test('edge case: empty objects array', () => {
    const result = goal.absorbing([]);
    expect(result).toEqual([]);
  });

  test('edge case: object at exact same position as goal', () => {
    const samePositionMouse = new Mouse([100, 100], 'U'); // Same as goal position
    const result = goal.absorbing([samePositionMouse]);

    // Distance is 0, which should be less than norm, so should be absorbed
    expect(result).toContain(samePositionMouse);
  });
});