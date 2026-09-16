const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Enable GPU Hardware Acceleration for ultra-smooth 60+ FPS performance
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let overlayWindow = null;
let galleryWindow = null;
let trayWindow = null;
let tray = null;
let overlayEnabled = true;
let soundMuted = false;
let activeCharmId = 'bmw';

const RITUAL_LABELS = {
  'bmw': '🏎️ Rev the engine (Ctrl+Shift+S)',
  'murugan-vel': '✨ Vetri Vel! (Ctrl+Shift+S)',
  'nimbu-mirchi': '🌶️ Hang fresh garland (Ctrl+Shift+S)',
  'maneki-neko': '🐱 Beckon good fortune (Ctrl+Shift+S)',
  'daruma': '✨ Make a wish (Ctrl+Shift+S)',
  'drishti-bommai': '👹 Repaint guardian (Ctrl+Shift+S)',
  'chinese-knot': '🏮 Tie in good fortune (Ctrl+Shift+S)',
  'himmeli': '🌾 Set it turning (Ctrl+Shift+S)',
  'hamsa': '✋ Receive blessing (Ctrl+Shift+S)',
  'nazar': '🧿 Ward off evil eye (Ctrl+Shift+S)',
  'ghanta': '🔔 Ring temple bell (Ctrl+Shift+S)',
  'custom': '🍀 Bless custom charm (Ctrl+Shift+S)'
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      if (!overlayEnabled) toggleOverlay();
      sendToOverlay('trigger-ritual');
    }
  });
}

// Register custom protocol handler: luckydangle://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('luckydangle', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('luckydangle');
}

function createTray() {
  try {
    const candidateIcons = [
      path.join(app.getAppPath(), 'public/charms/nazar.png'),
      path.join(app.getAppPath(), 'dist/charms/nazar.png'),
      path.join(app.getAppPath(), 'charms/nazar.png'),
      path.join(__dirname, '../public/charms/nazar.png'),
      path.join(__dirname, '../dist/charms/nazar.png'),
      path.join(__dirname, '../charms/nazar.png')
    ];
    const iconPath = candidateIcons.find(p => fs.existsSync(p)) || candidateIcons[0];
    let icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="#1d4ed8"/></svg>';
      icon = nativeImage.createFromDataURL('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));
    } else {
      icon = icon.resize({ width: 16, height: 16, quality: 'high' });
    }

    if (tray && !tray.isDestroyed()) {
      try { tray.destroy(); } catch (e) {}
    }

    tray = new Tray(icon);
    tray.setToolTip('Lucky Dangle - All-in-One Controller');

    // Left-click on taskbar button toggles All-in-One controller flyout
    tray.on('click', () => {
      toggleTrayWindow();
    });

    // Right-click on taskbar button opens context menu
    tray.on('right-click', () => {
      updateTrayMenu();
      tray.popUpContextMenu();
    });

    // Double-click toggles charm visibility
    tray.on('double-click', () => {
      toggleOverlay();
    });

    updateTrayMenu();
    createTrayWindow();
  } catch (err) {
    console.warn('Tray creation warning, retrying in 2 seconds:', err);
    setTimeout(() => {
      if (!tray || tray.isDestroyed()) createTray();
    }, 2000);
  }
}

