export class InputComponent {
  trackpad: HTMLDivElement | undefined;
  panel: HTMLDivElement | undefined;
  label: HTMLDivElement | undefined;
  up: HTMLButtonElement | undefined;
  down: HTMLButtonElement | undefined;
  left: HTMLButtonElement | undefined;
  right: HTMLButtonElement | undefined;
  quit: HTMLButtonElement | undefined;
  lastArrowTime: number = 0;
  trackpadActive: boolean = false;

  detectArrowFromSecondTouch(touch: Touch, ws: WebSocket, key: string, activity: () => void) {
    const x = touch.clientX;
    const y = touch.clientY;

    // Vérifie quel bouton est sous cette coordonnée
    const element = document.elementFromPoint(x, y);

    // Fonction pour trouver le bouton parent
    const findArrowButton = (el: Element | null): string | null => {
      if (!el) return null;

      // Vérification directe
      if (el.id === 'arrow-up') return 'U';
      if (el.id === 'arrow-down') return 'D';
      if (el.id === 'arrow-left') return 'L';
      if (el.id === 'arrow-right') return 'R';

      // Vérification du parent (pour les enfants comme le texte)
      if (el.parentElement) {
        return findArrowButton(el.parentElement);
      }

      return null;
    };

    const direction = findArrowButton(element);
    if (direction) {
      const now = Date.now();
      // Évite les déclenchements multiples (debouncing 150ms)
      if (now - this.lastArrowTime > 150) {
        ws.send(JSON.stringify({type: 'arrow', direction, key}));
        activity();
        this.lastArrowTime = now;
      }
    }
  }

  init(ws: WebSocket, key: string, activity: () => void) {
    this.panel = document.getElementById('panel-input') as HTMLDivElement;
    this.label = document.getElementById('player-label') as HTMLDivElement;

    this.trackpad = document.getElementById('trackpad') as HTMLInputElement;
    this.up = document.getElementById('arrow-up') as HTMLButtonElement;
    this.down = document.getElementById('arrow-down') as HTMLButtonElement;
    this.left = document.getElementById('arrow-left') as HTMLButtonElement;
    this.right = document.getElementById('arrow-right') as HTMLButtonElement;

    this.quit = document.getElementById('quit') as HTMLButtonElement;

    if (this.trackpad && this.label && this.panel) {
      this.hide();
      this.trackpad.addEventListener("click", (event) => {
        const rect = this.trackpad!.getBoundingClientRect();
        ws.send(JSON.stringify({type: 'input', key, x: event.offsetX / rect.width, y: event.offsetY / rect.height}));
        activity();
      }, false);
      this.trackpad.addEventListener("touchmove", (event) => {
        event.preventDefault(); // Évite les conflits avec d'autres touches

        // Déplacement normal
        const rect = this.trackpad!.getBoundingClientRect();
        ws.send(JSON.stringify({
          type: 'input',
          key,
          x: (event.targetTouches[0].pageX - rect.left) / rect.width,
          y: (event.targetTouches[0].pageY - rect.top) / rect.height
        }));

        // Détection flèche avec 2ème touche
        if (event.touches.length >= 2) {
          this.detectArrowFromSecondTouch(event.touches[1], ws, key, activity);
        }

        activity();
      }, {passive: false});
      this.trackpad.addEventListener("touchstart", (event) => {
        event.preventDefault(); // Évite les conflits avec d'autres touches

        // Marquer le trackpad comme actif
        this.trackpadActive = true;

        // Déplacement normal
        const rect = this.trackpad!.getBoundingClientRect();
        ws.send(JSON.stringify({
          type: 'input',
          key,
          x: (event.targetTouches[0].pageX - rect.left) / rect.width,
          y: (event.targetTouches[0].pageY - rect.top) / rect.height
        }));

        // Détection flèche avec 2ème touche au moment du touchstart
        if (event.touches.length >= 2) {
          this.detectArrowFromSecondTouch(event.touches[1], ws, key, activity);
        }

        activity();
      }, {passive: false});

      // Détecter quand le trackpad n'est plus utilisé
      this.trackpad.addEventListener("touchend", (event) => {
        if (event.touches.length === 0) {
          this.trackpadActive = false;
        }
      });

      // Écoute globale pour nouvelles touches pendant utilisation trackpad
      document.addEventListener("touchstart", (event) => {
        if (this.trackpadActive && event.touches.length >= 2) {
          // Trouve la touche qui n'est pas sur le trackpad
          for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && !this.trackpad!.contains(element)) {
              this.detectArrowFromSecondTouch(touch, ws, key, activity);
              break;
            }
          }
        }
      }, {passive: false});

      this.up.addEventListener("click", () => {
        ws.send(JSON.stringify({type: 'arrow', direction: 'U', key}));
        activity();
      }, false);
      this.down.addEventListener("click", () => {
        ws.send(JSON.stringify({type: 'arrow', direction: 'D', key}));
        activity();
      }, false);
      this.left.addEventListener("click", () => {
        ws.send(JSON.stringify({type: 'arrow', direction: 'L', key}));
        activity();
      }, false);
      this.right.addEventListener("click", () => {
        ws.send(JSON.stringify({type: 'arrow', direction: 'R', key}));
        activity();
      }, false);
      this.quit.addEventListener("click", () => {
        ws.send(JSON.stringify({type: 'quit', key}));
        activity();
      }, false);
    } else {
      setTimeout(() => this.init(ws, key, activity), 100);
    }
  }

  show(color: string, name: string) {
    this.panel!.style.display = "flex";
    this.label!.style.color = color;
    this.label!.innerText = name;
  }

  hide() {
    this.panel!.style.display = "none";
  }
}