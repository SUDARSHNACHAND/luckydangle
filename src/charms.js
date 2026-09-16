/**
 * Charm Renderer and Ritual Logic for Lucky Dangle
 * Includes all charms: Nimbu-mirchi, Maneki-neko, Drishti bommai, Hamsa, Nazar, Ghanta,
 * Daruma, Himmeli, Chinese Knot, Custom Emoji.
 */

export class CharmManager {
  constructor() {
    this.images = {};
    this.loaded = false;
    this.activeCharmId = 'nimbu-mirchi';
    
    // Maneki-neko front-and-back beckoning movement state
    this.manekiTime = 0;
    this.manekiWaveA = 0;
    this.manekiRitualStartTime = null;
    this.manekiLastPawSound = -1;

    this.drishtiColorHue = 0;
    this.drishtiAuraRadius = 0;

    this.hamsaAuraRadius = 0;
    this.nazarPulse = 0;

    this.bellRingScale = 1.0;
    this.bellRinging = false;
    this.bellTimeout = null;

    // Daruma ritual state: 0 = unpainted, 1 = left eye painted (wish made), 2 = both eyes painted (wish granted)
    let savedDaruma = 0;
    try {
      savedDaruma = parseInt(localStorage.getItem('ld-daruma') || '0', 10);
      if (isNaN(savedDaruma) || savedDaruma < 0 || savedDaruma > 2) savedDaruma = 0;
    } catch (e) {
      savedDaruma = 0;
    }
    this.darumaEyeState = savedDaruma;
    this.darumaEyePainted = this.darumaEyeState > 0;
    this.darumaWishScale = 1.0;

    // Himmeli 3D spin rotation
    this.himmeliRotation = 0;
    this.himmeliSpinning = false;
    this.himmeliSpinVelocity = 0.005;

    // Chinese Knot cinch pulse
    this.knotCinchScale = 1.0;

    // BMW Spinner rotation, velocity, and RPM aura
    this.bmwRotation = 0;
    this.bmwSpinVelocity = 0.012;
    this.bmwSpinning = false;
    this.bmwGlow = 0;

    // Murugan Vel divine aura and golden radiance
    this.veluAuraRadius = 0;
    this.veluGlow = 0;

    // Saved custom emoji
    let savedEmoji = '🍀';
    try {
      savedEmoji = localStorage.getItem('ld-custom-emoji') || '🍀';
    } catch (e) {}
    this.customEmoji = savedEmoji;

    // Saved active charm (default to BMW)
    let savedCharm = 'bmw';
    try {
      savedCharm = localStorage.getItem('ld-active-charm') || 'bmw';
    } catch (e) {}
    this.activeCharmId = savedCharm;

    this.charms = {
      'bmw': {
        name: 'BMW Symbol Spinner',
        origin: 'Bavaria, Germany',
        description: 'The iconic Bavarian roundel & propeller spinner. Flick or trigger ritual to rev the engine and spin at high RPM.',
        ritualName: 'Rev the engine',
        beads: { small: 'bmwCyan', big: 'bmwDarkBlue', bigSize: 13, accent: 'bmwRed' }
      },
      'murugan-vel': {
        name: 'Murugan Vel (Sacred Spear)',
        origin: 'Tamil Nadu / Ancient India',
        description: 'The divine lance of Lord Murugan representing wisdom, courage, and triumph over obstacles.',
        ritualName: 'Vetri Vel! (Harohara)',
        beads: { small: 'gold', big: 'vermilion', bigSize: 13, accent: 'gold' }
      },
      'nimbu-mirchi': {
        name: 'Nimbu-mirchi',
        origin: 'India',
        description: 'Seven chillies and a lemon hung at the threshold to turn away misfortune.',
        ritualName: 'Hang a fresh garland',
        beads: null
      },
      'maneki-neko': {
        name: 'Maneki-neko',
        origin: 'Japan',
        description: 'A beckoning cat that invites good fortune in.',
        ritualName: 'Beckon good fortune',
        beads: { small: 'gold', big: 'lacquerRed', bigSize: 12 }
      },
      'daruma': {
        name: 'Daruma',
        origin: 'Japan',
        description: 'A wishing doll for goals that take grit. Paint one eye when you make a wish and the other when it comes true.',
        ritualName: 'Make a wish',
        beads: { small: 'gold', big: 'white', bigSize: 12 }
      },
      'drishti-bommai': {
        name: 'Drishti bommai',
        origin: 'South India',
        description: 'A fierce guardian painted to meet the first bad glance.',
        ritualName: 'Repaint the guardian',
        beads: { small: 'gold', big: 'stripedRed', bigSize: 12 }
      },
      'chinese-knot': {
        name: 'Páncháng jié (Chinese Knot)',
        origin: 'China',
        description: 'One unbroken red cord tied for good fortune without end.',
        ritualName: 'Tie in good fortune',
        beads: { small: 'lacquerRed', big: 'gold', bigSize: 12 }
      },
      'himmeli': {
        name: 'Himmeli',
        origin: 'Finland',
        description: 'A rye-straw tradition for abundance and fruitful flow of work.',
        ritualName: 'Set it turning',
        beads: null
      },
      'hamsa': {
        name: 'Hamsa',
        origin: 'Middle East & North Africa',
        description: 'An open hand carried for protection and good fortune.',
        ritualName: 'Ward off bad luck',
        beads: { small: 'gold', big: 'deepBlue', bigSize: 12 }
      },
      'nazar': {
        name: 'Nazar boncuğu',
        origin: 'Turkey & Mediterranean',
        description: 'A glass eye worn against the evil eye.',
        ritualName: 'Give it a flick',
        beads: { small: 'white', big: 'eye', bigSize: 12 }
      },
      'ghanta': {
        name: 'Ghanta (Bell)',
        origin: 'India',
        description: 'A bell rung to clear the air and mark a new beginning.',
        ritualName: 'Ring the bell',
        beads: { small: 'gold', big: 'lacquerRed', bigSize: 12 }
      },
      'custom': {
        name: 'Custom Emoji',
        origin: 'Yours',
        description: 'Choose any emoji and hang it from your screen string.',
        ritualName: 'Pick an emoji',
        beads: { small: 'white', big: 'emojiTwin', bigSize: 14 }
      }
    };
  }