function updateTrayMenu() {
  const ritualLabel = RITUAL_LABELS[activeCharmId] || '✨ Perform Ritual (Ctrl+Shift+S)';

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🎛️ All-in-One Controller (Click tray icon)',
      click: () => toggleTrayWindow()
    },
    { type: 'separator' },
    {
      label: ritualLabel,
      click: () => sendToOverlay('trigger-ritual')
    },
    {
      label: '📍 Re-center Charm (Ctrl+Shift+R)',
      click: () => sendToOverlay('recenter-charm')
    },
    {
      label: soundMuted ? '🔇 Sound: OFF (Click to turn ON)' : '🔊 Sound: ON (Click to turn OFF)',
      click: () => sendToOverlay('toggle-sound')
    },
    {
      label: overlayEnabled ? '👁️ Hide Screen Charm (Ctrl+D)' : '👁️ Show Screen Charm (Ctrl+D)',
      type: 'checkbox',
      checked: overlayEnabled,
      click: () => toggleOverlay()
    },
    { type: 'separator' },
    {
      label: '🎯 Choose Screen Charm',
      submenu: [
        { label: '🏎️ BMW Symbol Spinner', type: 'radio', checked: activeCharmId === 'bmw', click: () => selectCharm('bmw') },
        { label: '🔱 Murugan Vel (Sacred Spear)', type: 'radio', checked: activeCharmId === 'murugan-vel', click: () => selectCharm('murugan-vel') },
        { label: '🌶️ Nimbu-mirchi', type: 'radio', checked: activeCharmId === 'nimbu-mirchi', click: () => selectCharm('nimbu-mirchi') },
        { label: '🐱 Maneki-neko (Beckoning Cat)', type: 'radio', checked: activeCharmId === 'maneki-neko', click: () => selectCharm('maneki-neko') },
        { label: '🎯 Daruma (Wishing Doll)', type: 'radio', checked: activeCharmId === 'daruma', click: () => selectCharm('daruma') },
        { label: '👹 Drishti bommai', type: 'radio', checked: activeCharmId === 'drishti-bommai', click: () => selectCharm('drishti-bommai') },
        { label: '🏮 Páncháng jié (Chinese Knot)', type: 'radio', checked: activeCharmId === 'chinese-knot', click: () => selectCharm('chinese-knot') },
        { label: '🌾 Himmeli (Geometric Mobile)', type: 'radio', checked: activeCharmId === 'himmeli', click: () => selectCharm('himmeli') },
        { label: '✋ Hamsa', type: 'radio', checked: activeCharmId === 'hamsa', click: () => selectCharm('hamsa') },
        { label: '🧿 Nazar boncuğu', type: 'radio', checked: activeCharmId === 'nazar', click: () => selectCharm('nazar') },
        { label: '🔔 Ghanta (Bell)', type: 'radio', checked: activeCharmId === 'ghanta', click: () => selectCharm('ghanta') },
        { label: '🍀 Custom Emoji', type: 'radio', checked: activeCharmId === 'custom', click: () => selectCharm('custom') }
      ]
    },
    { type: 'separator' },
    {
      label: '📖 Open Charm Gallery...',
      click: () => openGalleryWindow()
    },
    { type: 'separator' },
    {
      label: '❌ Exit Lucky Dangle',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function createTrayWindow() {
  if (trayWindow && !trayWindow.isDestroyed()) return;

  trayWindow = new BrowserWindow({
    width: 356,
    height: 490,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const trayDistPath = path.join(__dirname, '../dist/tray.html');
  if (fs.existsSync(trayDistPath)) {
    trayWindow.loadFile(trayDistPath);
  } else {
    trayWindow.loadFile(path.join(__dirname, '../tray.html'));
  }

  // Dismiss flyout when clicking outside
  trayWindow.on('blur', () => {
    if (trayWindow && !trayWindow.isDestroyed() && trayWindow.isVisible()) {
      trayWindow.hide();
    }
  });
}

function positionTrayWindow() {
  if (!tray || !trayWindow || trayWindow.isDestroyed()) return;

  const windowBounds = trayWindow.getBounds();
  const trayBounds = tray.getBounds();

  // Find the display where the tray icon is located, or nearest to cursor
  let targetDisplay = null;
  if (trayBounds && trayBounds.width > 0 && trayBounds.height > 0) {
    targetDisplay = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y });
  } else {
    const cursor = screen.getCursorScreenPoint();
    targetDisplay = screen.getDisplayNearestPoint(cursor);
  }

  if (!targetDisplay) {
    targetDisplay = screen.getPrimaryDisplay();
  }

  const { width: screenWidth, height: screenHeight, x: screenX, y: screenY } = targetDisplay.workArea;
  const displayBounds = targetDisplay.bounds;

  // Determine taskbar position (Bottom, Top, Left, Right)
  const isTaskbarTop = targetDisplay.workArea.y > displayBounds.y;
  const isTaskbarLeft = targetDisplay.workArea.x > displayBounds.x;
  const isTaskbarRight = (displayBounds.x + displayBounds.width) > (targetDisplay.workArea.x + targetDisplay.workArea.width);

  let x, y;

  if (isTaskbarLeft) {
    x = targetDisplay.workArea.x + 8;
    y = trayBounds && trayBounds.y > 0 ? Math.round(trayBounds.y - (windowBounds.height / 2)) : screenY + screenHeight - windowBounds.height - 16;
  } else if (isTaskbarRight) {
    x = targetDisplay.workArea.x + targetDisplay.workArea.width - windowBounds.width - 8;
    y = trayBounds && trayBounds.y > 0 ? Math.round(trayBounds.y - (windowBounds.height / 2)) : screenY + screenHeight - windowBounds.height - 16;
  } else if (isTaskbarTop) {
    x = trayBounds && trayBounds.x > 0 ? Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2)) : screenX + screenWidth - windowBounds.width - 16;
    y = targetDisplay.workArea.y + 8;
  } else {
    // Bottom taskbar (Standard Windows 10 & 11)
    if (trayBounds && trayBounds.width > 0 && trayBounds.y > 0) {
      x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
      y = Math.round(trayBounds.y - windowBounds.height - 8);
    } else {
      x = screenX + screenWidth - windowBounds.width - 16;
      y = screenY + screenHeight - windowBounds.height - 16;
    }
  }

  // Ensure window is strictly clamped inside the target monitor's workArea
  x = Math.max(screenX + 8, Math.min(x, screenX + screenWidth - windowBounds.width - 8));
  y = Math.max(screenY + 8, Math.min(y, screenY + screenHeight - windowBounds.height - 8));

  trayWindow.setPosition(x, y, false);
}

