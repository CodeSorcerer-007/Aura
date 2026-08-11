/**
 * electronBridge.ts
 * 
 * Detects if we're running inside Electron and routes file operations
 * to the native filesystem via IPC, or falls back to IndexedDB (browser).
 */

import { Attachment } from '../types';

export const isElectron = (): boolean => {
    return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';
};

/**
 * Open file picker and attach files to a task.
 * Returns an array of attachment metadata objects.
 */
export const pickAndAttachFiles = async (taskId: string): Promise<Attachment[] | null> => {
    if (isElectron() && window.electronAPI) {
        return await window.electronAPI.openFileDialog(taskId);
    }
    return null;
};

/**
 * Open an attached file with the OS default application.
 */
export const openAttachment = async (attachment: Attachment & { blobUrl?: string }): Promise<any> => {
    if (isElectron() && attachment.path && window.electronAPI) {
        return await window.electronAPI.openAttachment(attachment.path);
    }
    if (attachment.blobUrl) {
        window.open(attachment.blobUrl, '_blank');
    }
};

/**
 * Delete an attachment from the filesystem.
 */
export const deleteAttachmentFromDisk = async (attachment: Attachment): Promise<any> => {
    if (isElectron() && attachment.path && window.electronAPI) {
        return await window.electronAPI.deleteAttachment(attachment.path);
    }
};

/**
 * Format file size to human-readable string.
 */
export const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Get a file type icon emoji based on extension.
 */
export const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
        pdf: '📄', doc: '📝', docx: '📝', txt: '📋', md: '📋',
        xls: '📊', xlsx: '📊', csv: '📊', ppt: '📊', pptx: '📊',
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️',
        mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬',
        mp3: '🎵', wav: '🎵', ogg: '🎵',
        zip: '📦', rar: '📦', '7z': '📦',
        js: '💻', ts: '💻', py: '💻', java: '💻', html: '💻', css: '💻',
        json: '⚙️', yml: '⚙️', yaml: '⚙️',
    };
    return (ext && icons[ext]) || '📎';
};

/**
 * Send shutdown time to Electron main process.
 */
export const sendShutdownTime = (time: string): void => {
    if (isElectron() && window.electronAPI) {
        window.electronAPI.sendShutdownTime(time);
    }
};

/**
 * Send morning time to Electron main process.
 */
export const sendMorningTime = (time: string): void => {
    if (isElectron() && window.electronAPI) {
        window.electronAPI.sendMorningTime(time);
    }
};

/**
 * Perform native silent backup to Documents/Aura_Backups.
 */
export const performNativeBackup = async (data: any): Promise<{ success: boolean; filepath?: string; error?: string }> => {
    if (isElectron() && window.electronAPI) {
        return await window.electronAPI.backupData(data);
    }
    return { success: false, error: 'Not in Electron environment' };
};

/**
 * Open native file dialog to restore backup data.
 */
export const performNativeRestore = async (): Promise<{ success: boolean; data?: any; canceled?: boolean; error?: string } | null> => {
    if (isElectron() && window.electronAPI) {
        return await window.electronAPI.restoreData();
    }
    return null;
};

/**
 * Startup control
 */
export const getStartupEnabled = async (): Promise<boolean> => {
    if (isElectron() && window.electronAPI) {
        return await window.electronAPI.getStartupEnabled();
    }
    return false;
};

export const setStartupEnabled = (enabled: boolean): void => {
    if (isElectron() && window.electronAPI) {
        window.electronAPI.setStartupEnabled(enabled);
    }
};
