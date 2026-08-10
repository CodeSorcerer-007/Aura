<div align="center">
  <img src="public/pwa-512x512.png" width="120" alt="Aura Logo" />
  
  # 🌿 Aura v2.0
  **Mindful Productivity for Windows**

  <p>
    A privacy-first, fully offline productivity suite that lives on your desktop.<br/>
    No subscriptions. No cloud. No server. Just you, your tasks, and deep focus.
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-installation">Installation</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-privacy">Privacy</a>
  </p>
  
  ![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Local_First](https://img.shields.io/badge/Local_First-Offline-4caf50?style=for-the-badge&logo=databricks&logoColor=white)
</div>

<br/>

## ✨ Features

### ⚡ Global Quick Capture
Hit <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd> anywhere in Windows to summon the frameless Quick Capture overlay. Log a thought instantly without breaking your flow, and Aura will save it to your inbox in the background.

### 📋 Smart Task Syntax
Type tasks naturally — Aura understands you. 

```text
Design the landing page by friday @work !
Submit report every week #Work
Call dentist in 2 weeks @health
Plan sprint Q3
```

<div align="center">

| Syntax | What it does |
|:---:|:---|
| `!` | Sets task as urgent (high priority) |
| `@tag` | Adds a searchable tag |
| `#Category` | Assigns a category |
| `by friday` | Sets a deadline to the upcoming Friday |
| `every day` | Creates a recurring task |

</div>

---

### 🌅 Intentional Rituals
* **Morning Intention:** Start your day by picking up to 3 Most Important Tasks (MITs) which are pinned with golden stars.
* **Evening Shutdown:** Get a native Windows notification at your specified time to close out your day and reflect on your wins.

### ⏱️ Deep Work & Distraction Tracking
* **Focus Timer:** Built-in Pomodoro timer with offline ambient noise (Pink/Brown/White) powered by Tone.js.
* **Distraction Logging:** Feel the urge to check your phone? Click `⚡ Distracted?` to log the thought without stopping the timer. Review these in your daily Journal to build focus awareness.
* **Daily Capacity Limit:** Give tasks time estimates (`15m`, `1h`). Aura warns you if you plan more than an 8-hour workday.

### 📎 Native Filesystem Attachments
Drag and drop any file (`.pdf`, `.docx`, images, code) directly into tasks. Files are securely copied to your local AppData folder and can be launched in their native Windows applications directly from Aura.

### 🌿 The Grove
Your tasks grow into a visual garden. Complete tasks → plant seeds → watch your Grove flourish with trees, flowers, and glowing orbs. A mindful, non-gamified way to see your progress.

---

## 🚀 Installation & Building

Aura v2.0 is a native Electron application for Windows.

### Build from Source
```bash
git clone https://github.com/your-username/aura.git
cd aura
npm install

# Run in Development Mode
npm run electron:dev

# Build the Windows Installer (.exe)
npm run electron:build
```
The compiled installer will be available in the `dist` folder.

<br/>

## 🏗️ Tech Stack

| Technology | Purpose |
|---|---|
| **[Electron](https://www.electronjs.org/)** | Native desktop shell & OS integration |
| **[React 18](https://react.dev/)** | Core UI framework |
| **[Zustand](https://zustand-demo.pmnd.rs/)** | Ultra-fast, modular state management |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Utility-first styling |
| **[Framer Motion](https://www.framer-motion.com/)** | Liquid-smooth animations |
| **[Tone.js](https://tonejs.github.io/)** | Local audio synthesis for focus noise |

<br/>

## 🔒 Privacy

- 🚫 **Zero telemetry.** No analytics, no tracking, no crash reporting.
- 🚫 **Zero network requests.** Fully offline.
- 💾 **Local Data.** All databases and file attachments live exclusively on your hard drive (`%APPDATA%\Aura`).
- ☁️ **No Cloud.** You own your data.

<br/>

## ⌨️ Keyboard Shortcuts

| Key | Action |
|:---:|:---|
| <kbd>Ctrl+Shift+Space</kbd> | Global Quick Capture (from anywhere in OS) |
| <kbd>N</kbd> | New task (focus capture bar in-app) |
| <kbd>S</kbd> | Open settings |
| <kbd>/</kbd> | Open command palette |
| <kbd>1</kbd> - <kbd>5</kbd> | Switch between views |
| <kbd>Escape</kbd> | Close any open modal |

<br/>

---

<div align="center">
  <p>Made with 🌿 for people who believe productivity should feel calm.</p>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License">
  </a>
</div>
