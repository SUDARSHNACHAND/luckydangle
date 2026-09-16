import { DanglePhysics } from './physics.js';
import { CharmManager } from './charms.js';
import { DangleAudio } from './audio.js';
import { ParticleSystem } from './particles.js';

class DesktopOverlayApp {
  constructor() {
    this.canvas = document.getElementById('dangle-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.physics = new DanglePhysics({
      anchorX: window.innerWidth / 2,
      anchorY: 0,
      numSegments: 6,
      segmentLength: 36,
      gravity: 0.65,
      damping: 0.96
    });

    this.charms = new CharmManager();
    this.audio = new DangleAudio();
    this.particles = new ParticleSystem();
    window.desktopOverlayApp = this;

    this.visible = true;
    this.ipcRenderer = null;
    this.isIgnoringMouse = null;

    // Load saved sound preference
    try {
      const savedMuted = localStorage.getItem('ld-sound-muted') === 'true';
      this.audio.muted = savedMuted;
    } catch (e) {}

    if (window.require) {
      try {
        const electron = window.require('electron');
        this.ipcRenderer = electron.ipcRenderer;
      } catch (e) {
        console.log('Running without electron require');
      }
    }

    this.init();
  }

  async init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Load PNG assets via direct Node fs Base64 with fallback
    await this.charms.loadAssets();

    this.setupEvents();
    this.setupIPC();

    if (this.ipcRenderer) {
      this.ipcRenderer.send('overlay-ready', {
        charmId: this.charms.activeCharmId,
        soundMuted: this.audio.muted
      });
      this.ipcRenderer.send('sound-state-changed', this.audio.muted);
      this.ipcRenderer.send('charm-changed', this.charms.activeCharmId);
    }

    requestAnimationFrame(() => this.loop());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupIPC() {
    if (!this.ipcRenderer) return;

    this.ipcRenderer.on('switch-charm', (event, charmId) => {
      this.switchCharm(charmId);
    });

    this.ipcRenderer.on('trigger-ritual', () => {
      this.performRitual();
    });

    this.ipcRenderer.on('toggle-sound', () => {
      this.toggleSound();
    });

    this.ipcRenderer.on('recenter-charm', () => {
      this.recenter();
    });

    this.ipcRenderer.on('toggle-visibility', (event, state) => {
      this.visible = Boolean(state);
      this.canvas.style.display = this.visible ? 'block' : 'none';
      if (!this.visible) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateMouseIgnore(true);
      } else {
        this.recenter();
      }
    });
  }

  toggleSound() {
    this.audio.init();
    const muted = this.audio.toggleMute();
    try {
      localStorage.setItem('ld-sound-muted', muted ? 'true' : 'false');
    } catch (e) {}

    // If sound was turned ON, play a pleasant chime to confirm
    if (!muted) {
      this.audio.playBell();
    }

    if (this.ipcRenderer) {
      this.ipcRenderer.send('sound-state-changed', muted);
    }
  }

  updateMouseIgnore(shouldIgnore) {
    if (!this.ipcRenderer) return;
    if (this.isIgnoringMouse !== shouldIgnore) {
      this.isIgnoringMouse = shouldIgnore;
      this.ipcRenderer.send('set-ignore-mouse-events', shouldIgnore, { forward: true });
    }
  }

  switchCharm(charmId) {
    this.charms.setCharm(charmId);
    this.physics.applyImpulse((Math.random() - 0.5) * 30, -10);
    this.audio.playSway();

    if (this.ipcRenderer) {
      this.ipcRenderer.send('charm-changed', charmId);
    }
  }

  setupEvents() {
    let lastClickTime = 0;

    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.visible) return;
      this.audio.init();

      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Right-click on charm triggers ritual
      if (e.button === 2) {
        this.performRitual();
        return;
      }

      // Check double-click on charm to cycle to next model
      const now = performance.now();
      if (now - lastClickTime < 350) {
        const nextId = this.charms.cycleNextCharm();
        this.switchCharm(nextId);
        lastClickTime = 0;
        return;
      }
      lastClickTime = now;

      const hit = this.physics.startDrag(px, py);
      if (hit) {
        this.canvas.style.cursor = 'grabbing';
        this.audio.playSway();
        this.updateMouseIgnore(false);
        this.lastDragX = px;
        if (this.charms.activeCharmId === 'bmw') {
          this.charms.bmwSpinVelocity += (Math.random() - 0.5) * 0.15;
        }
      }
    });

    // Prevent default context menu on right-click over charm
    window.addEventListener('contextmenu', (e) => {
      const charmNode = this.physics.getCharmNode();
      if (!charmNode) return;
      const dist = Math.hypot(e.clientX - charmNode.x, e.clientY - charmNode.y);
      if (dist < charmNode.radius + 32) {
        e.preventDefault();
        this.performRitual();
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.visible) return;
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const charmNode = this.physics.getCharmNode();
      const dist = charmNode ? Math.hypot(px - charmNode.x, py - charmNode.y) : 9999;

      // Check hover over charm node OR intermediate cord nodes
      let isNearCord = false;
      for (let i = 0; i < this.physics.nodes.length; i++) {
        const n = this.physics.nodes[i];
        if (Math.hypot(px - n.x, py - n.y) < (n.radius || 4) + 16) {
          isNearCord = true;
          break;
        }
      }

      const nearTop = py < 40 && Math.abs(px - this.physics.anchorX) < 60;
      const isHoveringCharm = (charmNode && dist < charmNode.radius + 28) || isNearCord || nearTop;

      if (!this.physics.isDragging) {
        if (isHoveringCharm) {
          this.updateMouseIgnore(false);
          this.canvas.style.pointerEvents = 'auto';
          this.canvas.style.cursor = nearTop ? 'ew-resize' : 'grab';
        } else {
          this.updateMouseIgnore(true);
          this.canvas.style.pointerEvents = 'none';
          this.canvas.style.cursor = 'default';
        }
      }

      if (this.physics.isDragging || this.physics.isDraggingTop) {
        this.physics.drag(px, py);
        if (this.physics.isDragging && this.charms.activeCharmId === 'bmw' && this.lastDragX !== undefined) {
          const dx = px - this.lastDragX;
          if (Math.abs(dx) > 1) {
            this.charms.bmwSpinVelocity += dx * 0.007;
            if (Math.abs(this.charms.bmwSpinVelocity) > 0.65) {
              this.charms.bmwSpinVelocity = Math.sign(this.charms.bmwSpinVelocity) * 0.65;
            }
          }
        }
        this.lastDragX = px;
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.physics.isDragging) {
        this.audio.playSway();
      }
      this.physics.endDrag();
      this.canvas.style.cursor = 'default';
    });

    // Keyboard Shortcuts: M = Mute/Unmute sound, C = Cycle charm, S = Ritual, R = Center, Ctrl+D = Toggle
    window.addEventListener('keydown', (e) => {
      const isCtrlCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (key === 'm') {
        e.preventDefault();
        this.toggleSound();
      } else if (isCtrlCmd && key === 'd') {
        e.preventDefault();
        if (this.ipcRenderer) {
          this.ipcRenderer.send('toggle-overlay-shortcut');
        }
      } else if (key === 'c') {
        const nextId = this.charms.cycleNextCharm();
        this.switchCharm(nextId);
      } else if (key === 's') {
        this.performRitual();
      } else if (key === 'r') {
        this.recenter();
      }
    });
  }

  performRitual() {
    if (!this.visible) return;
    this.physics.applyImpulse((Math.random() - 0.5) * 40, -20);
    const charmNode = this.physics.getCharmNode();
    if (charmNode) {
      this.charms.performRitual(this.audio, this.particles, charmNode.x, charmNode.y);
    }
  }

  recenter() {
    this.physics.reset(window.innerWidth / 2);
    this.audio.playSway();
  }

  loop() {
    if (this.visible) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.physics.update();
      this.charms.update(this.audio);
      this.particles.update();

      this.charms.render(this.ctx, this.physics);
      this.particles.render(this.ctx);
    }

    requestAnimationFrame(() => this.loop());
  }
}

function startApp() {
  console.log('Starting DesktopOverlayApp...');
  try {
    new DesktopOverlayApp();
    console.log('DesktopOverlayApp started successfully!');
  } catch (err) {
    console.error('Error starting DesktopOverlayApp:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
