# Lucky Dangle 🧿✨ (v2.0)

> **Interactive Cultural Screen Charms & Spinners for Windows PC**  
> Hang traditional lucky charms, spinners, and talismans from the top of your display with authentic spring-mass physics, procedural Web Audio rituals, and a sleek **All-in-One Taskbar Controller** that keeps your screen 100% clean and unobstructed.

[![Version](https://img.shields.io/badge/Version-2.0.0-blueviolet?style=for-the-badge)](https://github.com/SUDARSHNACHAND/luckydangle)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/SUDARSHNACHAND/luckydangle)
[![Runtime](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Electron-33-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![UI Style](https://img.shields.io/badge/UI-Liquid%20Glass%20%26%20Tray%20Flyout-8ba3f8?style=for-the-badge)](https://github.com/SUDARSHNACHAND/luckydangle)

---

## 📑 Table of Contents

- [🌟 What's New in Version 2.0](#-whats-new-in-version-20)
- [💻 Full Windows Environment Compatibility](#-full-windows-environment-compatibility)
- [🖥️ System Requirements](#️-system-requirements)
- [🚀 How to Start on Windows (Step-by-Step)](#-how-to-start-on-windows-step-by-step)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Clone Repository](#2-clone-repository)
  - [3. Install Dependencies](#3-install-dependencies)
  - [4. Build Assets](#4-build-assets)
  - [5. Launch Options](#5-launch-options)
  - [6. Optional: Start Automatically with Windows](#6-optional-start-automatically-with-windows)
- [🎛️ All-in-One Taskbar Controller](#️-all-in-one-taskbar-controller)
- [🧿 Complete Charms & Rituals Roster (12 Charms)](#-complete-charms--rituals-roster-12-charms)
- [⌨️ Global Keyboard Shortcuts & Mouse Controls](#️-global-keyboard-shortcuts--mouse-controls)
- [🛠️ Project Structure](#️-project-structure)
- [🔧 Troubleshooting & Common Windows Questions](#-troubleshooting--common-windows-questions)
- [📜 License](#-license)

---

## 🌟 What's New in Version 2.0

* 🎛️ **All-in-One Taskbar Controller**:
  - The old floating on-screen controller bar has been **completely eliminated**.
  - All charm selection, dynamic rituals, sound toggles, and settings are housed inside a gorgeous **liquid-glass flyout** anchored directly to your Windows System Tray (Taskbar Notification Area).
  - Your desktop stays completely clean, immersive, and 100% click-through outside the charm itself.

* 🔱 **Murugan Vel Charm (Sacred Spear)**:
  - Added the divine lance of Lord Murugan representing wisdom, courage, and triumph over obstacles.
  - Features the authentic multi-layered **Velu Sound** synthesizer: sacred Shankha (conch shell) drone sweeping upward, resonant 5-part brass temple bells (*Ghanta & Manjira*), and a high-frequency golden spear gleam.
  - Interactive ritual radiates concentric golden & vermilion energy rings with sacred vibhuti and kumkum particle bursts.

* 🏎️ **BMW Symbol Spinner**:
  - The iconic Bavarian roundel & propeller spinner with authentic drag/flick rotation physics, inertia, high-RPM motion blur arcs, M-Power cord beads (Cyan, Blue, Red), and engine acceleration rev audio.

* 📐 **Symmetrical 12-Charm Layout**:
  - Exactly 12 authentic, high-definition charms arranged in a symmetrical 2-row × 6-column quick-select grid.

* ⚡ **Ultra-Smooth 60+ FPS Engine**:
  - GPU hardware-accelerated canvas rendering with crash-resilient process recovery.

---

## 💻 Full Windows Environment Compatibility

Lucky Dangle is engineered for seamless operation across **all modern Windows desktop configurations**:

1. **Multi-Monitor & Multi-Display Setups**:
   - Automatically detects which monitor your mouse or taskbar is on.
   - The All-in-One Controller flyout docks accurately to the taskbar on **any display** (Primary, Secondary, or Tertiary).
   - Dynamic monitor listener (`screen.on('display-metrics-changed')`) auto-resizes the overlay when docking/undocking laptops, plugging in external monitors, or switching resolutions.

2. **Any Taskbar Position Supported**:
   - **Bottom Taskbar**: Default in Windows 10 and Windows 11 (both centered and left-aligned).
   - **Top Taskbar**: Flyout gracefully anchors below the taskbar.
   - **Left / Right Taskbars**: Flyout anchors horizontally aligned with the tray icon.
   - **Auto-Hide Taskbars**: Flyout clamps inside the visible work area without overflowing.

3. **High-DPI & Custom Display Scaling**:
   - Fully optimized for **100%, 125%, 150%, 175%, 200%, and 4K UHD** scaling.
   - Zero-blur canvas rendering with crisp SVG vector and high-resolution PNG assets.

4. **Self-Healing Windows Launchers**:
   - `start-luckydangle.bat` and `run-silent.vbs` auto-detect Node.js, auto-install dependencies (`npm install`), and auto-compile assets (`npm run build`) on first launch.
   - Handles Windows paths with spaces (e.g. `C:\Users\John Doe\`) and any drive letter (`C:`, `D:`, `E:`).

5. **Instant Audio for Global Hotkeys**:
   - Configured with `autoplay-policy=no-user-gesture-required` so pressing <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> plays audio immediately, even while playing full-screen games or browsing in another app.

6. **Direct-to-Desktop Click-Through**:
   - Outside the charm cord, your mouse clicks pass through completely to underlying windows, browser tabs, or desktop icons. Hovering over the charm automatically captures cursor control.

---

## 🖥️ System Requirements

* **Operating System**: Windows 10 or Windows 11 (64-bit) — *Built and tailored for Windows Desktop*.
* **Runtime**: [Node.js](https://nodejs.org/) v18.0.0 or higher (LTS recommended).
* **Display**: Standard or High-DPI displays (4K, UltraWide, Multi-Monitor setups fully supported).
* **Audio**: Any standard stereo audio device (uses Web Audio API procedural synthesis with zero external audio files).

---

## 🚀 How to Start on Windows (Step-by-Step)

Follow these simple steps to download, install, and run Lucky Dangle on your Windows PC:

### 1. Prerequisites
Ensure you have **Node.js** and **Git** installed on Windows:
* Download Node.js: [https://nodejs.org/](https://nodejs.org/) (Choose LTS).
* Download Git: [https://git-scm.com/download/win](https://git-scm.com/download/win).

Verify installation by opening **PowerShell** or **Command Prompt** and running:
```powershell
node -v
npm -v
git --version
```

### 2. Clone Repository
Open PowerShell or Windows Terminal in your desired folder:
```powershell
git clone https://github.com/SUDARSHNACHAND/luckydangle.git
cd luckydangle
```

### 3. Install Dependencies
Install all required Node.js and Electron packages:
```powershell
npm install
```

### 4. Build Assets
Compile the Vite web bundle and production distribution assets:
```powershell
npm run build
```

### 5. Launch Options
You can start Lucky Dangle using whichever method fits your workflow:

#### Option A: Silent Background Launch (Recommended for Daily Use) 🔕
Double-click [`run-silent.vbs`](run-silent.vbs) from File Explorer.  
* Lucky Dangle will start silently in the background.
* No black terminal or command prompt window stays open!
* The charm cord dangles from the top center of your screen, and the Lucky Dangle icon docks into your Windows Taskbar System Tray.

#### Option B: One-Click Windows Batch Launcher 🚀
Double-click [`start-luckydangle.bat`](start-luckydangle.bat) from File Explorer.  
* Automatically verifies dependencies, builds if necessary, and starts Electron detached.

#### Option C: Terminal / Developer Mode 💻
Run directly from your terminal:
```powershell
npm start
```

---

### 6. Optional: Start Automatically with Windows

To have Lucky Dangle automatically launch every time you log into Windows:
1. Press <kbd>Win</kbd> + <kbd>R</kbd> on your keyboard to open the **Run** dialog.
2. Type `shell:startup` and click **OK**. (This opens your Windows Startup folder: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`).
3. Right-click inside the folder, select **New** > **Shortcut**.
4. Click **Browse...** and navigate to your `luckydangle` folder.
5. Select [`run-silent.vbs`](run-silent.vbs) and click **Finish**.
6. That's it! Lucky Dangle will now start silently upon Windows boot.

---

## 🎛️ All-in-One Taskbar Controller

Lucky Dangle 2.0 introduces a **zero-clutter desktop philosophy**. There are no on-screen floating buttons obstructing your work or games. Everything is accessible via the **Taskbar System Tray Icon**:

```
      ┌─────────────────────────────────────────────────────────┐
      │  🧿 Lucky Dangle         [ BMW Spinner ]           ✕   │
      ├─────────────────────────────────────────────────────────┤
      │  SELECT CHARM                                           │
      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
      │  │🏎️  │ │🔱  │ │🌶️  │ │🐱  │ │🎯  │ │👹  │  (Row 1)    │
      │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘              │
      │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
      │  │🏮  │ │🌾  │ │✋  │ │🧿  │ │🔔  │ │🍀  │  (Row 2)    │
      │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘              │
      ├─────────────────────────────────────────────────────────┤
      │  ⚡ Rev the engine           │  🔊 Sound ON             │
      ├─────────────────────────────────────────────────────────┤
      │  🖼️ Charms Gallery    👁️ Hide Screen Charm    ✕ Exit    │
      └─────────────────────────────────────────────────────────┘
```

### How to use:
* **Open the Controller**: **Left-click** the Lucky Dangle tray icon in the bottom-right notification area of your Windows taskbar.
* **Switch Charms**: Click any of the 12 charm buttons in the grid. The screen charm changes instantly.
* **Trigger Ritual**: Click the highlighted primary action button (e.g., `⚡ Rev the engine`, `✨ Vetri Vel! (Harohara)`).
* **Toggle Sound**: Click `🔊 Sound ON` / `🔇 Sound Muted` to mute or unmute procedural audio synthesis.
* **Native Context Menu**: **Right-click** the tray icon for quick shortcuts, radio charm selection, and exit.

---

## 🧿 Complete Charms & Rituals Roster (12 Charms)

Every charm features authentic cultural significance, unique cord beads, custom procedural Web Audio synthesis, and dynamic particle effects:

| # | Charm Name | Icon | Cultural Origin | Meaning & Significance | Interactive Ritual & Sound Effect |
|:---:|:---|:---:|:---|:---|:---|
| 1 | **BMW Symbol Spinner** | 🏎️ | Bavaria, Germany | **Bavarian Propeller & Roundel**: Symbol of precision engineering and automotive performance. Strung with M-Power tricolor beads (Cyan, Blue, Red). | **Rev the engine**: High-RPM drag/flick rotation physics with cold turbo acceleration roar and M-Power sparks. |
| 2 | **Murugan Vel (Sacred Spear)** | 🔱 | Tamil Nadu, India | **Divine Lance of Wisdom**: Represents clarity of intellect, courage, and triumph over internal & external obstacles. Strung with gold & vermilion beads. | **Vetri Vel! (Harohara)**: Sacred Shankha conch shell drone + brass temple bells, golden aura rings, and vibhuti/kumkum sparkles. |
| 3 | **Nimbu-mirchi** | 🌶️ | India | **Threshold Ward**: 7 fresh green chillies and a lemon tied with a black coal cube at thresholds to dispel negative glances (*buri nazar*). | **Hang a fresh garland**: Emerald-lime sparkle burst with refreshing crisp temple chime. |
| 4 | **Maneki-neko** | 🐱 | Japan | **Beckoning Cat**: Traditional Japanese talisman that waves its raised paw front-to-back to invite good fortune, luck, and prosperity into the room. | **Beckon good fortune**: Multi-cycle waving paw with authentic mechanical wood click & golden sparkles. |
| 5 | **Daruma** | 🎯 | Japan | **Goal & Grit Doll**: Paint the left eye pupil when initiating an ambitious goal or wish, and paint the right eye upon achieving it. | **Make a wish / Wish granted**: Zen singing bowl resonance with celebratory chord progression. |
| 6 | **Drishti bommai** | 👹 | South India | **Fierce Guardian**: Auspicious protector mask hung on new homes and workspaces to catch and neutralize the first envious glance. | **Repaint the guardian**: Cycles vivid sacred hues with radiating guardian aura shockwave. |
| 7 | **Páncháng jié (Chinese Knot)** | 🏮 | China | **Endless Knot**: An unbroken intertwined silk knot symbolizing boundless longevity, harmony, unity, and endless prosperity. | **Tie in good fortune**: Deep resonant silk gong chime with cinching cord elastic pulse. |
| 8 | **Himmeli** | 🌾 | Finland | **Geometric Straw Mobile**: Traditional Nordic rye-straw mobile celebrating agricultural harvest, abundance, and mindful focused flow. | **Set it turning**: Smooth 3D geometric spinning with crystalline Nordic wind chimes. |
| 9 | **Hamsa** | ✋ | Middle East | **Protective Palm**: Ancient palm-shaped talisman offering protection against negative energies and blessing homes with strength and peace. | **Ward off bad luck**: Deep blue mystic energy ring expansion with glass ripple chime. |
| 10 | **Nazar boncuğu** | 🧿 | Turkey / Aegean | **Evil Eye Glass**: Handcrafted cobalt and turquoise concentric glass eye that absorbs and deflects envious glances. | **Give it a flick**: Concentric sapphire glass protective wave with crystalline ring. |
| 11 | **Ghanta** | 🔔 | India | **Sacred Temple Bell**: Handcrafted brass bell rung prior to prayer or deep creative work to dispel lethargy, clear the mind, and focus the spirit. | **Ring the bell**: Rich dual-frequency brass bell resonance (440 Hz & 880 Hz) with golden ripples. |
| 12 | **Custom Emoji** | 🍀 | Yours | **Personalized Talisman**: Hang any personal symbol or emoji that inspires luck, joy, or focus (e.g. 🍀, ⚡, 💎, 🚀, 🕉️). | **Bless custom charm**: Golden burst with cheerful multi-tone bell arpeggio. Click active emoji in gallery to customize. |

---

## ⌨️ Global Keyboard Shortcuts & Mouse Controls

### Global Windows Hotkeys (Work anywhere, even while in other apps/games)
* <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> — **Perform Active Ritual**: Triggers charm sound, particle aura, and animations immediately.
* <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> — **Toggle Charm Visibility**: Instant hide / show toggle for meetings or gaming.
* <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> — **Toggle Audio Mute**: Silence or enable procedural audio effects.
* <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> — **Re-center Charm**: Smoothly animates the charm back to screen top center.

### Interactive Mouse Gestures (Direct on Screen)
* **Drag Cord**: Click and drag the cord or beads anywhere to pull, stretch, and swing the charm with real spring-mass Verlet physics.
* **Flick BMW Spinner**: Click and flick horizontally across the BMW symbol to spin it at high RPM with inertia and deceleration.
* **Click Charm Body**: Left-click the dangling charm to immediately activate its ritual.
* **Seamless Click-Through**: Any area outside the charm and cord is completely click-through — you can click desktop icons, web browser tabs, or game controls directly behind it.

---

## 🛠️ Project Structure

```
luckydangle/
├── charms/                     # Original high-res charm graphics (PNG, WebP)
│   ├── BMW.svg.webp            # High-res BMW roundel
│   ├── murugan-vel.png         # Sacred Murugan Vel lance asset
│   ├── nazar.png               # Nazar evil eye
│   └── ...                     # Daruma, Hamsa, Himmeli, etc.
├── electron/
│   └── main.cjs                # Windows Electron process, transparent overlay & tray manager
├── public/                     # Static assets served by Vite
│   └── charms/                 # Preloaded charm assets for runtime
├── src/
│   ├── audio.js                # Web Audio API procedural sound synthesizer (Velu sound, revs, bells)
│   ├── charms.js               # CharmManager: physics, bead strings, rendering engines, rituals
│   ├── main.js                 # Full-screen Charm Gallery web page controller
│   ├── overlay.js              # Transparent screen overlay canvas, Verlet physics loop & input
│   ├── particles.js            # Particle physics engine for sparkles, aura rings, and bursts
│   ├── physics.js              # Verlet spring-mass dangling string simulator
│   ├── style.css               # Liquid-glass tokens, typography, and gallery UI styling
│   └── tray.js                 # All-in-One Taskbar Controller logic & IPC bridge
├── index.html                  # Full-screen interactive Charm Gallery & cultural story guide
├── overlay.html                # Transparent click-through screen overlay canvas
├── tray.html                   # Taskbar All-in-One Controller liquid-glass flyout interface
├── package.json                # Project dependencies, scripts, and build configuration
├── start-luckydangle.bat       # Self-healing Windows batch launcher
├── run-silent.vbs              # Silent background VBS launcher (no console window)
├── vite.config.js              # Vite multi-page build configuration
└── README.md                   # Complete documentation & user guide
```

---

## 🔧 Troubleshooting & Common Windows Questions

### Q: The tray icon is inside the Windows overflow area (the `^` arrow on the taskbar).
**A:** In Windows 10/11, new tray icons are sometimes tucked into the overflow tray chevron. Click the `^` icon near your clock, drag the Lucky Dangle icon directly onto your main taskbar, and it will stay permanently pinned there!

### Q: The charm audio doesn't play when I press Ctrl+Shift+S inside a game.
**A:** Ensure your sound is not muted in the taskbar flyout (`🔊 Sound ON`). Version 2.0 includes `autoplay-policy=no-user-gesture-required` so hotkeys trigger audio system-wide without requiring the app to take window focus.

### Q: I see `Lock file can not be created! Error code: 32` or `Access is denied (0x5)`.
**A:** This happens when Lucky Dangle is already running in the background and another instance is started. Lucky Dangle is a single-instance Windows application. If an instance is already active in your taskbar system tray, starting another will safely focus and toggle your existing charm. Version 2.0 isolates its user data to `%APPDATA%\luckydangle-app` and disables shader disk cache collisions to prevent Windows file-sharing locks.

### Q: What is the `npm warn allow-scripts` warning during `npm install`?
**A:** On Node.js v24+ / npm v11+, npm introduces a script approval notice for packages containing native installation scripts (such as `electron` and `esbuild`). This is purely informational and does not impact app execution. You can run `npx @npmcli/config approve-scripts` or simply proceed with `npm run build` and `npm start`.

### Q: How do I completely close Lucky Dangle?
**A:** Left-click the tray icon and click `✕ Exit`, or right-click the tray icon and select `❌ Exit Lucky Dangle`.

---

## 📜 License

Created and maintained by **[SUDARSHNACHAND](https://github.com/SUDARSHNACHAND)**.  
Private & Proprietary. All rights reserved.
