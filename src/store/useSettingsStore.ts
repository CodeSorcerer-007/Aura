import { create } from 'zustand';
import * as Tone from 'tone';
import { getDBItem, setDBItem } from '../utils/db';
import { performNativeBackup, getStartupEnabled, setStartupEnabled } from '../utils/electronBridge';
import { CustomTheme, GroveTree, UserStats } from '../types';

export interface SettingsState {
    theme: string;
    customThemes: CustomTheme[];
    soundEffectsEnabled: boolean;
    autoArchiveEnabled: boolean;
    notificationsEnabled: boolean;
    shutdownTime: string;
    morningTime: string;
    autoStartEnabled: boolean;
    grove: GroveTree[];
    stats: UserStats & { completedCount: number; totalFocusMinutes: number };
    unlockedAchievements: string[];
    hasLaunched: boolean;
    backupDirectoryHandle: any;

    loadSettings: () => Promise<void>;
    setTheme: (newTheme: string) => void;
    setHasLaunched: (launched: boolean) => void;
    setGrove: (updater: GroveTree[] | ((prev: GroveTree[]) => GroveTree[])) => void;
    incrementGroveGrowth: () => void;
    setStats: (updater: (UserStats & { completedCount: number; totalFocusMinutes: number }) | ((prev: UserStats & { completedCount: number; totalFocusMinutes: number }) => UserStats & { completedCount: number; totalFocusMinutes: number })) => void;
    setUnlockedAchievements: (updater: string[] | ((prev: string[]) => string[])) => void;
    setCustomThemes: (updater: CustomTheme[] | ((prev: CustomTheme[]) => CustomTheme[])) => void;
    setSoundEffectsEnabled: (enabled: boolean) => void;
    setAutoArchiveEnabled: (enabled: boolean) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setAutoStartEnabled: (enabled: boolean) => void;
    setShutdownTime: (time: string) => void;
    setMorningTime: (time: string) => void;
    playSoundEffect: (effect: string) => void;
    selectBackupDirectory: () => Promise<boolean>;
    performAutoBackup: (allData: any) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    theme: 'dark',
    customThemes: [],
    soundEffectsEnabled: true,
    autoArchiveEnabled: false,
    notificationsEnabled: false,
    autoStartEnabled: false,
    shutdownTime: '18:00',
    morningTime: '09:00',
    grove: [],
    stats: { completedCount: 0, streak: 1, lastActiveDate: null, totalFocusMinutes: 0, goldenSeeds: 0, focusedTasksCompleted: 0 },
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
                savedMorning,
                savedHasLaunched
            ] = await Promise.all([
                getDBItem<string>('aura-theme'),
                getDBItem<CustomTheme[]>('aura-custom-themes'),
                getDBItem<GroveTree[]>('aura-grove'),
                getDBItem<UserStats>('aura-stats'),
                getDBItem<string[]>('aura-achievements'),
                getDBItem<boolean>('aura-sound-effects'),
                getDBItem<boolean>('aura-auto-archive'),
                getDBItem<boolean>('aura-notifications-enabled'),
                getDBItem<string>('aura-shutdown-time'),
                getDBItem<string>('aura-morning-time'),
                getDBItem<boolean>('aura-has-launched')
            ]);

            let initialAutoStart = false;
            try {
                initialAutoStart = await getStartupEnabled();
            } catch (e) {}

            set({
                theme: savedTheme || 'dark',
                customThemes: savedCustomThemes || [],
                grove: savedGrove || [],
                stats: { completedCount: 0, streak: 1, lastActiveDate: null, totalFocusMinutes: 0, goldenSeeds: 0, focusedTasksCompleted: 0, ...(savedStats || {}) },
                unlockedAchievements: savedAchievements || [],
                soundEffectsEnabled: savedSound ?? true,
                autoArchiveEnabled: savedAutoArchive ?? false,
                notificationsEnabled: savedNotifications ?? false,
                autoStartEnabled: initialAutoStart,
                shutdownTime: savedShutdown || '18:00',
                morningTime: savedMorning || '09:00',
                hasLaunched: Boolean(savedHasLaunched)
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

    setAutoStartEnabled: (enabled) => {
        set({ autoStartEnabled: enabled });
        setStartupEnabled(enabled);
    },

    setShutdownTime: (time) => {
        set({ shutdownTime: time });
        setDBItem('aura-shutdown-time', time);
    },

    setMorningTime: (time) => {
        set({ morningTime: time });
        setDBItem('aura-morning-time', time);
    },

    playSoundEffect: (effect) => {
        const { soundEffectsEnabled } = get();
        if (!soundEffectsEnabled) return;

        try {
            Tone.start().then(() => {
                const synth = new Tone.Synth().toDestination();
                const now = Tone.now();
                const noteMap: Record<string, string> = {
                    add: "C5",
                    complete: "E6",
                    plant: "G4",
                    win: "A5",
                    delete: "C3",
                    achievement: "C4",
                };
                const note = noteMap[effect] ?? "C4";
                synth.triggerAttackRelease(note, "8n", now);
                // Dispose the synth after the note has fully decayed (~500 ms)
                // to prevent audio node accumulation on rapid calls.
                setTimeout(() => synth.dispose(), 500);
            }).catch(e => console.warn('Audio play blocked:', e));
        } catch (e) {
            console.warn('Audio system error:', e);
        }
    },

    selectBackupDirectory: async () => {
        if (!('showDirectoryPicker' in window)) {
            alert('File System Access API is not supported in this browser environment.');
            return false;
        }

        try {
            const handle = await (window as any).showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });
            set({ backupDirectoryHandle: handle });
            return true;
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting backup directory:', err);
            }
            return false;
        }
    },

    performAutoBackup: async (allData) => {
        try {
            const res = await performNativeBackup(allData);
            if (res && res.success) {
                console.log(`Native auto-backup saved successfully to ${res.filepath}`);
            }
        } catch (error) {
            console.error('Auto backup failed:', error);
        }
    }
}));
