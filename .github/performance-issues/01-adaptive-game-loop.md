# 🚀 Performance: Adaptive Game Loop Frequency

**Labels**: `enhancement`, `performance`, `priority:high`
**Complexité**: Facile
**Gain estimé**: 20-30%

## 🎯 Objectif
Optimiser la fréquence de la boucle de jeu serveur en fonction du nombre de joueurs pour améliorer les performances.

## 📊 Impact estimé
- **Gain performance**: 20-30%
- **Complexité**: Facile
- **Impact réseau**: 0%

## 🔍 Problème actuel
- Fréquence fixe de 50 FPS (20ms) : `CONFIG.GAME_LOOP_MS: 20`
- Performance dégradée avec 32 joueurs + 200 souris + 20 chats + 5 bots
- Surcharge CPU inutile quand peu de joueurs

## 💡 Solution proposée
```typescript
// Fréquence adaptative selon la charge
const GAME_LOOP_MS = Math.max(20, Math.min(50, playerCount * 2));

// Configuration dynamique
class AdaptiveGameLoop {
  private currentFrequency: number = 20;

  updateFrequency(playerCount: number, entityCount: number) {
    const baseFrequency = 20;
    const scaleFactor = Math.floor(playerCount / 8) * 5;
    this.currentFrequency = Math.max(baseFrequency, Math.min(50, baseFrequency + scaleFactor));
  }
}
```

## ✅ Critères de réussite
- [ ] Fréquence s'adapte au nombre de joueurs
- [ ] Performance améliore de 20%+ avec peu de joueurs
- [ ] Pas de dégradation avec beaucoup de joueurs
- [ ] Tests de charge validés

## 🔗 Références
- `src/queue.ts:120` - Current game loop
- `browser/common/config.ts:3` - GAME_LOOP_MS configuration