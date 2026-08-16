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
let morningNotificationTimer = null;
let currentShutdownTime = null;
let currentMorningTime = null;

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
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#000000',
            symbolColor: '#ffffff',
            height: 32
        },
        autoHideMenuBar: true,
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

    mainWindow.on('closed', () => {
        mainWindow = null;
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
    try {
        const trayIconPath = path.join(__dirname, 'assets', 'icon.ico');
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
    } catch (err) {
        console.error('Failed to create system tray:', err);
    }
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

// ─── Morning Notification ───────────────────────────────────────────────────
function scheduleMorningNotification(timeStr) {
    if (morningNotificationTimer) clearTimeout(morningNotificationTimer);
    currentMorningTime = timeStr;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If target has passed today, schedule for tomorrow
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    const msUntil = target.getTime() - now.getTime();

    morningNotificationTimer = setTimeout(() => {
        if (Notification.isSupported()) {
            const notif = new Notification({
                title: 'Good morning, Aura',
                body: "Plan your day and set your Most Important Tasks.",
                icon: path.join(__dirname, 'assets', 'icon.ico'),
            });
            notif.on('click', () => {
                mainWindow.show();
                mainWindow.focus();
                mainWindow.webContents.send('trigger-morning-ritual');
            });
            notif.show();
        }
        // Schedule next day's notification
        scheduleMorningNotification(timeStr);
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
            const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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

    // Receive morning time setting from renderer
    ipcMain.on('settings:morningTime', (_, timeStr) => {
        scheduleMorningNotification(timeStr);
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

    // Native Silent Backup to Documents/Aura_Backups with 30-day rotation
    ipcMain.handle('fs:backupData', async (_, data) => {
        try {
            const backupsDir = path.join(os.homedir(), 'Documents', 'Aura_Backups');
            if (!fs.existsSync(backupsDir)) {
                fs.mkdirSync(backupsDir, { recursive: true });
            }
            const today = new Date().toISOString().split('T')[0];
            const filePath = path.join(backupsDir, `aura-backup-${today}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

            // 30-day rotation logic
            const files = fs.readdirSync(backupsDir).filter(f => f.startsWith('aura-backup-') && f.endsWith('.json'));
            if (files.length > 30) {
                // Sort by date (assuming YYYY-MM-DD format in filename)
                files.sort();
                // Delete oldest files
                const filesToDelete = files.slice(0, files.length - 30);
                for (const file of filesToDelete) {
                    fs.unlinkSync(path.join(backupsDir, file));
                }
            }

            return { success: true, filePath, filepath: filePath };
        } catch (err) {
            console.error('Backup error:', err);
            return { success: false, error: err.message };
        }
    });

    // Native Restore Picker
    ipcMain.handle('fs:restoreData', async () => {
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                title: 'Select Aura Backup File',
                defaultPath: path.join(os.homedir(), 'Documents', 'Aura_Backups'),
                filters: [{ name: 'JSON Backups', extensions: ['json'] }],
                properties: ['openFile']
            });

            if (result.canceled || result.filePaths.length === 0) return { success: false, canceled: true };
            const content = fs.readFileSync(result.filePaths[0], 'utf-8');
            return { success: true, data: JSON.parse(content) };
        } catch (err) {
            console.error('Restore error:', err);
            return { success: false, error: err.message };
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

function checkForUpdates() {
    if (isDev) return;
    try {
        const { autoUpdater } = require('electron-updater');
        autoUpdater.checkForUpdatesAndNotify().catch(err => {
            console.log('Auto updater check failed:', err);
        });
    } catch (e) {
        console.log('electron-updater not available:', e.message);
    }
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
    createMainWindow();
    createTray();
    registerIPCHandlers();
    checkForUpdates();

    // Register global shortcut for Quick Capture
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
        createQuickCaptureWindow();
    });

    // Start with default notifications
    scheduleShutdownNotification('18:00');
    scheduleMorningNotification('09:00');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) createMainWindow();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (shutdownNotificationTimer) clearTimeout(shutdownNotificationTimer);
    if (morningNotificationTimer) clearTimeout(morningNotificationTimer);
});
