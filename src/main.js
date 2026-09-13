import { DanglePhysics } from './physics.js';
import { CharmManager } from './charms.js';
import { DangleAudio } from './audio.js';
import { ParticleSystem } from './particles.js';

class LuckyDangleApp {
  constructor() {
    this.canvas = document.getElementById('dangle-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.physics = new DanglePhysics({
      anchorX: window.innerWidth / 2,
      anchorY: 0,
      numSegments: 6,
      segmentLength: 32
    });

    this.charms = new CharmManager();
    this.audio = new DangleAudio();
    this.particles = new ParticleSystem();

    this.visible = true;
    this.ipcRenderer = null;

    // Detect Electron desktop mode
    if (window.require) {
      try {
        const electron = window.require('electron');
        this.ipcRenderer = electron.ipcRenderer;
      } catch (err) {
        console.log('Running in browser web mode');
      }
    }

    this.init();
  }

  async init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    await this.charms.loadAssets();

    this.setupEvents();
    this.setupUI();
    this.setupIPC();
    this.updateCardUI(this.charms.activeCharmId);

    // Start main physics & render loop
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setupIPC() {
    if (!this.ipcRenderer) return;

    this.ipcRenderer.on('switch-charm', (event, charmId) => {
      this.charms.setCharm(charmId);
      this.performRitual();
      this.updateCardUI(charmId);
    });

    this.ipcRenderer.on('trigger-ritual', () => {
      this.performRitual();
    });

    this.ipcRenderer.on('recenter-charm', () => {
      this.recenter();
    });
  }

  setupEvents() {
    this.canvas.addEventListener('pointerdown', (e) => {
      if (!this.visible) return;
      this.audio.init();

      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const hit = this.physics.startDrag(px, py);
      if (hit) {
        this.canvas.style.cursor = 'grabbing';
        this.audio.playSway();
        this.lastDragX = px;
        if (this.charms.activeCharmId === 'bmw') {
          this.charms.bmwSpinVelocity += (Math.random() - 0.5) * 0.15;
        }
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
      const isHoveringCharm = dist < charmNode.radius + 20 || isNearCord || nearTop;

      // In Electron desktop mode, enable click-through when cursor is outside charm body
      if (this.ipcRenderer && !this.physics.isDragging) {
        if (isHoveringCharm) {
          this.ipcRenderer.send('set-ignore-mouse-events', false);
        } else {
          this.ipcRenderer.send('set-ignore-mouse-events', true, { forward: true });
        }
      }

      if (!this.physics.isDragging) {
        if (isHoveringCharm) {
          this.canvas.style.pointerEvents = 'auto';
          this.canvas.style.cursor = nearTop ? 'ew-resize' : 'grab';
        } else {
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

    window.addEventListener('keydown', (e) => {
      const isCtrlCmd = e.ctrlKey || e.metaKey;
      if (isCtrlCmd) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          this.toggleVisibility();
        } else if (key === 's') {
          e.preventDefault();
          this.performRitual();
        } else if (key === 'r') {
          e.preventDefault();
          this.recenter();
        }
      }
    });
  }

  setupUI() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card) => {
      card.addEventListener('click', (e) => {
        const charmId = card.getAttribute('data-charm');

        if (e.target.classList.contains('ritual-btn')) {
          if (this.charms.activeCharmId === charmId) {
            this.performRitual();
            if (this.ipcRenderer) this.ipcRenderer.send('trigger-ritual');
            return;
          }
        }

        this.updateCardUI(charmId);
        this.charms.setCharm(charmId);
        this.performRitual();
        if (this.ipcRenderer) this.ipcRenderer.send('switch-charm', charmId);

        const picker = document.getElementById('emoji-picker');
        if (charmId === 'custom') {
          picker.classList.add('open');
        } else {
          picker.classList.remove('open');
        }
      });
    });

    const emojiInput = document.getElementById('emoji-input');
    const emojiPreview = document.getElementById('emoji-preview');
    if (emojiInput) {
      emojiInput.value = this.charms.customEmoji;
      if (emojiPreview) emojiPreview.textContent = this.charms.customEmoji;
      emojiInput.addEventListener('input', (e) => {
        const val = e.target.value.trim() || '🍀';
        this.charms.setCustomEmoji(val);
        if (emojiPreview) emojiPreview.textContent = val;
      });
    }

    document.getElementById('btn-ritual')?.addEventListener('click', () => this.performRitual());
    document.getElementById('btn-recenter')?.addEventListener('click', () => this.recenter());

    const btnAudio = document.getElementById('btn-audio');
    const updateMainAudioUI = (muted) => {
      if (!btnAudio) return;
      if (muted) {
        btnAudio.innerHTML = `
          <svg class="sound-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          <span id="btn-audio-text">Sound OFF</span>
        `;
        btnAudio.classList.add('muted');
      } else {
        btnAudio.innerHTML = `
          <svg class="sound-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <span id="btn-audio-text">Sound ON</span>
        `;
        btnAudio.classList.remove('muted');
      }
    };

    btnAudio?.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      updateMainAudioUI(muted);
    });

    document.getElementById('btn-toggle-dangle')?.addEventListener('click', () => this.toggleVisibility());
  }

  updateCardUI(charmId) {
    const cards = document.querySelectorAll('.card');
    cards.forEach((c) => {
      if (c.getAttribute('data-charm') === charmId) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  toggleVisibility() {
    this.visible = !this.visible;
    this.canvas.style.display = this.visible ? 'block' : 'none';
  }

  performRitual() {
    if (!this.visible) return;
    this.physics.applyImpulse((Math.random() - 0.5) * 40, -20);
    const charmNode = this.physics.getCharmNode();
    this.charms.performRitual(this.audio, this.particles, charmNode.x, charmNode.y);
  }

  recenter() {
    this.physics.reset(window.innerWidth / 2);
    this.audio.playSway();
  }

  loop(timestamp) {
    if (this.visible) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.physics.update();
      this.charms.update(this.audio);
      this.particles.update();

      this.charms.render(this.ctx, this.physics);
      this.particles.render(this.ctx);
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new LuckyDangleApp();
});
