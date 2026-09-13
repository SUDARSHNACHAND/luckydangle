import { DanglePhysics } from './physics.js';
import { CharmManager } from './charms.js';
import { DangleAudio } from './audio.js';
import { ParticleSystem } from './particles.js';

class DesktopOverlayApp {
  constructor() {
    this.canvas = document.getElementById('dangle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.bar = document.getElementById('overlay-bar');
    this.soundBtn = document.getElementById('overlay-sound-btn');

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
    this.setupUI();
    this.setupIPC();
    this.updateBarUI(this.charms.activeCharmId);
    this.updateRitualButtonUI();
    this.updateSoundButtonUI();

    if (this.ipcRenderer) {
      this.ipcRenderer.send('sound-state-changed', this.audio.muted);
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
      if (this.bar) this.bar.style.display = this.visible ? 'flex' : 'none';
      if (!this.visible) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateMouseIgnore(true);
      } else {
        this.recenter();
      }
    });
  }

  setupUI() {
    // Model switcher buttons
    const btns = document.querySelectorAll('.model-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const charmId = btn.getAttribute('data-charm');
        if (charmId === 'custom' && this.charms.activeCharmId === 'custom') {
          const picked = window.prompt('Enter your custom lucky emoji:', this.charms.customEmoji);
          if (picked && picked.trim()) {
            this.charms.setCustomEmoji(picked.trim());
          }
        }
        this.switchCharm(charmId);
      });
    });

    // Ritual quick button
    document.getElementById('overlay-ritual-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.performRitual();
    });

    // Sound ON / OFF toggle button
    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSound();
      });
    }

    this.updateRitualButtonUI();
  }

  toggleSound() {
    this.audio.init();
    const muted = this.audio.toggleMute();
    try {
      localStorage.setItem('ld-sound-muted', muted ? 'true' : 'false');
    } catch (e) {}

    this.updateSoundButtonUI();

    // If sound was turned ON, play a pleasant chime to confirm!
    if (!muted) {
      this.audio.playBell();
    }

    if (this.ipcRenderer) {
      this.ipcRenderer.send('sound-state-changed', muted);
    }
  }

  updateSoundButtonUI() {
    if (!this.soundBtn) return;
    if (this.audio.muted) {
      this.soundBtn.innerHTML = `
        <svg class="sound-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
        <span class="sound-btn-text">Sound OFF</span>
      `;
      this.soundBtn.classList.add('muted');
      this.soundBtn.title = 'Sound is OFF (Click or press M to turn ON)';
    } else {
      this.soundBtn.innerHTML = `
        <svg class="sound-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        <span class="sound-btn-text">Sound ON</span>
      `;
      this.soundBtn.classList.remove('muted');
      this.soundBtn.title = 'Sound is ON (Click or press M to turn OFF)';
    }
  }

  updateRitualButtonUI() {
    const ritualBtn = document.getElementById('overlay-ritual-btn');
    if (!ritualBtn) return;
    const charmId = this.charms.activeCharmId;
    if (charmId === 'bmw') {
      ritualBtn.textContent = '🏎️ Rev the engine';
      ritualBtn.title = 'Rev the engine & spin BMW propeller (S)';
    } else if (charmId === 'daruma') {
      const labels = ['✨ Make a wish', '🎯 Wish granted', '🔄 Begin anew'];
      const text = labels[this.charms.darumaEyeState] || '✨ Ritual';
      ritualBtn.textContent = text;
      ritualBtn.title = text + ' (S)';
    } else {
      const charm = this.charms.charms[charmId];
      const text = '✨ ' + (charm ? charm.ritualName : 'Ritual');
      ritualBtn.textContent = text;
      ritualBtn.title = (charm ? charm.ritualName : 'Perform Ritual') + ' (S)';
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
    this.updateBarUI(charmId);
    this.updateRitualButtonUI();
  }

  updateBarUI(charmId) {
    document.querySelectorAll('.model-btn').forEach((b) => {
      if (b.getAttribute('data-charm') === charmId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
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
      const dist = Math.hypot(px - charmNode.x, py - charmNode.y);

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
      const isHoveringCharm = dist < charmNode.radius + 28 || isNearCord || nearTop;

      // Robust coordinate bounds check for the floating button bar!
      let isOverBar = false;
      if (this.bar && this.visible) {
        const barRect = this.bar.getBoundingClientRect();
        isOverBar = (
          px >= barRect.left - 6 &&
          px <= barRect.right + 6 &&
          py >= barRect.top - 6 &&
          py <= barRect.bottom + 6
        );
      }

      if (!this.physics.isDragging) {
        if (isHoveringCharm || isOverBar) {
          this.updateMouseIgnore(false);
          this.canvas.style.pointerEvents = isHoveringCharm ? 'auto' : 'none';
          this.canvas.style.cursor = nearTop ? 'ew-resize' : (isHoveringCharm ? 'grab' : 'default');
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
    this.charms.performRitual(this.audio, this.particles, charmNode.x, charmNode.y);
    this.updateRitualButtonUI();
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

window.addEventListener('DOMContentLoaded', () => {
  new DesktopOverlayApp();
});
