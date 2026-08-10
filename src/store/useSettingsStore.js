import { create } from 'zustand';
import * as Tone from 'tone';
import { db } from '../utils/db';
import { defaultThemes, achievementsList } from '../utils/helpers';

export const useSettingsStore = create((set, get) => ({
    theme: 'dark',
    customThemes: {},
    soundEffectsEnabled: true,
    autoArchiveEnabled: false,
    notificationsEnabled: false,
    shutdownTime: '18:00',
    grove: [],
    stats: { completedCount: 0, streak: 1, lastCompletedDate: null, totalFocusMinutes: 0 },
    unlockedAchievements: [],
    backupDirectoryHandle: null,

    // Initial load from IndexedDB
    loadSettings: async () => {
        try {
            const [
                savedTheme,
                savedCustomThemes,
                savedGrove,
                savedStats,
                savedAchievements,
                savedSound,
                savedAutoArchive,
                savedNotifications,
                savedShutdown
            ] = await Promise.all([
                db.getTheme(),
                db.getCustomThemes(),
                db.getGrove(),
                db.getStats(),
                db.getUnlockedAchievements(),
                db.getSoundEffectsEnabled(),
                db.getAutoArchiveEnabled(),
                db.getNotificationsEnabled(),
                db.getShutdownTime()
            ]);

            set({
                theme: savedTheme || 'dark',
                customThemes: savedCustomThemes || {},
                grove: savedGrove || [],
                stats: savedStats || { completedCount: 0, streak: 1, lastCompletedDate: null, totalFocusMinutes: 0 },
                unlockedAchievements: savedAchievements || [],
                soundEffectsEnabled: savedSound ?? true,
                autoArchiveEnabled: savedAutoArchive ?? false,
                notificationsEnabled: savedNotifications ?? false,
                shutdownTime: savedShutdown || '18:00'
            });
        } catch (error) {
            console.error('Error loading settings from IndexedDB:', error);
        }
    },

    setTheme: (newTheme) => {
        set({ theme: newTheme });
        db.saveTheme(newTheme);
    },

    setCustomThemes: (updater) => {
        set((state) => {
            const next = typeof updater === 'function' ? updater(state.customThemes) : updater;
            db.saveCustomThemes(next);
            return { customThemes: next };
        });
    },

    setSoundEffectsEnabled: (enabled) => {
        set({ soundEffectsEnabled: enabled });
        db.saveSoundEffectsEnabled(enabled);
    },

    setAutoArchiveEnabled: (enabled) => {
        set({ autoArchiveEnabled: enabled });
        db.saveAutoArchiveEnabled(enabled);
    },

    setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
        db.saveNotificationsEnabled(enabled);
    },

    setShutdownTime: (time) => {
        set({ shutdownTime: time });
        db.saveShutdownTime(time);
    },

    playSoundEffect: (effect) => {
        const { soundEffectsEnabled } = get();
        if (!soundEffectsEnabled) return;

        try {
            const now = Tone.now();
            Tone.start().then(() => {
                const synth = new Tone.Synth().toDestination();
                switch (effect) {
                    case 'add':
                        synth.triggerAttackRelease("C5", "8n", now);
                        break;
                    case 'complete':
                        synth.triggerAttackRelease("E6", "8n", now);
                        break;
                    case 'plant':
                        synth.triggerAttackRelease("G4", "8n", now);
                        break;
                    case 'win':
                        synth.triggerAttackRelease("A5", "8n", now);
                        break;
                    case 'delete':
                        synth.triggerAttackRelease("C3", "8n", now);
                        break;
                    default:
                        synth.triggerAttackRelease("C4", "8n", now);
                }
            }).catch(e => console.warn('Audio play blocked:', e));
        } catch (e) {
            console.warn('Audio system error:', e);
        }
    },

    // File System Access API - Silent Auto Backup (Phase 3)
    selectBackupDirectory: async () => {
        if (!('showDirectoryPicker' in window)) {
            alert('File System Access API is not supported in this browser environment.');
            return false;
        }

        try {
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            set({ backupDirectoryHandle: handle });
            return true;
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting backup directory:', err);
            }
            return false;
        }
    },

    performAutoBackup: async (allData) => {
        const { backupDirectoryHandle } = get();
        if (!backupDirectoryHandle) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const fileName = `aura-backup-${today}.json`;
            const fileHandle = await backupDirectoryHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(allData, null, 2));
            await writable.close();
            console.log(`Auto-backup saved successfully to ${fileName}`);
        } catch (error) {
            console.error('Auto backup failed:', error);
        }
    }
}));
