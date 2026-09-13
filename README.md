# Lucky Dangle 🧿✨

> **Interactive Screen Charms for Windows PC**  
> Hang traditional lucky charms, spinners, and talismans from the top of your display with authentic spring-mass physics, liquid glass controls, and genuine rituals.

![OS Support: Windows Only](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?logo=windows&logoColor=white)
![Node Version](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Framework](https://img.shields.io/badge/Electron-33-47848F?logo=electron&logoColor=white)
![Styling](https://img.shields.io/badge/UI-Liquid%20Glass-8ba3f8)

---

## 🖥️ System Requirements
* **Operating System**: Windows 10 or Windows 11 (64-bit) — *Exclusively built and optimized for Windows Desktop*.
* **Runtime**: [Node.js](https://nodejs.org/) v18.0.0 or higher.
* **Display**: Any standard or high-DPI display, single or multi-monitor setups.

---

## 🚀 Installation & Setup Instructions

### 1. Clone the Private Repository
Open **PowerShell** or **Command Prompt** and clone your private repository:
```powershell
git clone https://github.com/SUDARSHNACHAND/luckydangle.git
cd luckydangle
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Build the Distribution Assets
Compile the liquid glass interface and physics engines:
```powershell
npm run build
```

### 4. Launch Lucky Dangle
Choose your preferred launch method:

* **Standard Terminal Launch**:
  ```powershell
  npm start
  ```
* **One-Click Windows Launcher**:
  Double-click [`start-luckydangle.bat`](start-luckydangle.bat) from File Explorer.
* **Silent Background Launch (No Terminal Window)**:
  Double-click [`run-silent.vbs`](run-silent.vbs). Lucky Dangle will quietly appear at the top of your screen and dock into your Windows System Tray.

---

## 💎 Liquid Glass Interface & Features

```
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │  🏎️  🌶️  🐱  🎯  👹  🏮  🌾  ✋  🧿  🔔  🍀  │  ✨ Rev the engine  │  🔊 Sound ON  │
  └────────────────────────────────────────────────────────────────────────────────────────┘
                       ▲                                      ▲                  ▲
                 Model Switcher                         Active Ritual       Sound Toggle
```

* **Frosted Liquid Glass Bar**: High-refraction backdrop blur (`blur(24px) saturate(200%)`), specular chamfered top edges, and glowing jewel pill indicators.
* **Seamless Windows Click-Through**: You can click right through the transparent window to browse or type. Only the charm cord and top pill bar register your mouse cursor.
* **Vector Sound Button**: Dynamic SVG speaker toggle matching reference design — displays radiating sound waves when **Sound ON**, and a clean diagonal slash when **Sound OFF**.
* **Direct Cord Manipulation**: Grab the cord or beads anywhere along its length to swing, stretch, or flick the charm.
* **Windows System Tray Integration**: Right-click the tray icon in your Windows notification area to switch charms, trigger rituals, toggle sound, or hide/show the overlay.

---

## ⌨️ Windows Keyboard Shortcuts

| Shortcut | Scope | Action |
|:---|:---|:---|
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd> | Global (System-wide) | Toggle Screen Charm Visibility (Hide / Show) |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Global (System-wide) | Perform Active Charm Ritual |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> | Global (System-wide) | Re-center Charm to Top Center |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> | Global (System-wide) | Toggle Sound (Mute / Unmute) |
| <kbd>Ctrl</kbd> + <kbd>D</kbd> | In-app | Toggle Screen Charm Visibility |
| <kbd>S</kbd> | In-app | Perform Ritual & Sparkle Burst |
| <kbd>M</kbd> | In-app | Toggle Sound ON / OFF |
| <kbd>R</kbd> | In-app | Re-center Charm |
| <kbd>C</kbd> | In-app | Cycle to Next Charm Model |

---

## 🧿 Charms & Simple Uses Guide

Each charm has an authentic cultural background, custom cord beads, and an interactive ritual:

| Charm | Icon | Origin | Meaning & Simple Use | Ritual Action |
|:---|:---:|:---|:---|:---|
| **BMW Symbol Spinner** | 🏎️ | Germany | **High-Performance Spinner**: The legendary Bavarian roundel & propeller spinner with M-Power tricolor cord beads (Cyan, Blue, Red). | **Rev the engine**: High-RPM turbo spin with engine acceleration audio & M-Power sparks. |
| **Nimbu-mirchi** | 🌶️ | India | **Threshold Ward**: 7 fresh green chillies and a lemon tied to turn away misfortune and negative glance (*buri nazar*). | **Hang a fresh garland**: Green sparkle burst & refreshing crisp chime. |
| **Maneki-neko** | 🐱 | Japan | **Beckoning Cat**: Traditional lucky cat that waves its raised paw front-to-back to invite wealth, customers, and good fortune. | **Beckon good fortune**: Multi-cycle waving paw with authentic click audio & gold sparks. |
| **Daruma** | 🎯 | Japan | **Goal & Grit Doll**: Paint the left pupil when you set a goal or make a wish. Paint the right pupil when your goal is achieved. | **Make a wish / Wish granted**: Zen bell & celebratory chord upon achieving goals. |
| **Drishti bommai** | 👹 | South India | **Fierce Guardian**: An auspicious guardian mask hung on new homes and workplaces to catch and neutralize the first jealous glance. | **Repaint the guardian**: Cycles vibrant sacred hues with guardian aura waves. |
| **Páncháng jié** | 🏮 | China | **Endless Knot**: An unbroken intertwined silk knot representing boundless longevity, unity, and endless prosperity. | **Tie in good fortune**: Resonant silk gong chime with cinching cord pulse. |
| **Himmeli** | 🌾 | Finland | **Straw Mobile**: Geometric rye-straw mobile celebrating agricultural abundance, fruitful work, and focused peaceful flow. | **Set it turning**: Smooth 3D geometric spinning with Nordic wind chimes. |
| **Hamsa** | ✋ | Middle East | **Hand of Fatima**: Protective open palm talisman offering shield against harm, blessing the home with strength and peace. | **Ward off bad luck**: Deep blue mystic energy ring & ripple chime. |
| **Nazar boncuğu** | 🧿 | Turkey | **Evil Eye Glass**: Handcrafted cobalt and turquoise glass eye that absorbs and shatters negative intentions. | **Give it a flick**: Concentric blue protective pulse with glass ripple audio. |
| **Ghanta** | 🔔 | India | **Temple Bell**: Sacred brass bell rung prior to prayer or deep work to clear the mind, dispel lethargy, and focus the spirit. | **Ring the bell**: Rich dual-frequency brass bell chime with golden resonance ring. |
| **Custom Emoji** | 🍀 | Yours | **Personal Talisman**: Hang any emoji or symbol that brings you personal luck, joy, or focus. | **Pick an emoji**: Click the `🍀` button when active to input any emoji of your choice. |

---

## 🛠️ Project Structure

```
luckydangle/
├── charms/                # High-res charm image assets (BMW, Nazar, Daruma, etc.)
├── electron/
│   └── main.cjs           # Windows Electron transparent overlay & tray manager
├── public/                # Public assets served by Vite
├── src/
│   ├── audio.js           # Web Audio API procedural synthesizer (engines, bells, chimes)
│   ├── charms.js          # CharmManager, rendering engines, beads, and rituals
│   ├── main.js            # Gallery web app logic & card controller
│   ├── overlay.js         # Transparent screen overlay logic & hover hit testing
│   ├── particles.js       # Lightweight physics sparkle particle system
│   ├── physics.js         # Verlet spring-mass dangling string cord physics
│   └── style.css          # Liquid glass design tokens, card styles, and animations
├── index.html             # Full-screen Charm Gallery web page
├── overlay.html           # Transparent click-through screen overlay canvas & pill bar
├── package.json           # Scripts and project dependencies
├── start-luckydangle.bat  # Native Windows batch launcher
├── run-silent.vbs         # Silent background VBS launcher
└── vite.config.js         # Vite bundle configuration
```

---

## 📜 License
Private and Proprietary. All rights reserved by SUDARSHNACHAND.
