# 🎨 Performance: Client-Side Render Loop Optimization

**Labels**: `enhancement`, `performance`, `frontend`, `priority:medium`
**Complexité**: Moyen
**Gain estimé**: 20-30%

## 🎯 Objectif
Implémenter un render loop découplé avec requestAnimationFrame pour optimiser le rendu côté client.

## 📊 Impact estimé
- **Gain performance**: 20-30%
- **Complexité**: Moyen
- **Impact réseau**: 0%

## 🔍 Problème actuel
- Rendu déclenché directement par les WebSocket messages
- Pas de requestAnimationFrame → non synchronisé avec le refresh rate
- Redraw complet à chaque mise à jour (clearRect + redraw all)
- Possible frame drops et rendu inefficient

## 💡 Solution proposée
```typescript
class OptimizedRenderer {
  private needsRedraw: boolean = false;
  private isRendering: boolean = false;
  private lastFrameTime: number = 0;
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / this.targetFPS;

  constructor(private gameDisplay: GameDisplay) {
    this.startRenderLoop();
  }

  private startRenderLoop() {
    const renderFrame = (currentTime: number) => {
      if (currentTime - this.lastFrameTime >= this.frameInterval) {
        if (this.needsRedraw && !this.isRendering) {
          this.isRendering = true;
          this.gameDisplay.draw();
          this.needsRedraw = false;
          this.isRendering = false;
          this.lastFrameTime = currentTime;
        }
      }
      requestAnimationFrame(renderFrame);
    };

    requestAnimationFrame(renderFrame);
  }

  // Appelé par les WebSocket messages
  markForRedraw() {
    this.needsRedraw = true;
  }

  // Adaptive FPS based on complexity
  setTargetFPS(fps: number) {
    this.targetFPS = Math.max(15, Math.min(60, fps));
    this.frameInterval = 1000 / this.targetFPS;
  }
}
```

## 🔧 Implémentation
1. Découpler réception WebSocket et rendu
2. Utiliser requestAnimationFrame pour synchronisation écran
3. Implémenter un flag `needsRedraw` pour éviter le rendu inutile
4. Ajouter FPS adaptatif selon la charge

## ✅ Critères de réussite
- [ ] Rendu synchronisé avec le refresh rate (60 FPS max)
- [ ] Réduction CPU client de 20%+
- [ ] Pas de frame drops visibles
- [ ] Smooth animation même avec beaucoup d'entités

## 🔗 Références
- `browser/server/game.display.ts:71` - Current display method
- `browser/server/game.display.ts:78` - clearRect implementation
- `browser/server/index.ts` - WebSocket message handling