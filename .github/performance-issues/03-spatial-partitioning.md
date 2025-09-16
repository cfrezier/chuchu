# 🗺️ Performance: Spatial Partitioning for Collision Detection

**Labels**: `enhancement`, `performance`, `priority:medium`
**Complexité**: Difficile
**Gain estimé**: 40-60%

## 🎯 Objectif
Implémenter un système de partition spatiale pour optimiser la détection de collision avec de nombreuses entités.

## 📊 Impact estimé
- **Gain performance**: 40-60%
- **Complexité**: Difficile
- **Impact réseau**: 0%

## 🔍 Problème actuel
- Détection de collision O(n²) avec jusqu'à 200 souris + 20 chats + 32 joueurs
- Vérification de toutes les entités contre toutes les autres
- Performance dégradée exponentiellement avec le nombre d'entités

## 💡 Solution proposée
```typescript
class SpatialGrid {
  private grid: Map<string, Set<GameObject>>;
  private cellSize: number;

  constructor(cellSize: number = 50) {
    this.grid = new Map();
    this.cellSize = cellSize;
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  insert(object: GameObject) {
    const key = this.getCellKey(object.x, object.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, new Set());
    }
    this.grid.get(key)!.add(object);
  }

  getNearbyObjects(x: number, y: number, radius: number = 1): GameObject[] {
    const objects: GameObject[] = [];
    const startX = Math.floor((x - radius) / this.cellSize);
    const endX = Math.floor((x + radius) / this.cellSize);
    const startY = Math.floor((y - radius) / this.cellSize);
    const endY = Math.floor((y + radius) / this.cellSize);

    for (let cellX = startX; cellX <= endX; cellX++) {
      for (let cellY = startY; cellY <= endY; cellY++) {
        const key = `${cellX},${cellY}`;
        const cell = this.grid.get(key);
        if (cell) {
          objects.push(...Array.from(cell));
        }
      }
    }
    return objects;
  }
}
```

## 🔧 Implémentation
1. Diviser l'aire de jeu en grille de cellules
2. Assigner chaque entité à sa cellule correspondante
3. Lors de la détection de collision, ne vérifier que les cellules adjacentes
4. Mettre à jour la grille quand les entités bougent

## ✅ Critères de réussite
- [ ] Complexité réduite de O(n²) à O(n)
- [ ] Performance améliore de 40%+ avec beaucoup d'entités
- [ ] Pas de regression avec peu d'entités
- [ ] Tests avec 200+ entités validés

## 🔗 Références
- `src/generators/strategy/game-strategy.ts` - Collision detection logic
- `src/game/moving-object.ts` - Moving object base class
- Configuration: `CONFIG.MAX_MOUSES: 200, MAX_CATS: 20`