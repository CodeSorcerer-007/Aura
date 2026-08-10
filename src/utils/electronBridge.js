/**
 * electronBridge.js
 * 
 * Detects if we're running inside Electron and routes file operations
 * to the native filesystem via IPC, or falls back to IndexedDB (browser).
 */

export const isElectron = () => {
    return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';
};

/**
 * Open file picker and attach files to a task.
 * Returns an array of attachment metadata objects.
 */
export const pickAndAttachFiles = async (taskId) => {
    if (isElectron()) {
        return await window.electronAPI.openFileDialog(taskId);
    }
    // Fallback: use browser file input (handled by TaskDetailModal directly)
    return null;
};

/**
 * Open an attached file with the OS default application.
 */
export const openAttachment = async (attachment) => {
    if (isElectron() && attachment.path) {
        return await window.electronAPI.openAttachment(attachment.path);
    }
    // Browser fallback: open blob URL
    if (attachment.blobUrl) {
        window.open(attachment.blobUrl, '_blank');
    }
};

/**
 * Delete an attachment from the filesystem.
 */
export const deleteAttachmentFromDisk = async (attachment) => {
    if (isElectron() && attachment.path) {
        return await window.electronAPI.deleteAttachment(attachment.path);
    }
    // IndexedDB cleanup is handled by useTaskStore
};

/**
 * Format file size to human-readable string.
 */
export const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Get a file type icon emoji based on extension.
 */
export const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons = {
        pdf: '📄', doc: '📝', docx: '📝', txt: '📋', md: '📋',
        xls: '📊', xlsx: '📊', csv: '📊', ppt: '📊', pptx: '📊',
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️',
        mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬',
        mp3: '🎵', wav: '🎵', ogg: '🎵',
        zip: '📦', rar: '📦', '7z': '📦',
        js: '💻', ts: '💻', py: '💻', java: '💻', html: '💻', css: '💻',
        json: '⚙️', yml: '⚙️', yaml: '⚙️',
    };
    return icons[ext] || '📎';
};

/**
 * Send shutdown time to Electron main process.
 */
export const sendShutdownTime = (time) => {
    if (isElectron()) {
        window.electronAPI.sendShutdownTime(time);
    }
};
