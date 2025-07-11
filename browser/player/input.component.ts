export class InputComponent {
  trackpad: HTMLDivElement | undefined;
  panel: HTMLDivElement | undefined;
  label: HTMLDivElement | undefined;
  up: HTMLButtonElement | undefined;
  down: HTMLButtonElement | undefined;
  left: HTMLButtonElement | undefined;
  right: HTMLButtonElement | undefined;
  quit: HTMLButtonElement | undefined;

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
        const rect = this.trackpad!.getBoundingClientRect();
        ws.send(JSON.stringify({
          type: 'input',
          key,
          x: (event.targetTouches[0].pageX - rect.left) / rect.width,
          y: (event.targetTouches[0].pageY - rect.top) / rect.height
        }));
        activity();
      }, false);
      this.trackpad.addEventListener("touchstart", (event) => {
        const rect = this.trackpad!.getBoundingClientRect();
        ws.send(JSON.stringify({
          type: 'input',
          key,
          x: (event.targetTouches[0].pageX - rect.left) / rect.width,
          y: (event.targetTouches[0].pageY - rect.top) / rect.height
        }));
        activity();
      }, false);
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