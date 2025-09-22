# 🔮 Performance: Hybrid Predictive Rendering

**Labels**: `enhancement`, `performance`, `architecture`, `priority:epic`
**Complexité**: Très difficile
**Gain estimé**: 30-50% + 20% réduction réseau

## 🎯 Objectif
Implémenter un système hybride avec rendu prédictif côté client pour réduire la latence et la charge serveur.

## 📊 Impact estimé
- **Gain performance**: 30-50%
- **Complexité**: Très difficile
- **Impact réseau**: -20%

## 🔍 Problème actuel
- Tout le rendu dépend des mises à jour serveur
- Latence réseau affecte la fluidité visuelle
- Serveur calcule et envoie chaque frame complète
- Architecture monolithique serveur/client

## 💡 Solution proposée - Architecture Hybride

### 🏗️ Répartition des responsabilités

**Serveur (Autoritaire)**:
- Logique de jeu définitive
- Détection de collision précise
- État autoritaire du jeu
- Validation des actions joueurs

**Client (Prédictif)**:
- Interpolation entre les états serveur
- Prédiction locale des mouvements
- Rendu fluide 60 FPS
- Rollback en cas de divergence

```typescript
// Serveur - États autoritaires moins fréquents
class AuthoritativeGameServer {
  private tickRate = 20; // Réduit de 50 à 20 ticks/sec

  broadcastGameState() {
    const authoritative = {
      timestamp: Date.now(),
      players: this.getAuthoritativePlayerStates(),
      entities: this.getAuthoritativeEntityStates(),
      sequence: this.sequence++
    };

    this.broadcast(authoritative);
  }
}

// Client - Prédiction et interpolation
class PredictiveRenderer {
  private serverStates: GameState[] = [];
  private inputBuffer: PlayerInput[] = [];
  private renderTime: number = 0;

  update(deltaTime: number) {
    // Interpolation entre états serveur
    const interpolatedState = this.interpolateState(this.renderTime);

    // Prédiction locale des inputs récents
    const predictedState = this.applyLocalPrediction(interpolatedState);

    // Rendu fluide
    this.render(predictedState);

    this.renderTime += deltaTime;
  }

  reconcileWithServer(serverState: GameState) {
    // Client-side prediction rollback si nécessaire
    const prediction = this.getPredictionAt(serverState.timestamp);
    if (this.divergenceDetected(prediction, serverState)) {
      this.rollbackAndReplay(serverState);
    }
  }
}
```

### 🔧 Composants techniques

1. **State Interpolation**: Smooth entre 2 états serveur
2. **Input Prediction**: Prédire mouvement joueur local
3. **Rollback Netcode**: Correction en cas d'erreur prédiction
4. **Lag Compensation**: Gérer la latence réseau
5. **Delta Compression**: Envoyer seulement les changements

## 🏆 Avantages
- **Fluidité**: 60 FPS constant même avec lag réseau
- **Réactivité**: Input local instantané
- **Scalabilité**: Serveur moins chargé (20 vs 50 ticks/sec)
- **Tolérance**: Robuste aux problèmes réseau

## ⚠️ Défis majeurs
- **Complexité**: Architecture complètement nouvelle
- **Synchronisation**: Gérer divergences client/serveur
- **Debug**: Plus difficile à diagnostiquer
- **Développement**: Temps de dev x3-4

## 📋 Plan d'implémentation (Epic)
1. **Phase 1**: Séparation logique/rendu (4-6 semaines)
2. **Phase 2**: Interpolation basique (2-3 semaines)
3. **Phase 3**: Prédiction input local (3-4 semaines)
4. **Phase 4**: Rollback netcode (4-5 semaines)
5. **Phase 5**: Optimisations et polish (2-3 semaines)

**Total estimé**: 15-20 semaines développeur

## ✅ Critères de réussite
- [ ] Rendu 60 FPS constant même avec 200ms latence
- [ ] Réduction trafic réseau de 20%+
- [ ] Réduction charge serveur de 30%+
- [ ] Tests de stress 32 joueurs + lag simulé
- [ ] Rollback invisible pour l'utilisateur

## 🔗 Références
- Architecture actuelle: `src/queue.ts`, `src/game.ts`
- Rendu: `browser/server/game.display.ts`
- Communication: WebSocket messages
- Inspiration: Netcode techniques from competitive games

## 📚 Ressources
- [Gaffer on Games - Networked Physics](https://gafferongames.com/categories/networked-physics/)
- [Valve Developer Community - Lag Compensation](https://developer.valvesoftware.com/wiki/Lag_compensation)
- [Client-Server Architecture Patterns](https://www.gabrielgambetta.com/client-server-game-architecture.html)