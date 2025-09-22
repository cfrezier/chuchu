import { AnalogStickComponent } from './analog-stick.component';

export class InputComponent {
  analogStick: AnalogStickComponent;
  panel: HTMLDivElement | undefined;
  label: HTMLDivElement | undefined;
  up: HTMLButtonElement | undefined;
  down: HTMLButtonElement | undefined;
  left: HTMLButtonElement | undefined;
  right: HTMLButtonElement | undefined;
  quit: HTMLButtonElement | undefined;
  lastArrowTime: number = 0;
  stickActive: boolean = false;

  constructor() {
    this.analogStick = new AnalogStickComponent();
  }

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

    this.up = document.getElementById('arrow-up') as HTMLButtonElement;
    this.down = document.getElementById('arrow-down') as HTMLButtonElement;
    this.left = document.getElementById('arrow-left') as HTMLButtonElement;
    this.right = document.getElementById('arrow-right') as HTMLButtonElement;

    this.quit = document.getElementById('quit') as HTMLButtonElement;

    if (this.label && this.panel) {
      this.hide();

      // Initialisation du stick analogique
      this.analogStick.init((x: number, y: number) => {
        ws.send(JSON.stringify({type: 'input', key, x, y}));
        activity();
      });

      // Gestion multi-touch pour les flèches (conservé de l'ancien système)
      document.addEventListener("touchstart", (event) => {
        if (event.touches.length >= 2) {
          // Trouve la touche qui n'est pas sur le stick
          for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            const stickTrack = document.getElementById('analog-stick-track');
            if (element && stickTrack && !stickTrack.contains(element)) {
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