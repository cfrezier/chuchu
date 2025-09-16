# 🖼️ Performance: Dirty Regions Rendering

**Labels**: `enhancement`, `performance`, `frontend`, `priority:low`
**Complexité**: Difficile
**Gain estimé**: 15-25%

## 🎯 Objectif
Implémenter un système de rendu par régions sales (dirty regions) pour éviter le redraw complet du canvas.

## 📊 Impact estimé
- **Gain performance**: 15-25%
- **Complexité**: Difficile
- **Impact réseau**: 0%

## 🔍 Problème actuel
- `clearRect(0, 0, canvas.width, canvas.height)` efface tout le canvas
- Redraw de tous les éléments même si seuls quelques-uns ont bougé
- Gaspillage GPU surtout avec de grands canvas (2000x2000px)

## 💡 Solution proposée
```typescript
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

class DirtyRegionsRenderer {
  private dirtyRegions: Rectangle[] = [];
  private lastPositions = new Map<string, [number, number]>();

  markDirty(x: number, y: number, width: number, height: number) {
    this.dirtyRegions.push({ x, y, width, height });
  }

  markObjectDirty(object: GameObject, cellSize: [number, number]) {
    const [x, y] = object.position;
    const lastPos = this.lastPositions.get(object.id);

    // Mark old position dirty
    if (lastPos) {
      this.markDirty(lastPos[0], lastPos[1], cellSize[0], cellSize[1]);
    }

    // Mark new position dirty
    this.markDirty(x, y, cellSize[0], cellSize[1]);
    this.lastPositions.set(object.id, [x, y]);
  }

  render(context: CanvasRenderingContext2D, gameState: any) {
    // Optimize dirty regions (merge overlapping)
    const optimizedRegions = this.optimizeRegions(this.dirtyRegions);

    optimizedRegions.forEach(region => {
      // Clear only dirty region
      context.clearRect(region.x, region.y, region.width, region.height);

      // Redraw only objects in this region
      this.renderRegion(context, region, gameState);
    });

    this.dirtyRegions = [];
  }

  private optimizeRegions(regions: Rectangle[]): Rectangle[] {
    // Merge overlapping/adjacent regions to reduce draw calls
    // Implementation: spatial clustering algorithm
    return regions; // Simplified
  }
}
```

## 🔧 Implémentation
1. Tracker les positions précédentes de tous les objets mobiles
2. Marquer comme "sales" les zones où des objets ont bougé
3. Ne redraw que les régions marquées comme sales
4. Optimiser les régions (merger les overlapping)

## ⚠️ Défis techniques
- Gestion des objets qui se chevauchent
- Optimisation des régions multiples
- Complexité d'implémentation élevée
- Debugging plus difficile

## ✅ Critères de réussite
- [ ] Réduction draw calls de 60%+
- [ ] Performance GPU améliore de 15%+
- [ ] Aucun artifact visuel
- [ ] Tests avec objets overlapping validés

## 🔗 Références
- `browser/server/game.display.ts:78` - Current clearRect full canvas
- `browser/server/game.display.ts:96-130` - Drawing methods
- Canvas size: `CONFIG.GLOBAL_WIDTH: 2000, GLOBAL_HEIGHT: 2000`