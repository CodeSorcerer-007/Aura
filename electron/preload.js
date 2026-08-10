const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // File attachment ops
    openFileDialog: (taskId) => ipcRenderer.invoke('dialog:openFile', taskId),
    openAttachment: (filePath) => ipcRenderer.invoke('shell:openFile', filePath),
    deleteAttachment: (filePath) => ipcRenderer.invoke('fs:deleteAttachment', filePath),

    // Quick Capture
    submitQuickCapture: (text) => ipcRenderer.send('quick-capture:submit', text),
    cancelQuickCapture: () => ipcRenderer.send('quick-capture:cancel'),

    // Settings sync
    sendShutdownTime: (time) => ipcRenderer.send('settings:shutdownTime', time),
    getStartupEnabled: () => ipcRenderer.invoke('startup:getEnabled'),
    setStartupEnabled: (enabled) => ipcRenderer.send('startup:setEnabled', enabled),

    // Receive events from main process
    onAddTaskFromCapture: (callback) => {
        ipcRenderer.on('add-task-from-capture', (_, text) => callback(text));
        return () => ipcRenderer.removeAllListeners('add-task-from-capture');
    },
});
