// Taskbar All-in-One Controller Logic

const CHARM_NAMES = {
  'bmw': 'BMW Spinner',
  'murugan-vel': 'Murugan Vel',
  'nimbu-mirchi': 'Nimbu-mirchi',
  'maneki-neko': 'Maneki-neko',
  'daruma': 'Daruma',
  'drishti-bommai': 'Drishti bommai',
  'chinese-knot': 'Chinese Knot',
  'himmeli': 'Himmeli',
  'hamsa': 'Hamsa',
  'nazar': 'Nazar boncuğu',
  'ghanta': 'Ghanta (Bell)',
  'custom': 'Custom Emoji'
};

const RITUAL_LABELS = {
  'bmw': '🏎️ Rev the engine',
  'murugan-vel': '✨ Vetri Vel! (Harohara)',
  'nimbu-mirchi': '🌶️ Hang fresh garland',
  'maneki-neko': '🐱 Beckon good fortune',
  'daruma': '✨ Make a wish',
  'drishti-bommai': '👹 Repaint guardian',
  'chinese-knot': '🏮 Tie in good fortune',
  'himmeli': '🌾 Set it turning',
  'hamsa': '✋ Receive blessing',
  'nazar': '🧿 Ward off evil eye',
  'ghanta': '🔔 Ring temple bell',
  'custom': '🍀 Bless custom charm'
};

let currentCharm = 'bmw';
let isSoundMuted = false;
let isOverlayVisible = true;
let ipcRenderer = null;

if (window.require) {
  try {
    const electron = window.require('electron');
    ipcRenderer = electron.ipcRenderer;
  } catch (e) {
    console.warn('Electron IPC not available:', e);
  }
}

function updateUI() {
  // Update active charm highlight
  document.querySelectorAll('.aio-charm-btn').forEach((btn) => {
    const cid = btn.getAttribute('data-charm');
    if (cid === currentCharm) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update header active charm tag
  const tagEl = document.getElementById('aio-active-tag');
  if (tagEl) {
    tagEl.textContent = CHARM_NAMES[currentCharm] || currentCharm;
  }

  // Update ritual button text
  const ritualEl = document.getElementById('aio-ritual-label');
  if (ritualEl) {
    ritualEl.textContent = RITUAL_LABELS[currentCharm] || '✨ Perform Ritual';
  }

  // Update sound button
  const soundBtn = document.getElementById('aio-sound-btn');
  const soundIcon = document.getElementById('aio-sound-icon');
  const soundText = document.getElementById('aio-sound-text');
  if (soundBtn && soundIcon && soundText) {
    if (isSoundMuted) {
      soundBtn.classList.add('muted');
      soundIcon.textContent = '🔇';
      soundText.textContent = 'Sound OFF';
      soundBtn.title = 'Sound is OFF (Click to turn ON)';
    } else {
      soundBtn.classList.remove('muted');
      soundIcon.textContent = '🔊';
      soundText.textContent = 'Sound ON';
      soundBtn.title = 'Sound is ON (Click to turn OFF)';
    }
  }

  // Update hide button
  const hideIcon = document.getElementById('aio-hide-icon');
  const hideText = document.getElementById('aio-hide-text');
  const hideBtn = document.getElementById('aio-hide-btn');
  if (hideIcon && hideText && hideBtn) {
    if (isOverlayVisible) {
      hideIcon.textContent = '👁️';
      hideText.textContent = 'Hide';
      hideBtn.title = 'Hide Screen Charm (Ctrl+D)';
    } else {
      hideIcon.textContent = '👁️‍🗨️';
      hideText.textContent = 'Show';
      hideBtn.title = 'Show Screen Charm (Ctrl+D)';
    }
  }
}

function init() {
  // Try reading local storage
  try {
    const savedCharm = localStorage.getItem('ld-active-charm');
    if (savedCharm) currentCharm = savedCharm;
    const savedMuted = localStorage.getItem('ld-sound-muted');
    if (savedMuted !== null) isSoundMuted = savedMuted === 'true';
  } catch (e) {}

  updateUI();

  // Setup IPC listeners
  if (ipcRenderer) {
    ipcRenderer.on('state-sync', (event, state) => {
      if (state.activeCharmId) currentCharm = state.activeCharmId;
      if (state.soundMuted !== undefined) isSoundMuted = state.soundMuted;
      if (state.overlayEnabled !== undefined) isOverlayVisible = state.overlayEnabled;
      updateUI();
    });

    ipcRenderer.send('request-state');
  }

  // Charm selection buttons
  document.querySelectorAll('.aio-charm-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const charmId = btn.getAttribute('data-charm');
      if (charmId === 'custom' && currentCharm === 'custom') {
        const picked = window.prompt('Enter your custom lucky emoji:', '🍀');
        if (picked && picked.trim()) {
          try {
            localStorage.setItem('ld-custom-emoji', picked.trim());
          } catch (err) {}
        }
      }
      currentCharm = charmId;
      updateUI();
      if (ipcRenderer) {
        ipcRenderer.send('switch-charm', charmId);
      }
    });
  });

  // Ritual button
  document.getElementById('aio-ritual-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ipcRenderer) {
      ipcRenderer.send('trigger-ritual');
    }
  });

  // Sound toggle button
  document.getElementById('aio-sound-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    isSoundMuted = !isSoundMuted;
    updateUI();
    if (ipcRenderer) {
      ipcRenderer.send('toggle-sound');
    }
  });

  // Re-center button
  document.getElementById('aio-recenter-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ipcRenderer) {
      ipcRenderer.send('recenter-charm');
    }
  });

  // Gallery button
  document.getElementById('aio-gallery-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ipcRenderer) {
      ipcRenderer.send('open-gallery');
      ipcRenderer.send('close-tray-window');
    }
  });

  // Hide / Show button
  document.getElementById('aio-hide-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    isOverlayVisible = !isOverlayVisible;
    updateUI();
    if (ipcRenderer) {
      ipcRenderer.send('toggle-overlay-shortcut');
    }
  });

  // Exit button
  document.getElementById('aio-exit-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ipcRenderer) {
      ipcRenderer.send('quit-app');
    }
  });

  // Close button (X)
  document.getElementById('aio-close-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (ipcRenderer) {
      ipcRenderer.send('close-tray-window');
    }
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (ipcRenderer) {
        ipcRenderer.send('close-tray-window');
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
