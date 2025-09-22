# 📡 Performance: WebSocket Batching Optimization

**Labels**: `enhancement`, `performance`, `priority:high`
**Complexité**: Moyen
**Gain estimé**: 15-25% + 40% réduction réseau

## 🎯 Objectif
Optimiser l'envoi des mises à jour WebSocket en les regroupant et en évitant les envois redondants.

## 📊 Impact estimé
- **Gain performance**: 15-25%
- **Complexité**: Moyen
- **Impact réseau**: -40%

## 🔍 Problème actuel
- `sendGameToServer()` appelé **3 fois par tick** :
  - Dans `executeGame()` (callback + direct)
  - Dans les événements joueur
- Envois multiples redondants par frame
- Surcharge réseau inutile

## 💡 Solution proposée
```typescript
class WebSocketBatcher {
  private pendingUpdates = new Set<string>();
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 5; // ms

  scheduleUpdate(updateType: string) {
    this.pendingUpdates.add(updateType);

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushUpdates();
      }, this.BATCH_DELAY);
    }
  }

  private flushUpdates() {
    if (this.pendingUpdates.has('game')) {
      this.sendGameToServer();
    }
    if (this.pendingUpdates.has('queue')) {
      this.sendQueueUpdate();
    }
    if (this.pendingUpdates.has('highscore')) {
      this.sendHighScoreToServer();
    }

    this.pendingUpdates.clear();
    this.batchTimer = null;
  }
}
```

## 🔧 Implémentation
1. Remplacer les appels directs par `batcher.scheduleUpdate('game')`
2. Grouper les mises à jour similaires
3. Éviter les envois redondants dans la même frame
4. Ajouter un mécanisme de priorité pour les mises à jour critiques

## ✅ Critères de réussite
- [ ] Réduction de 40%+ du trafic réseau
- [ ] Pas de perte de mises à jour critiques
- [ ] Latence ≤ 10ms pour les mises à jour groupées
- [ ] Tests de stress validés

## 🔗 Références
- `src/queue.ts:134` - sendGameToServer method
- `src/queue.ts:114` - Multiple sends in executeGame
- `src/game.ts:64` - Player event sends