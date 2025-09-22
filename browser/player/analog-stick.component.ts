export class AnalogStickComponent {
  private track: HTMLDivElement | null = null;
  private knob: HTMLDivElement | null = null;
  private isDragging: boolean = false;
  private centerX: number = 0;
  private centerY: number = 0;
  private maxRadius: number = 0;
  private deadZone: number = 0.08; // Zone neutre augmentée à 8% pour plus de contrôle
  private animationFrame: number | null = null;
  private moveAnimationFrame: number | null = null;

  // Position normalisée du stick (-1 à 1)
  private currentX: number = 0;
  private currentY: number = 0;

  // Position du curseur dans le jeu (0-1)
  private cursorX: number = 0.5;
  private cursorY: number = 0.5;

  // Direction actuelle du mouvement
  private moveDirectionX: number = 0;
  private moveDirectionY: number = 0;
  private isMoving: boolean = false;

  // Position de départ du touch pour calculer le delta
  private startTouchX: number = 0;
  private startTouchY: number = 0;

  // Flèche directionnelle
  private directionArrow: HTMLDivElement | null = null;

  init(onMove: (x: number, y: number) => void) {
    this.track = document.getElementById('analog-stick-track') as HTMLDivElement;
    this.knob = document.getElementById('analog-stick-knob') as HTMLDivElement;
    // Ajout de la flèche directionnelle
    this.directionArrow = document.getElementById('analog-stick-arrow') as HTMLDivElement;
    if (!this.track || !this.knob) {
      console.error('Analog stick elements not found');
      return;
    }

    // Calcul des dimensions avec amplitude maximale - CORRIGÉ
    const trackRect = this.track.getBoundingClientRect();
    this.centerX = trackRect.width / 2;
    this.centerY = trackRect.height / 2;
    this.maxRadius = (trackRect.width / 2) - 50; // Plus d'amplitude, knob de 80px donc marge de 50px


    this.setupEventListeners(onMove);
  }

  private setupEventListeners(onMove: (x: number, y: number) => void) {
    if (!this.track || !this.knob) return;

    // Mouse events - écouter sur le track entier, pas seulement le knob
    this.track.addEventListener('mousedown', this.handleStart.bind(this));
    document.addEventListener('mousemove', this.handleMove.bind(this));
    document.addEventListener('mouseup', this.handleEnd.bind(this));

    // Touch events - écouter sur le track entier
    this.track.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleEnd.bind(this));

    // Stockage de la callback
    this.onMove = onMove;
  }

  private onMove: (x: number, y: number) => void = () => {};

  private handleStart(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.knob?.classList.add('dragging');
    if (!this.track || !this.knob) return;
    if (event instanceof MouseEvent) {
      this.startTouchX = event.clientX;
      this.startTouchY = event.clientY;
    } else {
      if (event.touches.length === 0) return;
      this.startTouchX = event.touches[0].clientX;
      this.startTouchY = event.touches[0].clientY;
    }
    // Déplacement immédiat du knob au début du drag
    this.updateKnobPosition(0, 0);
    this.updateDirectionArrow(0, 0);
  }

  private handleMove(event: MouseEvent | TouchEvent) {
    if (!this.track || !this.knob) return;
    if (!this.isDragging) return;

    event.preventDefault();

    // Obtenir la position actuelle du touch
    let currentTouchX: number, currentTouchY: number;
    if (event instanceof MouseEvent) {
      currentTouchX = event.clientX;
      currentTouchY = event.clientY;
    } else {
      if (event.touches.length === 0) return;
      currentTouchX = event.touches[0].clientX;
      currentTouchY = event.touches[0].clientY;
    }

    // NOUVEAU : Calculer le delta depuis la position de départ du touch
    const deltaX = currentTouchX - this.startTouchX;
    const deltaY = currentTouchY - this.startTouchY;

    // Convertir le delta en position de stick (avec sensibilité)
    const sensitivity = 1.2; // Sensibilité du stick augmentée pour plus de fluidité

    // Détecter si on est sur mobile en mode paysage
    const isLandscape = window.innerWidth > window.innerHeight;
    const isMobile = 'ontouchstart' in window;

    let newStickX: number, newStickY: number;

    if (isMobile && !isLandscape) {
      // Mobile en portrait : correction -90° nécessaire (interface tournée par CSS)
      newStickX = deltaY / sensitivity;   // Y devient X (rotation -90°)
      newStickY = -deltaX / sensitivity;  // -X devient Y (rotation -90°)
    } else {
      // PC ou mobile paysage : pas de correction
      newStickX = deltaX / sensitivity;   // Normal pour X
      newStickY = deltaY / sensitivity;   // Normal pour Y
    }

    // Calcul des dimensions
    const trackRect = this.track.getBoundingClientRect();
    const maxRadius = (trackRect.width / 2) - 50;

    // Contrainte circulaire
    const distance = Math.sqrt(newStickX * newStickX + newStickY * newStickY);
    if (distance > maxRadius) {
      const angle = Math.atan2(newStickY, newStickX);
      newStickX = Math.cos(angle) * maxRadius;
      newStickY = Math.sin(angle) * maxRadius;
    }

    // Mettre à jour la position du stick
    this.currentX = newStickX;
    this.currentY = newStickY;
    this.updateKnobPosition(newStickX, newStickY);

    // Calcul des valeurs normalisées pour le mouvement
    const normalizedX = newStickX / maxRadius;
    const normalizedY = newStickY / maxRadius;
    const magnitude = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    this.updateDirectionArrow(normalizedX, normalizedY);

    // Zone morte et mouvement continu (comportement manette)
    if (magnitude > this.deadZone) {
      const adjustedMagnitude = Math.min((magnitude - this.deadZone) / (1 - this.deadZone), 1);
      const factor = adjustedMagnitude / magnitude;
      const moveX = normalizedX * factor;
      const moveY = normalizedY * factor;

      // Mettre à jour la direction de mouvement (pas de redémarrage de timer)
      this.moveDirectionX = moveX;
      this.moveDirectionY = moveY;

      // Démarrer le mouvement si pas déjà en cours
      if (!this.isMoving) {
        this.startContinuousMove();
      }
    } else {
      // Dans la zone morte - arrêter le mouvement
      this.stopContinuousMove();
    }
  }


  private handleEnd(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.knob?.classList.remove('dragging');

    // Arrêter le mouvement du curseur
    this.stopContinuousMove();

    // Animation de retour au centre du stick visuel
    this.animateToCenter();
  }

  private updateKnobPosition(x: number, y: number) {
    if (!this.knob) return;
    this.knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    // Feedback visuel : couleur selon la force
    this.knob.style.background = `rgba(${Math.floor(255 * Math.min(1, Math.sqrt(x * x + y * y) / this.maxRadius))}, ${Math.floor(100 + 155 * (1-Math.min(1, Math.sqrt(x * x + y * y) / this.maxRadius)))}, 100, 0.8)`;
  }

  private updateDirectionArrow(normX: number, normY: number) {
    if (!this.directionArrow) return;
    const magnitude = Math.sqrt(normX * normX + normY * normY);
    if (magnitude < this.deadZone) {
      this.directionArrow.style.opacity = '0';
      return;
    }
    this.directionArrow.style.opacity = '1';
    // Calcul de l'angle
    const angle = Math.atan2(normY, normX) * 180 / Math.PI;
    this.directionArrow.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${0.7 + magnitude * 0.7})`;
    // Couleur selon la force
    this.directionArrow.style.background = `rgba(255, 180, 0, ${0.3 + magnitude * 0.7})`;
  }

  private startContinuousMove() {
    if (this.isMoving) return;
    this.isMoving = true;
    let lastTime = performance.now();
    const moveLoop = (currentTime: number) => {
      if (!this.isMoving) return;
      const deltaTime = (currentTime - lastTime) / 16.67;
      lastTime = currentTime;
      // Courbe de vitesse plus linéaire
      const baseSpeed = 0.025; // Vitesse de base réduite
      const maxSpeed = 0.045;  // Vitesse maximale réduite
      const speed = Math.min(baseSpeed * Math.sqrt(this.moveDirectionX * this.moveDirectionX + this.moveDirectionY * this.moveDirectionY) * deltaTime, maxSpeed * deltaTime);
      const deltaX = this.moveDirectionX * speed;
      const deltaY = this.moveDirectionY * speed;
      this.cursorX = Math.max(0, Math.min(1, this.cursorX + deltaX));
      this.cursorY = Math.max(0, Math.min(1, this.cursorY + deltaY));
      this.onMove(this.cursorX, this.cursorY);
      this.moveAnimationFrame = requestAnimationFrame(moveLoop);
    };

    this.moveAnimationFrame = requestAnimationFrame(moveLoop);
  }

  private stopContinuousMove() {
    this.isMoving = false;
    if (this.moveAnimationFrame) {
      cancelAnimationFrame(this.moveAnimationFrame);
      this.moveAnimationFrame = null;
    }
    this.moveDirectionX = 0;
    this.moveDirectionY = 0;
  }

  private animateToCenter() {
    if (!this.knob) return;

    const startX = this.currentX;
    const startY = this.currentY;
    const startTime = performance.now();
    const duration = 200; // 200ms pour revenir au centre

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing out cubic pour un retour naturel
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolation vers le centre VISUELLEMENT seulement
      const currentX = startX * (1 - easeProgress);
      const currentY = startY * (1 - easeProgress);

      this.updateKnobPosition(currentX, currentY);

      // NE PAS envoyer de position pendant l'animation
      // Le curseur garde sa dernière position

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        // Position finale VISUELLE seulement - retour au centre
        this.currentX = 0;
        this.currentY = 0;
        this.knob!.style.transform = 'translate(-50%, -50%)';
        // NE PAS envoyer onMove(0.5, 0.5) - garde la dernière position du curseur
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.moveAnimationFrame) {
      cancelAnimationFrame(this.moveAnimationFrame);
    }
    this.stopContinuousMove();
  }
}