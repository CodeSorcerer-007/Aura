import { create } from 'zustand';
import * as Tone from 'tone';
import { getDBItem, setDBItem } from '../utils/db';
import { achievementsList } from '../utils/helpers';

export const useSettingsStore = create((set, get) => ({
    theme: 'dark',
    customThemes: [],
    soundEffectsEnabled: true,
    autoArchiveEnabled: false,
    notificationsEnabled: false,
    shutdownTime: '18:00',
    grove: [],
    stats: { completedCount: 0, streak: 1, lastCompletedDate: null, totalFocusMinutes: 0 },
    unlockedAchievements: [],
    hasLaunched: false,
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
                savedShutdown,
                savedHasLaunched
            ] = await Promise.all([
                getDBItem('aura-theme'),
                getDBItem('aura-custom-themes'),
                getDBItem('aura-grove'),
                getDBItem('aura-stats'),
                getDBItem('aura-achievements'),
                getDBItem('aura-sound-effects'),
                getDBItem('aura-auto-archive'),
                getDBItem('aura-notifications-enabled'),
                getDBItem('aura-shutdown-time'),
                getDBItem('aura-has-launched')
            ]);

            set({
                theme: savedTheme || 'dark',
                customThemes: savedCustomThemes || [],
                grove: savedGrove || [],
                stats: savedStats || { completedCount: 0, streak: 1, lastCompletedDate: null, totalFocusMinutes: 0 },
                unlockedAchievements: savedAchievements || [],
                soundEffectsEnabled: savedSound ?? true,
                autoArchiveEnabled: savedAutoArchive ?? false,
                notificationsEnabled: savedNotifications ?? false,
                shutdownTime: savedShutdown || '18:00',
                hasLaunched: savedHasLaunched || false
            });
        } catch (error) {
            console.error('Error loading settings from IndexedDB:', error);
        }
    },

    setTheme: (newTheme) => {
        set({ theme: newTheme });
        setDBItem('aura-theme', newTheme);
    },

    setHasLaunched: (launched) => {
        set({ hasLaunched: launched });
        setDBItem('aura-has-launched', launched);
    },

    setGrove: (updater) => {
        set((state) => {
            const next = typeof updater === 'function' ? updater(state.grove) : updater;
            setDBItem('aura-grove', next);
            return { grove: next };
        });
    },
    
    incrementGroveGrowth: () => {
        set((state) => {
            const latestTreeIndex = state.grove.findLastIndex(tree => tree.growthPoints < tree.maxGrowth);
            if (latestTreeIndex > -1) {
                const newGrove = [...state.grove];
                newGrove[latestTreeIndex] = { ...newGrove[latestTreeIndex], growthPoints: newGrove[latestTreeIndex].growthPoints + 1 };
                setDBItem('aura-grove', newGrove);
                return { grove: newGrove };
            }
            return state;
        });
    },

    setStats: (updater) => {
        set((state) => {
            const next = typeof updater === 'function' ? updater(state.stats) : updater;
            setDBItem('aura-stats', next);
            return { stats: next };
        });
    },

    setUnlockedAchievements: (updater) => {
        set((state) => {
            const next = typeof updater === 'function' ? updater(state.unlockedAchievements) : updater;
            setDBItem('aura-achievements', next);
            return { unlockedAchievements: next };
        });
    },

    setCustomThemes: (updater) => {
        set((state) => {
            const next = typeof updater === 'function' ? updater(state.customThemes) : updater;
            setDBItem('aura-custom-themes', next);
            return { customThemes: next };
        });
    },

    setSoundEffectsEnabled: (enabled) => {
        set({ soundEffectsEnabled: enabled });
        setDBItem('aura-sound-effects', enabled);
    },

    setAutoArchiveEnabled: (enabled) => {
        set({ autoArchiveEnabled: enabled });
        setDBItem('aura-auto-archive', enabled);
    },

    setNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
        setDBItem('aura-notifications-enabled', enabled);
    },

    setShutdownTime: (time) => {
        set({ shutdownTime: time });
        setDBItem('aura-shutdown-time', time);
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