  async loadAssets() {
    const assetList = [
      'BMW.svg.webp',
      'murugan vel.png',
      'murugan-vel.png',
      'chinese-knot.png',
      'daruma.png',
      'drishti-bommai.png',
      'ghanta.png',
      'hamsa.png',
      'himmeli.png',
      'maneki-arm.png',
      'maneki-body.png',
      'maneki-neko.png',
      'nazar.png',
      'nimbu-chili-1.png',
      'nimbu-chili-2.png',
      'nimbu-chili-3.png',
      'nimbu-chili-4.png',
      'nimbu-chili-5.png',
      'nimbu-chili-6.png',
      'nimbu-chili-7.png',
      'nimbu-coal.png',
      'nimbu-lemon.png'
    ];

    let nodeFs = null;
    let nodePath = null;
    try {
      if (window.require) {
        nodeFs = window.require('fs');
        nodePath = window.require('path');
      }
    } catch (e) {}

    const promises = assetList.map((filename) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.images[filename] = img;
          resolve();
        };
        img.onerror = () => {
          if (!img.src.startsWith('data:') && !img.src.includes('./charms/')) {
            img.src = `./charms/${filename}`;
          } else {
            console.warn(`Could not load charm asset: ${filename}`);
            resolve();
          }
        };

        // If in Electron, read directly via Node fs as Base64 for 100% reliable zero-delay loading
        let loadedViaFs = false;
        if (nodeFs && nodePath) {
          const candidatePaths = [
            nodePath.join(__dirname, 'charms', filename),
            nodePath.join(__dirname, '../charms', filename),
            nodePath.join(__dirname, '../public/charms', filename),
            nodePath.join(process.cwd(), 'charms', filename),
            nodePath.join(process.cwd(), 'dist/charms', filename),
            nodePath.join(process.cwd(), 'public/charms', filename),
            'c:/luckydangle/charms/' + filename,
            'c:/luckydangle/public/charms/' + filename
          ];

          for (const p of candidatePaths) {
            if (nodeFs.existsSync(p)) {
              try {
                const b64 = nodeFs.readFileSync(p).toString('base64');
                const mime = filename.endsWith('.webp') ? 'image/webp' : (filename.endsWith('.svg') ? 'image/svg+xml' : 'image/png');
                img.src = `data:${mime};base64,${b64}`;
                loadedViaFs = true;
                break;
              } catch (err) {}
            }
          }
        }

        if (!loadedViaFs) {
          img.src = `./charms/${filename}`;
        }
      });
    });

    await Promise.all(promises);
    this.loaded = true;
  }

  setCharm(id) {
    if (this.charms[id]) {
      this.activeCharmId = id;
      try {
        localStorage.setItem('ld-active-charm', id);
      } catch (e) {}
    }
  }

  setCustomEmoji(emoji) {
    this.customEmoji = emoji || '🍀';
    try {
      localStorage.setItem('ld-custom-emoji', this.customEmoji);
    } catch (e) {}
  }

  cycleNextCharm() {
    const keys = Object.keys(this.charms);
    const currentIndex = keys.indexOf(this.activeCharmId);
    const nextIndex = (currentIndex + 1) % keys.length;
    this.setCharm(keys[nextIndex]);
    return this.activeCharmId;
  }

  performRitual(audioManager, particles, charmX = window.innerWidth / 2, charmY = 200) {
    const charmId = this.activeCharmId;

    if (charmId === 'nimbu-mirchi') {
      audioManager.playSparkle();
      if (particles) particles.burst(charmX, charmY, '#22c55e', 30);
    } else if (charmId === 'maneki-neko') {
      this.manekiRitualStartTime = performance.now() / 1000;
      this.manekiLastPawSound = -1;
      audioManager.playCatPaw();
      if (particles) particles.burst(charmX, charmY, '#fbbf24', 35);
    } else if (charmId === 'daruma') {
      this.darumaEyeState = (this.darumaEyeState + 1) % 3;
      this.darumaEyePainted = this.darumaEyeState > 0;
      try {
        localStorage.setItem('ld-daruma', String(this.darumaEyeState));
      } catch (e) {}

      this.darumaWishScale = 1.25;

      if (this.darumaEyeState === 1) {
        // First ritual click: Wish made (paint left eye with calligraphy brush & wishing chime)
        audioManager.playDarumaWish();
        if (particles) particles.burst(charmX, charmY, '#dc2626', 25);
      } else if (this.darumaEyeState === 2) {
        // Second ritual click: Wish granted (paint right eye too, celebratory gong & golden sparkles!)
        audioManager.playDarumaFulfilled();
        if (particles) particles.burst(charmX, charmY, '#fbbf24', 40);
      } else {
        // Third click: Begin anew (clear eyes to blank, soft clean bell chime)
        audioManager.playBell();
        if (particles) particles.burst(charmX, charmY, '#ffffff', 20);
      }
    } else if (charmId === 'himmeli') {
      this.himmeliSpinning = true;
      this.himmeliSpinVelocity = 0.08;
      audioManager.playWindChime();
      if (particles) particles.burst(charmX, charmY, '#eab308', 25);
    } else if (charmId === 'chinese-knot') {
      this.knotCinchScale = 1.2;
      audioManager.playChineseGong();
      if (particles) particles.burst(charmX, charmY, '#ef4444', 30);
    } else if (charmId === 'drishti-bommai') {
      this.drishtiColorHue = (this.drishtiColorHue + 60) % 360;
      this.drishtiAuraRadius = 80;
      audioManager.playSparkle();
      if (particles) particles.burst(charmX, charmY, `hsl(${this.drishtiColorHue}, 90%, 60%)`, 25);
    } else if (charmId === 'hamsa') {
      this.hamsaAuraRadius = 120;
      audioManager.playMysticRipple();
      if (particles) particles.burst(charmX, charmY, '#3b82f6', 25);
    } else if (charmId === 'nazar') {
      this.nazarPulse = 1.0;
      audioManager.playMysticRipple();
      if (particles) particles.burst(charmX, charmY, '#60a5fa', 25);
    } else if (charmId === 'ghanta') {
      if (this.bellTimeout) clearTimeout(this.bellTimeout);
      this.bellRingScale = 1.25;
      this.bellRinging = true;
      audioManager.playBell();
      if (particles) particles.burst(charmX, charmY, '#fbbf24', 35);
      this.bellTimeout = setTimeout(() => { this.bellRinging = false; }, 800);
    } else if (charmId === 'custom') {
      audioManager.playSparkle();
      if (particles) particles.burst(charmX, charmY, '#ec4899', 25);
    } else if (charmId === 'bmw') {
      this.bmwSpinVelocity = 0.58;
      this.bmwSpinning = true;
      this.bmwGlow = 1.0;
      audioManager.playBmwEngine();
      if (particles) {
        // M-power colors: Cyan, Dark Blue, Crimson Red, and Metallic Chrome
        particles.burst(charmX, charmY, '#00a3e0', 20);
        particles.burst(charmX, charmY, '#1c4482', 15);
        particles.burst(charmX, charmY, '#e21a22', 20);
        particles.burst(charmX, charmY, '#ffffff', 15);
      }
    } else if (charmId === 'murugan-vel') {
      this.veluGlow = 1.0;
      this.veluAuraRadius = 140;
      audioManager.playVeluSound();
      if (particles) {
        // Sacred golden radiance, vermilion kumkum, and vibhuti white
        particles.burst(charmX, charmY, '#fbbf24', 30);
        particles.burst(charmX, charmY, '#ef4444', 20);
        particles.burst(charmX, charmY, '#f59e0b', 20);
        particles.burst(charmX, charmY, '#ffffff', 15);
      }
    }
  }

  update(audioManager) {
    const nowSec = performance.now() / 1000;
    this.manekiTime += 0.016;

    // Slow, organic breathing beckoning cycle (~3.5s per gentle wave)
    const slowPhase = this.manekiTime * 1.8;
    const slowWave = (1 - Math.cos(slowPhase)) / 2;
    const idleA = slowWave * 0.55;

    if (this.manekiRitualStartTime !== null) {
      const elapsed = nowSec - this.manekiRitualStartTime;
      const duration = 11.0;
      if (elapsed >= duration) {
        this.manekiRitualStartTime = null;
        this.manekiWaveA = idleA;
      } else {
        const i = elapsed / duration;
        const env = Math.pow(1 - i * i, 2);
        const wavePhase = 2 * Math.PI * (2 * elapsed - 0.45 * elapsed * elapsed / duration);
        const activeA = env * (1 - Math.cos(wavePhase)) / 2;

        const cycleIdx = Math.floor((2 * elapsed - 0.45 * elapsed * elapsed / duration));
        if (cycleIdx > this.manekiLastPawSound) {
          this.manekiLastPawSound = cycleIdx;
          if (audioManager && !audioManager.muted) audioManager.playCatPaw();
        }

        this.manekiWaveA = Math.max(activeA, idleA);
      }
    } else {
      this.manekiWaveA = idleA;
    }

    if (this.darumaWishScale > 1.0) {
      this.darumaWishScale += (1.0 - this.darumaWishScale) * 0.15;
    }

    // Himmeli continuous gentle spin + ritual spin decay
    this.himmeliRotation += this.himmeliSpinVelocity;
    if (this.himmeliSpinning) {
      this.himmeliSpinVelocity *= 0.985;
      if (this.himmeliSpinVelocity < 0.006) {
        this.himmeliSpinVelocity = 0.005;
        this.himmeliSpinning = false;
      }
    }

    if (this.knotCinchScale > 1.0) {
      this.knotCinchScale += (1.0 - this.knotCinchScale) * 0.15;
    }

    if (this.drishtiAuraRadius > 0) {
      this.drishtiAuraRadius *= 0.92;
      if (this.drishtiAuraRadius < 1) this.drishtiAuraRadius = 0;
    }

    if (this.hamsaAuraRadius > 0) {
      this.hamsaAuraRadius *= 0.91;
      if (this.hamsaAuraRadius < 1) this.hamsaAuraRadius = 0;
    }

    if (this.nazarPulse > 0) {
      this.nazarPulse *= 0.92;
      if (this.nazarPulse < 0.01) this.nazarPulse = 0;
    }

    if (this.bellRingScale > 1.0) {
      this.bellRingScale += (1.0 - this.bellRingScale) * 0.15;
    }

    // BMW Spinner continuous rotation + high-RPM deceleration
    this.bmwRotation += this.bmwSpinVelocity;
    if (this.bmwSpinning || Math.abs(this.bmwSpinVelocity) > 0.015) {
      this.bmwSpinVelocity *= 0.988;
      if (Math.abs(this.bmwSpinVelocity) <= 0.015) {
        this.bmwSpinVelocity = 0.012;
        this.bmwSpinning = false;
      }
    }
    if (this.bmwGlow > 0) {
      this.bmwGlow *= 0.94;
      if (this.bmwGlow < 0.01) this.bmwGlow = 0;
    }

    // Murugan Vel aura and golden glow decay
    if (this.veluAuraRadius > 0) {
      this.veluAuraRadius *= 0.92;
      if (this.veluAuraRadius < 1) this.veluAuraRadius = 0;
    }
    if (this.veluGlow > 0) {
      this.veluGlow *= 0.93;
      if (this.veluGlow < 0.01) this.veluGlow = 0;
    }
  }

  render(ctx, physics) {
    const nodes = physics.nodes;
    if (!nodes || nodes.length < 2) return;

    ctx.save();

    // 1. Render String / Cord
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.strokeStyle = '#61451f';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.strokeStyle = '#e0bd7a';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 2. Render Beads clustered authentically along cord above charm
    const charmInfo = this.charms[this.activeCharmId] || this.charms['daruma'];
    if (charmInfo && charmInfo.beads) {
      const beads = charmInfo.beads;
      // Stations at distances 34px, 24px, 15px above the charm attachment point
      const stations = [34, 24, 15];
      const beadList = [
        { type: beads.small, size: 7 },
        { type: beads.big, size: beads.bigSize || 12 },
        { type: beads.accent || beads.small, size: 7 }
      ];

      stations.forEach((dist, idx) => {
        const pt = this.getPointAlongCord(nodes, dist);
        const b = beadList[idx];
        this.renderBead(ctx, pt.x, pt.y, b.type, b.size);
      });
    }

    // 3. Render Main Charm Body at terminal node
    const charmNode = physics.getCharmNode();
    ctx.save();
    ctx.translate(charmNode.x, charmNode.y);
    ctx.rotate(physics.angle);

    this.renderActiveCharmBody(ctx);

    ctx.restore();
    ctx.restore();
  }

  renderActiveCharmBody(ctx) {
    const id = this.activeCharmId;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    if (id === 'nimbu-mirchi') {
      this.renderNimbuMirchi(ctx);
    } else if (id === 'maneki-neko') {
      this.renderManekiNeko(ctx);
    } else if (id === 'daruma') {
      this.renderDaruma(ctx);
    } else if (id === 'himmeli') {
      this.renderHimmeli(ctx);
    } else if (id === 'chinese-knot') {
      this.renderChineseKnot(ctx);
    } else if (id === 'drishti-bommai') {
      this.renderDrishtiBommai(ctx);
    } else if (id === 'hamsa') {
      this.renderHamsa(ctx);
    } else if (id === 'nazar') {
      this.renderNazar(ctx);
    } else if (id === 'ghanta') {
      this.renderGhanta(ctx);
    } else if (id === 'bmw') {
      this.renderBMW(ctx);
    } else if (id === 'murugan-vel') {
      this.renderMuruganVel(ctx);
    } else if (id === 'custom') {
      this.renderCustomEmoji(ctx);
    }
  }

  renderNimbuMirchi(ctx) {
    const lemonImg = this.images['nimbu-lemon.png'];
    const coalImg = this.images['nimbu-coal.png'];

    for (let i = 1; i <= 7; i++) {
      const chiliImg = this.images[`nimbu-chili-${i}.png`];
      if (chiliImg) {
        ctx.save();
        const offsetY = -60 + i * 11;
        const angle = (i % 2 === 0 ? 1 : -1) * 0.12;
        ctx.translate(0, offsetY);
        ctx.rotate(angle);
        ctx.drawImage(chiliImg, -28, -6, 56, 14);
        ctx.restore();
      }
    }

    if (lemonImg) {
      ctx.drawImage(lemonImg, -24, 15, 48, 52);
    } else {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, 35, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    if (coalImg) {
      ctx.drawImage(coalImg, -12, 65, 24, 22);
    } else {
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(0, 68, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderManekiNeko(ctx) {
    const bodyImg = this.images['maneki-body.png'] || this.images['maneki-neko.png'];
    const armImg = this.images['maneki-arm.png'];

    const w = 68;
    const h = 89;
    const x = -w / 2;
    const y = -0.13 * h; // -11.57px

    const a = this.manekiWaveA || 0;
    const slowPhase = this.manekiTime * 1.8;

    // 1. Cat Body & Neko: Front-and-back 3D perspective weight transfer & breathing action
    ctx.save();
    const bodyShiftY = Math.sin(slowPhase) * 1.0;
    const bodyForeshorten = 1.0 - 0.018 * a; // 3D depth tilt
    const bodyPerspective = 1.0 + 0.014 * a; // perspective expansion
    const bodySway = Math.sin(slowPhase * 0.5) * 0.012; // subtle gentle sway

    ctx.translate(0, bodyShiftY);
    ctx.scale(bodyPerspective, bodyForeshorten);
    ctx.rotate(bodySway);

    if (bodyImg) {
      ctx.drawImage(bodyImg, x, y, w, h);
    }
    ctx.restore();

    // 2. Cat Arm: 3D front-and-back beckoning wave with authentic shoulder pivot
    if (armImg) {
      ctx.save();
      // Shoulder pivot: [0.2431, 0.5713]
      const c = x + 0.2431 * w;
      const hPivot = y + 0.5713 * h;

      // 3D foreshortening: vertical scale down to 0.766 as paw extends toward viewer
      const g = 1 - (1 - Math.cos(40 * Math.PI / 180)) * a;
      // Perspective expansion: paw appears larger as it reaches front
      const b = 1 + 0.07 * a;
      // Natural waving tilt angle
      const u = (7 * a * Math.PI) / 180;

      ctx.translate(c, hPivot);
      ctx.scale(b, g);
      ctx.rotate(u);
      ctx.translate(-c, -hPivot);

      ctx.drawImage(armImg, x, y, w, h);
      ctx.restore();
    }
  }

  getPointAlongCord(nodes, distanceAboveCharm) {
    let remaining = distanceAboveCharm;
    for (let i = nodes.length - 1; i > 0; i--) {
      const p2 = nodes[i];
      const p1 = nodes[i - 1];
      const segLen = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 0.001;
      if (remaining <= segLen) {
        const t = remaining / segLen;
        return {
          x: p2.x + (p1.x - p2.x) * t,
          y: p2.y + (p1.y - p2.y) * t,
          angle: Math.atan2(p2.x - p1.x, p2.y - p1.y)
        };
      }
      remaining -= segLen;
    }
    return { x: nodes[0].x, y: nodes[0].y, angle: 0 };
  }

  renderBead(ctx, x, y, type, size) {
    const r = size / 2;

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(x + 1.2, y + 1.8, r, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'eye') {
      // Nazar Evil Eye bead
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.58, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.36, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'stripedRed') {
      // Drishti Bommai striped red bead
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
      grad.addColorStop(0, '#ff7a66');
      grad.addColorStop(0.6, '#d4211a');
      grad.addColorStop(1, '#6b050a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Golden stripes
      ctx.strokeStyle = 'rgba(245, 194, 41, 0.85)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(x, y - r * 0.2, r * 0.7, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + r * 0.2, r * 0.7, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (type === 'emojiTwin') {
      ctx.font = `${Math.round(size * 0.9)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.customEmoji, x, y);
      return;
    } else {
      // Glass beads: gold, white, lacquerRed, deepBlue
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
      if (type === 'white') {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.6, '#ebebf0');
        grad.addColorStop(1, '#9ea1ad');
      } else if (type === 'gold') {
        grad.addColorStop(0, '#ffe685');
        grad.addColorStop(0.5, '#edb52e');
        grad.addColorStop(1, '#9e6b0a');
      } else if (type === 'lacquerRed') {
        grad.addColorStop(0, '#ff7a66');
        grad.addColorStop(0.6, '#d4211a');
        grad.addColorStop(1, '#6b050a');
      } else if (type === 'bmwCyan') {
        grad.addColorStop(0, '#7dd3fc');
        grad.addColorStop(0.5, '#00a3e0');
        grad.addColorStop(1, '#025884');
      } else if (type === 'bmwDarkBlue') {
        grad.addColorStop(0, '#60a5fa');
        grad.addColorStop(0.5, '#1c4482');
        grad.addColorStop(1, '#0c2246');
      } else if (type === 'bmwRed') {
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(0.5, '#e21a22');
        grad.addColorStop(1, '#780a10');
      } else if (type === 'bmwChrome') {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#e2e8f0');
        grad.addColorStop(0.7, '#94a3b8');
        grad.addColorStop(1, '#334155');
      } else if (type === 'deepBlue') {
        grad.addColorStop(0, '#6b8ce0');
        grad.addColorStop(0.6, '#294294');
        grad.addColorStop(1, '#0a1447');
      } else if (type === 'porscheRed') {
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(0.5, '#dc2626');
        grad.addColorStop(1, '#7f1d1d');
      } else if (type === 'stuttgartBlack') {
        grad.addColorStop(0, '#475569');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, '#020617');
      } else if (type === 'vermilion') {
        grad.addColorStop(0, '#fca5a5');
        grad.addColorStop(0.5, '#dc2626');
        grad.addColorStop(1, '#881337');
      } else {
        grad.addColorStop(0, '#ffe685');
        grad.addColorStop(1, '#9e6b0a');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Specular gloss reflection highlight ellipse
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(x - 0.17 * size, y - 0.23 * size, 0.135 * size, 0.10 * size, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
  }

  renderDaruma(ctx) {
    const img = this.images['daruma.png'];
    ctx.save();
    ctx.scale(this.darumaWishScale, this.darumaWishScale);

    const w = 72;
    const h = 72;
    const x = -w / 2;
    const y = -0.14 * h; // -10.08px, authentic attachment offset

    if (img) {
      ctx.drawImage(img, x, y, w, h);
    } else {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, 20, 35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Authentic eye pupil coordinates and proportions from luckydangle.app:
    // Left eye (viewer left): [.3433, .3584]
    // Right eye (viewer right): [.6509, .3584]
    // pupil diameter: 0.115 * w, ink: '#171416'
    const a = 0.115 * w;
    const pupilRadius = a / 2;
    const highlightRadius = 0.12 * a;

    const drawPupil = ([d, c]) => {
      const cx = x + d * w;
      const cy = y + c * h;

      // Deep calligraphy ink black pupil
      ctx.fillStyle = '#171416';
      ctx.beginPath();
      ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Specular gloss highlight spark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(cx - 0.18 * a, cy - 0.20 * a, highlightRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    // State 1: Left eye painted (Wish made)
    if (this.darumaEyeState >= 1) {
      drawPupil([0.3433, 0.3584]);
    }
    // State 2: Both eyes painted (Goal achieved / wish granted - matches user screenshot!)
    if (this.darumaEyeState >= 2) {
      drawPupil([0.6509, 0.3584]);
    }

    ctx.restore();
  }

  renderHimmeli(ctx) {
    const img = this.images['himmeli.png'];
    ctx.save();

    // Subtle 3D perspective spin projection
    const scaleX = Math.cos(this.himmeliRotation);
    ctx.scale(scaleX, 1);

    if (img) {
      ctx.drawImage(img, -36, -15, 72, 94);
    }
    ctx.restore();
  }

  renderChineseKnot(ctx) {
    const img = this.images['chinese-knot.png'];
    ctx.save();
    ctx.scale(this.knotCinchScale, this.knotCinchScale);

    if (img) {
      ctx.drawImage(img, -36, -15, 72, 94);
    }
    ctx.restore();
  }

  renderDrishtiBommai(ctx) {
    const img = this.images['drishti-bommai.png'];

    if (this.drishtiAuraRadius > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 25, this.drishtiAuraRadius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.drishtiColorHue}, 90%, 60%, 0.35)`;
      ctx.fill();
      ctx.restore();
    }

    if (img) {
      if (this.drishtiColorHue > 0) {
        ctx.filter = `hue-rotate(${this.drishtiColorHue}deg) saturate(1.4)`;
      }
      ctx.drawImage(img, -38, -15, 76, 96);
      ctx.filter = 'none';
    }
  }

  renderHamsa(ctx) {
    const img = this.images['hamsa.png'];

    if (this.hamsaAuraRadius > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 20, this.hamsaAuraRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.8)';
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (img) {
      ctx.drawImage(img, -36, -15, 72, 94);
    }
  }

  renderNazar(ctx) {
    const img = this.images['nazar.png'];

    if (this.nazarPulse > 0) {
      ctx.save();
      const radius = 35 + this.nazarPulse * 30;
      ctx.beginPath();
      ctx.arc(0, 20, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${this.nazarPulse * 0.4})`;
      ctx.fill();
      ctx.restore();
    }

    if (img) {
      ctx.drawImage(img, -36, -15, 72, 72);
    }
  }

  renderGhanta(ctx) {
    const img = this.images['ghanta.png'];

    ctx.save();
    ctx.scale(this.bellRingScale, this.bellRingScale);

    if (this.bellRinging) {
      ctx.beginPath();
      ctx.arc(0, 25, 55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (img) {
      ctx.drawImage(img, -36, -15, 72, 94);
    }
    ctx.restore();
  }

  renderBMW(ctx) {
    const img = this.images['BMW.svg.webp'];
    const radius = 37;
    const centerY = 30;

    // 1. Sleek metallic chrome spinner hub & mounting bracket
    ctx.save();

    // Attachment link at cord terminal (0, 0)
    const loopGrad = ctx.createLinearGradient(-3, 0, 3, centerY - radius);
    loopGrad.addColorStop(0, '#f1f5f9');
    loopGrad.addColorStop(0.5, '#64748b');
    loopGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = loopGrad;
    ctx.fillRect(-2.5, -2, 5, centerY - radius + 3);

    // Fastener rivet
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. Aura glow if revved
    if (this.bmwGlow > 0) {
      ctx.beginPath();
      ctx.arc(0, centerY, radius + 16 * this.bmwGlow, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 163, 224, ${this.bmwGlow * 0.45})`;
      ctx.fill();
    }

    // 3. Outer Chrome Bezel / Spinner Hub Rim
    const bezelGrad = ctx.createRadialGradient(-8, centerY - 8, 16, 0, centerY, radius + 4.5);
    bezelGrad.addColorStop(0, '#ffffff');
    bezelGrad.addColorStop(0.25, '#cbd5e1');
    bezelGrad.addColorStop(0.6, '#475569');
    bezelGrad.addColorStop(0.85, '#1e293b');
    bezelGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(0, centerY, radius + 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Groove
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, centerY, radius + 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Rotating BMW Emblem (Spinner)
    ctx.save();
    ctx.translate(0, centerY);
    ctx.rotate(this.bmwRotation);

    if (img) {
      ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);
    } else {
      // Procedural fallback roundel
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0a';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.fillStyle = '#0066b1';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius * 0.65, -Math.PI / 2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius * 0.65, Math.PI / 2, Math.PI);
      ctx.closePath();
      ctx.fill();
    }

    // High-RPM Spinner Motion Blur & Gloss Arcs
    const absSpeed = Math.abs(this.bmwSpinVelocity);
    if (absSpeed > 0.035) {
      const blurAlpha = Math.min(0.5, (absSpeed - 0.035) * 0.9);
      ctx.fillStyle = `rgba(0, 163, 224, ${blurAlpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.68, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < 4; s++) {
        ctx.rotate(Math.PI / 2);
        const streakGrad = ctx.createLinearGradient(0, 0, radius * 0.68, 0);
        streakGrad.addColorStop(0, `rgba(255, 255, 255, ${blurAlpha * 0.85})`);
        streakGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = streakGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius * 0.68, -0.22, 0.22);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore(); // end rotation

    // 5. Stationary Liquid Glass Acrylic Dome Highlight across the emblem
    const glassDome = ctx.createRadialGradient(-radius * 0.35, centerY - radius * 0.35, 2, 0, centerY, radius);
    glassDome.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    glassDome.addColorStop(0.3, 'rgba(255, 255, 255, 0.12)');
    glassDome.addColorStop(0.65, 'rgba(255, 255, 255, 0.0)');
    glassDome.addColorStop(0.85, 'rgba(0, 0, 0, 0.15)');
    glassDome.addColorStop(1, 'rgba(0, 0, 0, 0.35)');

    ctx.beginPath();
    ctx.arc(0, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = glassDome;
    ctx.fill();

    // Specular highlight crescent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(-radius * 0.28, centerY - radius * 0.32, radius * 0.38, radius * 0.16, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderMuruganVel(ctx) {
    const img = this.images['murugan vel.png'] || this.images['murugan-vel.png'];

    ctx.save();

    // 1. Top Sacred Gold Attachment Ring connecting to cord at (0, 0)
    const ringGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, 5);
    ringGrad.addColorStop(0, '#fef08a');
    ringGrad.addColorStop(0.5, '#eab308');
    ringGrad.addColorStop(1, '#854d0e');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Divine Radiance Aura when ritual activated
    if (this.veluAuraRadius > 0) {
      // Radiating warm golden & vermilion aura
      const auraGrad = ctx.createRadialGradient(0, 45, 10, 0, 45, this.veluAuraRadius);
      auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
      auraGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.25)');
      auraGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 45, this.veluAuraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Concentric sacred energy ring
      ctx.strokeStyle = `rgba(254, 240, 138, ${Math.min(1, this.veluAuraRadius / 80)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 45, this.veluAuraRadius * 0.65, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. Sacred Golden Vel Image
    if (img) {
      const targetHeight = 115;
      const aspect = (img.naturalWidth && img.naturalHeight) ? (img.naturalWidth / img.naturalHeight) : 0.6;
      const targetWidth = Math.min(85, Math.max(50, targetHeight * aspect));

      if (this.veluGlow > 0) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 24 * this.veluGlow;
      }

      ctx.drawImage(img, -targetWidth / 2, 2, targetWidth, targetHeight);
    } else {
      // Procedural fallback Vel if image is pending
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.bezierCurveTo(-22, 25, -28, 55, -12, 75);
      ctx.lineTo(-4, 75);
      ctx.lineTo(-4, 115);
      ctx.lineTo(4, 115);
      ctx.lineTo(4, 75);
      ctx.lineTo(12, 75);
      ctx.bezierCurveTo(28, 55, 22, 25, 0, 2);
      ctx.fill();
    }

    // 4. Subtle divine tip gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 12, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderCustomEmoji(ctx) {
    ctx.font = '54px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.customEmoji, 0, 25);
  }
}
