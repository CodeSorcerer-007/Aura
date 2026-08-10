# Aura — Mindful Productivity

> **A privacy-first, fully offline productivity app that lives on your desktop. No subscriptions. No cloud. No server. Just you and your tasks.**

---

## ✨ Features

### 📋 Smart Task Capture
Type tasks naturally — Aura understands you:
```
Design the landing page by friday @work !
Submit report every week #Work
Call dentist in 2 weeks @health
Plan sprint Q3
Finish proposal end of month
```

| Syntax | What it does |
|---|---|
| `!` | Sets task as urgent (high priority) |
| `@tag` | Adds a searchable tag |
| `#Category` | Assigns a category |
| `by friday` / `end of week` | Sets a deadline |
| `every day` / `weekly` | Creates a recurring task |
| `Q1` / `Q3` | Sets deadline to end of that quarter |
| `this weekend` / `end of year` | Natural date expressions |

### 🌿 The Grove
Your tasks grow into a visual garden. Complete tasks → plant seeds → watch your Grove flourish with trees, flowers, and glowing orbs. A mindful, non-gamified way to see your progress.

### ⏱️ Focus Timer
Built-in Pomodoro-style focus timer with ambient background noise:
- 🌸 Pink noise
- 🌊 Brown noise  
- 💨 White noise
- Fully offline — powered by the [Tone.js](https://tonejs.github.io/) synthesis engine

### 📓 Journal
Daily reflection journal with prompts tied to your task momentum.

### 🏆 Achievements
Unlock milestones as you build habits — First Step, Task Master, Deep Focus, On a Roll, and more.

### 🎨 Themes
- **Dark** — sleek deep black
- **Crimson** — bold and energetic
- **Sakura** — soft and calm
- **Custom Themes** — create your own color palette

### 🔍 Command Palette & Search
Hit `/` or use the search icon to instantly find any task, journal entry, or template across your entire history.

### 📦 Templates
Save recurring task groups (e.g., "Weekly Review", "Sprint Planning") and apply them with one tap.

---

## 🚀 Installation

### Requirements
- [Node.js](https://nodejs.org/) v18 or newer
- [Git](https://git-scm.com/)
- A modern Chromium-based browser (Chrome, Edge, Arc) for PWA install

### Option A: One-Click (Windows)
```bash
git clone https://github.com/your-username/aura.git
cd aura
# Double-click install.bat
```

The script will:
1. Install all dependencies (`npm install`)
2. Build the production app (`npm run build`)
3. Launch it in your browser at `http://localhost:4173`

Then click **"Install Aura"** in your browser's address bar — Aura will be added to your Start Menu and Desktop as a standalone app. **You never need to open a terminal again.**

### Option B: macOS / Linux
```bash
git clone https://github.com/your-username/aura.git
cd aura
chmod +x install.sh
./install.sh
```

Then click **"Install Aura"** in Chrome's address bar.

### Option C: Developer Mode
```bash
git clone https://github.com/your-username/aura.git
cd aura
npm install
npm run dev
```

---

## 📱 Install as a PWA (Offline Desktop App)

Aura is a full **Progressive Web App**. Once installed:

- ✅ Works **completely offline** — no internet connection ever required
- ✅ Appears in your **Start Menu / Taskbar / Dock** like a native app
- ✅ Opens in a **standalone window** without any browser chrome
- ✅ All your data stays **100% on your device** in IndexedDB

To install from Chrome/Edge: look for the **install icon (⊕)** in the address bar after opening the app.

---

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI framework |
| [Vite 6](https://vitejs.dev/) | Build tool |
| [Tailwind CSS v4](https://tailwindcss.com/) | Styling |
| [Framer Motion](https://www.framer-motion.com/) | Animations & drag-and-drop |
| [Tone.js](https://tonejs.github.io/) | Focus timer audio synthesis |
| [@tanstack/react-virtual](https://tanstack.com/virtual) | Virtualized task list for large datasets |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Service Worker & offline caching |
| IndexedDB | Local data persistence |

---

## 🗂️ Project Structure

```
aura/
├── public/              # Static assets & PWA icons
├── src/
│   ├── App.jsx          # Root component & layout
│   ├── components/
│   │   ├── views/       # FlowView, GroveView, JournalView, ReviewView
│   │   ├── layout/      # CaptureInput, TaskBubble, BottomNav, Toasts
│   │   ├── modals/      # FocusView, TaskDetailModal, SettingsModal, etc.
│   │   └── icons/       # SVG icon components
│   ├── hooks/
│   │   ├── useAppState.js   # Central state management
│   │   └── usePreferences.js # IndexedDB persistence layer
│   └── utils/
│       ├── db.js        # IndexedDB wrapper (AuraDB v2)
│       └── helpers.js   # NLP date parser, formatters, demo data
├── install.bat          # One-click setup for Windows
├── install.sh           # One-click setup for macOS/Linux
└── vite.config.js       # Vite + PWA configuration
```

---

## 🔒 Privacy

- **Zero telemetry.** No analytics, no tracking, no crash reporting.
- **Zero network requests** after the initial build (fully offline).
- **All data lives in your browser's IndexedDB.** It never leaves your device.
- **Open source.** Audit every line.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `N` | New task (focus capture bar) |
| `S` | Open settings |
| `/` | Open command palette |
| `1` | Flow view |
| `2` | Grove view |
| `3` | Journal view |
| `4` | Projects view |
| `5` | Review view |
| `Escape` | Close any modal |

---

## 🧪 Development

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Build production bundle + generate PWA service worker
npm run preview  # Preview production build locally
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<p align="center">
  Made with 🌿 for people who believe productivity should feel calm.
</p>
