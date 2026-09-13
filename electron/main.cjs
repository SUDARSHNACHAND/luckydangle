const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Enable GPU Hardware Acceleration for ultra-smooth 60+ FPS performance
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

let overlayWindow = null;
let galleryWindow = null;
let tray = null;
let overlayEnabled = true;
let soundMuted = false;

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
  const candidateIcons = [
    path.join(__dirname, '../public/charms/nazar.png'),
    path.join(__dirname, '../dist/charms/nazar.png'),
    path.join(__dirname, '../charms/nazar.png')
  ];
  const iconPath = candidateIcons.find(p => fs.existsSync(p)) || candidateIcons[0];
  let icon = nativeImage.createFromPath(iconPath);
  if (!icon.isEmpty()) {
    icon = icon.resize({ width: 16, height: 16 });
  }
  tray = new Tray(icon);
  tray.setToolTip('Lucky Dangle - Windows Screen Charm');

  updateTrayMenu();
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Lucky Dangle v1.0',
      enabled: false
    },
    { type: 'separator' },
    {
      label: overlayEnabled ? '👁️ Disable Screen Charm (Ctrl+Shift+D)' : '👁️ Enable Screen Charm (Ctrl+Shift+D)',
      type: 'checkbox',
      checked: overlayEnabled,
      click: () => toggleOverlay()
    },
    {
      label: '✨ Perform Charm Ritual (Ctrl+Shift+S)',
      click: () => sendToOverlay('trigger-ritual')
    },
    {
      label: '📍 Re-center Charm (Ctrl+Shift+R)',
      click: () => sendToOverlay('recenter-charm')
    },
    {
      label: soundMuted ? '🔇 Sound: OFF (Click to Turn ON)' : '🔊 Sound: ON (Click to Turn OFF)',
      click: () => sendToOverlay('toggle-sound')
    },
    {
      label: '📖 Open Charm Gallery...',
      click: () => openGalleryWindow()
    },
    { type: 'separator' },
    {
      label: '🎯 Choose Screen Charm',
      submenu: [
        { label: '🏎️ BMW Symbol Spinner', click: () => selectCharm('bmw') },
        { label: '🌶️ Nimbu-mirchi', click: () => selectCharm('nimbu-mirchi') },
        { label: '🐱 Maneki-neko (Beckoning Cat)', click: () => selectCharm('maneki-neko') },
        { label: '🎯 Daruma (Wishing Doll)', click: () => selectCharm('daruma') },
        { label: '👹 Drishti bommai', click: () => selectCharm('drishti-bommai') },
        { label: '🏮 Páncháng jié (Chinese Knot)', click: () => selectCharm('chinese-knot') },
        { label: '🌾 Himmeli (Geometric Mobile)', click: () => selectCharm('himmeli') },
        { label: '✋ Hamsa', click: () => selectCharm('hamsa') },
        { label: '🧿 Nazar boncuğu', click: () => selectCharm('nazar') },
        { label: '🔔 Ghanta (Bell)', click: () => selectCharm('ghanta') },
        { label: '🍀 Custom Emoji', click: () => selectCharm('custom') }
      ]
    },
    { type: 'separator' },
    {
      label: '❌ Exit Lucky Dangle',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function sendToOverlay(channel, data) {
  if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.webContents) {
    overlayWindow.webContents.send(channel, data);
  }
}

function selectCharm(charmId) {
  sendToOverlay('switch-charm', charmId);
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

  // Enable click-through by default so windows underneath are clicked normally
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });

  const overlayDistPath = path.join(__dirname, '../dist/overlay.html');
  if (fs.existsSync(overlayDistPath)) {
    overlayWindow.loadFile(overlayDistPath);
  } else {
    overlayWindow.loadURL('http://localhost:3000/overlay.html');
  }

  // Handle pointer forward/catch from overlay canvas
  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setIgnoreMouseEvents(ignore, options);
    }
  });

  ipcMain.on('switch-charm', (event, charmId) => {
    sendToOverlay('switch-charm', charmId);
  });

  ipcMain.on('trigger-ritual', () => {
    sendToOverlay('trigger-ritual');
  });

  ipcMain.on('toggle-overlay-shortcut', () => {
    toggleOverlay();
  });

  ipcMain.on('sound-state-changed', (event, muted) => {
    soundMuted = muted;
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
  if (fs.existsSync(distPath)) {
    galleryWindow.loadFile(distPath);
  } else {
    galleryWindow.loadURL('http://localhost:3000');
  }

  galleryWindow.on('closed', () => {
    galleryWindow = null;
  });
}

app.whenReady().then(() => {
  createOverlayWindow();
  createTray();

  app.on('activate', () => {
    if (!overlayWindow) createOverlayWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});
