const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, dialog, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ─── Constants ──────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';
const AURA_DATA_DIR = path.join(os.homedir(), 'AppData', 'Roaming', 'Aura');
const ATTACHMENTS_DIR = path.join(AURA_DATA_DIR, 'attachments');

// Ensure attachment directory exists
if (!fs.existsSync(ATTACHMENTS_DIR)) {
    fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
}

let mainWindow = null;
let quickCaptureWindow = null;
let tray = null;
let shutdownNotificationTimer = null;
let currentShutdownTime = null;

// ─── Single Instance Lock ────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
}
app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
});

// ─── Main Window ─────────────────────────────────────────────────────────────
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: true,
        titleBarStyle: 'default',
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        show: false, // Show after ready-to-show
        backgroundColor: '#000000',
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }

    // Show window once content is loaded
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Minimize to tray instead of quitting on close
    mainWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            mainWindow.hide();
        }
    });
}

// ─── Quick Capture Window ─────────────────────────────────────────────────────
function createQuickCaptureWindow() {
    if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
        quickCaptureWindow.show();
        quickCaptureWindow.focus();
        return;
    }

    const { width: screenWidth, height: screenHeight } = require('electron').screen.getPrimaryDisplay().workAreaSize;

    quickCaptureWindow = new BrowserWindow({
        width: 560,
        height: 80,
        x: Math.round((screenWidth - 560) / 2),
        y: Math.round(screenHeight * 0.25),
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        transparent: true,
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDev) {
        quickCaptureWindow.loadURL('http://localhost:3000/?mode=quick-capture');
    } else {
        quickCaptureWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'), {
            query: { mode: 'quick-capture' },
        });
    }

    quickCaptureWindow.on('blur', () => {
        quickCaptureWindow.hide();
    });
}

// ─── System Tray ─────────────────────────────────────────────────────────────
function createTray() {
    const trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    tray = new Tray(trayIconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Aura',
            click: () => {
                mainWindow.show();
                mainWindow.focus();
            },
        },
        {
            label: 'Quick Capture',
            accelerator: 'CommandOrControl+Shift+Space',
            click: () => createQuickCaptureWindow(),
        },
        { type: 'separator' },
        {
            label: 'Quit Aura',
            click: () => {
                app.isQuitting = true;
                app.quit();
            },
        },
    ]);

    tray.setToolTip('Aura — Mindful Productivity');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

// ─── Shutdown Notification ───────────────────────────────────────────────────
function scheduleShutdownNotification(timeStr) {
    if (shutdownNotificationTimer) clearTimeout(shutdownNotificationTimer);
    currentShutdownTime = timeStr;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If target has passed today, schedule for tomorrow
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    const msUntil = target.getTime() - now.getTime();

    shutdownNotificationTimer = setTimeout(() => {
        if (Notification.isSupported()) {
            const notif = new Notification({
                title: 'Time to wind down, Aura',
                body: "You've put in great work today. Open Aura to close out your day.",
                icon: path.join(__dirname, 'assets', 'icon.ico'),
            });
            notif.on('click', () => {
                mainWindow.show();
                mainWindow.focus();
            });
            notif.show();
        }
        // Schedule next day's notification
        scheduleShutdownNotification(timeStr);
    }, msUntil);
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────
function registerIPCHandlers() {
    // Pick any file from disk
    ipcMain.handle('dialog:openFile', async (_, taskId) => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            title: 'Attach files to task',
        });

        if (result.canceled || result.filePaths.length === 0) return [];

        const taskDir = path.join(ATTACHMENTS_DIR, taskId);
        if (!fs.existsSync(taskDir)) fs.mkdirSync(taskDir, { recursive: true });

        const attachments = [];
        for (const filePath of result.filePaths) {
            const fileName = path.basename(filePath);
            const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const destPath = path.join(taskDir, `${fileId}-${fileName}`);
            fs.copyFileSync(filePath, destPath);
            const stats = fs.statSync(destPath);
            attachments.push({
                id: fileId,
                name: fileName,
                path: destPath,
                size: stats.size,
                type: path.extname(fileName).slice(1),
            });
        }
        return attachments;
    });

    // Open a file with its default application
    ipcMain.handle('shell:openFile', async (_, filePath) => {
        try {
            await shell.openPath(filePath);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // Delete an attachment from disk
    ipcMain.handle('fs:deleteAttachment', async (_, filePath) => {
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    });

    // Receive shutdown time setting from renderer
    ipcMain.on('settings:shutdownTime', (_, timeStr) => {
        scheduleShutdownNotification(timeStr);
    });

    // Quick capture: add task and close overlay window
    ipcMain.on('quick-capture:submit', (_, taskText) => {
        if (mainWindow) {
            mainWindow.webContents.send('add-task-from-capture', taskText);
        }
        if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
            quickCaptureWindow.hide();
        }
    });

    ipcMain.on('quick-capture:cancel', () => {
        if (quickCaptureWindow && !quickCaptureWindow.isDestroyed()) {
            quickCaptureWindow.hide();
        }
    });

    // Startup control
    ipcMain.handle('startup:getEnabled', () => {
        return app.getLoginItemSettings().openAtLogin;
    });

    ipcMain.on('startup:setEnabled', (_, enabled) => {
        app.setLoginItemSettings({ openAtLogin: enabled });
    });
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
    createMainWindow();
    createTray();
    registerIPCHandlers();

    // Register global shortcut for Quick Capture
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
        createQuickCaptureWindow();
    });

    // Start with a default shutdown notification (6 PM)
    scheduleShutdownNotification('18:00');
});

app.on('window-all-closed', (e) => {
    // On Windows, keep the app running in tray
    if (process.platform !== 'darwin') {
        // Don't quit — it lives in the tray
    }
});

app.on('activate', () => {
    if (mainWindow === null) createMainWindow();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (shutdownNotificationTimer) clearTimeout(shutdownNotificationTimer);
});