function toggleTrayWindow() {
  if (!trayWindow || trayWindow.isDestroyed()) {
    createTrayWindow();
  }

  if (trayWindow.isVisible()) {
    trayWindow.hide();
  } else {
    positionTrayWindow();
    trayWindow.show();
    trayWindow.focus();
    sendStateToTrayWindow();
  }
}

function sendStateToTrayWindow() {
  if (trayWindow && !trayWindow.isDestroyed() && trayWindow.webContents) {
    trayWindow.webContents.send('state-sync', {
      activeCharmId,
      soundMuted,
      overlayEnabled
    });
  }
}

function sendToOverlay(channel, data) {
  if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.webContents) {
    overlayWindow.webContents.send(channel, data);
  }
}

function selectCharm(charmId) {
  activeCharmId = charmId;
  sendToOverlay('switch-charm', charmId);
  sendStateToTrayWindow();
  updateTrayMenu();
}

function toggleOverlay() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  overlayEnabled = !overlayEnabled;

  if (overlayEnabled) {
    overlayWindow.setOpacity(1);
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    sendToOverlay('toggle-visibility', true);
  } else {
    overlayWindow.setOpacity(0);
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    sendToOverlay('toggle-visibility', false);
  }

  sendStateToTrayWindow();
  updateTrayMenu();
}

function createOverlayWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height, x, y } = primaryDisplay.bounds;

  overlayWindow = new BrowserWindow({
    width: width,
    height: Math.min(height, 740),
    x: x,
    y: y,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  });

  try {
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch (err) {}

  // Enable click-through by default so windows underneath are clicked normally
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  const overlayDistPath = path.join(__dirname, '../dist/overlay.html');
  const overlayLocalPath = path.join(__dirname, '../overlay.html');
  if (fs.existsSync(overlayDistPath)) {
    overlayWindow.loadFile(overlayDistPath);
  } else if (fs.existsSync(overlayLocalPath)) {
    overlayWindow.loadFile(overlayLocalPath);
  } else {
    overlayWindow.loadURL('http://localhost:5173/overlay.html');
  }

  // Handle pointer forward/catch from overlay canvas
  ipcMain.on('set-ignore-mouse-events', (event, ignore) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      if (ignore) {
        overlayWindow.setIgnoreMouseEvents(true, { forward: true });
      } else {
        overlayWindow.setIgnoreMouseEvents(false);
      }
    }
  });

  ipcMain.on('switch-charm', (event, charmId) => {
    selectCharm(charmId);
  });

  ipcMain.on('charm-changed', (event, charmId) => {
    activeCharmId = charmId;
    sendStateToTrayWindow();
    updateTrayMenu();
  });

  ipcMain.on('trigger-ritual', () => {
    sendToOverlay('trigger-ritual');
  });

  ipcMain.on('toggle-overlay-shortcut', () => {
    toggleOverlay();
  });

  ipcMain.on('toggle-sound', () => {
    sendToOverlay('toggle-sound');
  });

  ipcMain.on('recenter-charm', () => {
    sendToOverlay('recenter-charm');
  });

  ipcMain.on('sound-state-changed', (event, muted) => {
    soundMuted = muted;
    sendStateToTrayWindow();
    updateTrayMenu();
  });

  ipcMain.on('request-state', (event) => {
    event.sender.send('state-sync', {
      activeCharmId,
      soundMuted,
      overlayEnabled
    });
  });

  ipcMain.on('open-gallery', () => {
    openGalleryWindow();
  });

  ipcMain.on('close-tray-window', () => {
    if (trayWindow && !trayWindow.isDestroyed()) {
      trayWindow.hide();
    }
  });

  ipcMain.on('quit-app', () => {
    app.quit();
  });

  ipcMain.on('overlay-ready', (event, data) => {
    if (data) {
      if (data.charmId) activeCharmId = data.charmId;
      if (data.soundMuted !== undefined) soundMuted = data.soundMuted;
    }
    sendStateToTrayWindow();
    updateTrayMenu();
  });

  // Register Global Shortcuts (support both Ctrl+Shift+D and Ctrl+D)
  try {
    globalShortcut.register('CommandOrControl+Shift+D', () => {
      toggleOverlay();
    });
    globalShortcut.register('CommandOrControl+D', () => {
      toggleOverlay();
    });
    globalShortcut.register('CommandOrControl+Shift+S', () => {
      sendToOverlay('trigger-ritual');
    });
    globalShortcut.register('CommandOrControl+Shift+R', () => {
      sendToOverlay('recenter-charm');
    });
    globalShortcut.register('CommandOrControl+Shift+M', () => {
      sendToOverlay('toggle-sound');
    });
  } catch (err) {
    console.warn('Global shortcut registration error:', err);
  }
}

function openGalleryWindow() {
  if (galleryWindow && !galleryWindow.isDestroyed()) {
    galleryWindow.show();
    galleryWindow.focus();
    return;
  }

  galleryWindow = new BrowserWindow({
    width: 1040,
    height: 760,
    title: 'Lucky Dangle - Charm Gallery',
    backgroundColor: '#0f1322',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  const localPath = path.join(__dirname, '../index.html');
  if (fs.existsSync(distPath)) {
    galleryWindow.loadFile(distPath);
  } else if (fs.existsSync(localPath)) {
    galleryWindow.loadFile(localPath);
  } else {
    galleryWindow.loadURL('http://localhost:5173');
  }

  galleryWindow.on('closed', () => {
    galleryWindow = null;
  });
}

function updateOverlayBounds() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height, x, y } = primaryDisplay.bounds;
  overlayWindow.setBounds({
    x: x,
    y: y,
    width: width,
    height: Math.min(height, 740)
  });
  sendToOverlay('display-changed', { width, height });
}

app.whenReady().then(() => {
  createOverlayWindow();
  createTray();

  // Multi-monitor & DPI scaling dynamic event handlers
  screen.on('display-metrics-changed', updateOverlayBounds);
  screen.on('display-added', updateOverlayBounds);
  screen.on('display-removed', updateOverlayBounds);

  app.on('activate', () => {
    if (!overlayWindow) createOverlayWindow();
  });
});

app.on('child-process-gone', (event, details) => {
  if (details.type === 'GPU' && details.reason !== 'clean-exit') {
    console.warn('GPU process crash detected on Windows, maintaining state:', details);
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
