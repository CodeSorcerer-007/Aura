import { useEffect, useState, useCallback } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { getTodayDateString, getLocalString, achievementsList, demoTasks } from '../utils/helpers';
import { isElectron } from '../utils/electronBridge';

export function useAppLogic() {
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const loadInitialData = useTaskStore(state => state.loadInitialData);
    const tasks = useTaskStore(state => state.tasks);
    const setTasks = useTaskStore(state => state.setTasks);
    const addTask = useTaskStore(state => state.addTask);
    const journalEntries = useTaskStore(state => state.journalEntries);
    const templates = useTaskStore(state => state.templates);
    const customCategories = useTaskStore(state => state.customCategories);

    const loadSettings = useSettingsStore(state => state.loadSettings);
    const hasLaunched = useSettingsStore(state => state.hasLaunched);
    const setHasLaunched = useSettingsStore(state => state.setHasLaunched);
    const stats = useSettingsStore(state => state.stats);
    const setStats = useSettingsStore(state => state.setStats);
    const grove = useSettingsStore(state => state.grove);
    const unlockedAchievements = useSettingsStore(state => state.unlockedAchievements);
    const setUnlockedAchievements = useSettingsStore(state => state.setUnlockedAchievements);
    const playSoundEffect = useSettingsStore(state => state.playSoundEffect);
    const shutdownTime = useSettingsStore(state => state.shutdownTime);
    const autoArchiveEnabled = useSettingsStore(state => state.autoArchiveEnabled);
    const performAutoBackup = useSettingsStore(state => state.performAutoBackup);
    const theme = useSettingsStore(state => state.theme);
    const customThemes = useSettingsStore(state => state.customThemes);
    const soundEffectsEnabled = useSettingsStore(state => state.soundEffectsEnabled);
    const notificationsEnabled = useSettingsStore(state => state.notificationsEnabled);

    const setAchievementToast = useUIStore(state => state.setAchievementToast);
    const setAssistantMessage = useUIStore(state => state.setAssistantMessage);
    const shutdownRitual = useUIStore(state => state.shutdownRitual);
    const setIsMorningRitualOpen = useUIStore(state => state.setIsMorningRitualOpen);
    const setIsCommandPaletteOpen = useUIStore(state => state.setIsCommandPaletteOpen);
    const isCommandPaletteOpen = useUIStore(state => state.isCommandPaletteOpen);
    const isSearchOpen = useUIStore(state => state.isSearchOpen);
    const setIsSearchOpen = useUIStore(state => state.setIsSearchOpen);
    const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
    const setIsSettingsOpen = useUIStore(state => state.setIsSettingsOpen);
    const detailModal = useUIStore(state => state.detailModal);
    const setDetailModal = useUIStore(state => state.setDetailModal);
    const focusTaskId = useUIStore(state => state.focusTaskId);
    const setFocusTaskId = useUIStore(state => state.setFocusTaskId);
    const isMindfulMinuteOpen = useUIStore(state => state.isMindfulMinuteOpen);
    const setIsMindfulMinuteOpen = useUIStore(state => state.setIsMindfulMinuteOpen);
    const isThemeCreatorOpen = useUIStore(state => state.isThemeCreatorOpen);
    const setIsThemeCreatorOpen = useUIStore(state => state.setIsThemeCreatorOpen);
    const setCurrentView = useUIStore(state => state.setCurrentView);
    const assistantMessage = useUIStore(state => state.assistantMessage);

    // Initial Load
    useEffect(() => {
        if (!initialLoadDone) {
            Promise.all([loadInitialData(), loadSettings()]).then(() => {
                setInitialLoadDone(true);
            });
        }
    }, [initialLoadDone, loadInitialData, loadSettings]);

    // First Launch Demo Tasks
    useEffect(() => {
        if (initialLoadDone && !hasLaunched) {
            setTasks(demoTasks);
            setHasLaunched(true);
        }
    }, [initialLoadDone, hasLaunched, setTasks, setHasLaunched]);

    // Silent Auto Backup on task changes
    useEffect(() => {
        if (initialLoadDone && isElectron()) {
            performAutoBackup({ tasks, templates, stats, unlockedAchievements, theme, grove, customCategories, journalEntries, customThemes, shutdownTime, soundEffectsEnabled, autoArchiveEnabled, notificationsEnabled });
        }
    }, [tasks, initialLoadDone, performAutoBackup]);

    // Achievements Check
    const checkAchievements = useCallback(() => {
        for (const achievement of achievementsList) {
            if (!unlockedAchievements.includes(achievement.id) && achievement.check(tasks, stats, grove)) {
                setUnlockedAchievements(prev => [...prev, achievement.id]);
                setAchievementToast(achievement);
                playSoundEffect('achievement');
                setTimeout(() => setAchievementToast(null), 4000);
            }
        }
    }, [unlockedAchievements, tasks, stats, grove, setUnlockedAchievements, setAchievementToast, playSoundEffect]);

    // Streak & Auto Archive
    const updateStreakAndArchive = useCallback(() => {
        const today = getTodayDateString();
        const lastActive = stats.lastActiveDate;
        const tasksCompletedToday = tasks.some(t => t.completionDate === today);

        if (lastActive !== today) {
            if (autoArchiveEnabled) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalString(yesterday);
                setTasks(currentTasks => currentTasks.map(t => (t.completionDate === yesterdayStr ? {...t, isArchived: true} : t)));
            }

            if (tasksCompletedToday) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalString(yesterday);

                if (lastActive === yesterdayStr) {
                    setStats(prev => ({ ...prev, streak: prev.streak + 1, lastActiveDate: today }));
                } else {
                    setStats(prev => ({ ...prev, streak: 1, lastActiveDate: today }));
                }
            }
        }
    }, [stats.lastActiveDate, tasks, autoArchiveEnabled, setTasks, setStats]);

    // Assistant & Shutdown Prompts
    const runAssistant = useCallback(() => {
        const lastPromptKey = 'aura-last-assistant-prompt';
        const lastPromptDate = localStorage.getItem(lastPromptKey);
        if (lastPromptDate === getTodayDateString()) return;

        const now = new Date();
        const [shutdownHour, shutdownMinute] = shutdownTime.split(':').map(Number);
        if (now.getHours() === shutdownHour && now.getMinutes() >= shutdownMinute && !shutdownRitual.active) {
            useUIStore.getState().setShutdownRitual({ active: true, step: 0 });
            localStorage.setItem(lastPromptKey, getTodayDateString());
            return;
        }
        
        const dayOfWeek = now.getDay();
        if (dayOfWeek === 1) {
            setAssistantMessage({ message: "It's a new week! Let's get organized. What are your main goals?" });
            localStorage.setItem(lastPromptKey, getTodayDateString());
        } else if (dayOfWeek === 5) {
            setAssistantMessage({ message: "It's Friday! A great time to look back at your wins this week in the Grove." });
            localStorage.setItem(lastPromptKey, getTodayDateString());
        }
    }, [shutdownTime, shutdownRitual.active, setAssistantMessage]);

    useEffect(() => {
        if (initialLoadDone) {
            checkAchievements();
            updateStreakAndArchive();
            runAssistant();
        }
    }, [tasks, stats, initialLoadDone, grove, shutdownTime, checkAchievements, updateStreakAndArchive, runAssistant]);

    // Morning Ritual Trigger
    useEffect(() => {
        if (initialLoadDone) {
            const lastRitualKey = 'aura-last-morning-ritual';
            const today = getTodayDateString();
            const last = localStorage.getItem(lastRitualKey);
            if (last !== today) {
                setIsMorningRitualOpen(true);
                localStorage.setItem(lastRitualKey, today);
            }
        }
    }, [initialLoadDone, setIsMorningRitualOpen]);

    // Quick Capture Listener (Electron)
    useEffect(() => {
        if (isElectron()) {
            const cleanup = window.electronAPI.onAddTaskFromCapture((text) => {
                if (text && text.trim()) {
                    addTask(text);
                }
            });
            return cleanup;
        }
    }, [addTask]);

    // Shutdown Ritual Messages Sync
    const tasksCompletedToday = tasks.filter(t => t.completionDate === getTodayDateString()).length;
    useEffect(() => {
        if (shutdownRitual.active) {
            const shutdownRitualMessages = [
                `Let's wind down for the day. You completed ${tasksCompletedToday} tasks today. How do you feel?`,
                "Is there anything left on your mind? Capture any final thoughts for tomorrow.",
                "Your mind is clear. It's time to disconnect. See you tomorrow!"
            ];
            setAssistantMessage({ message: shutdownRitualMessages[shutdownRitual.step] });
        } else if (!shutdownRitual.active && assistantMessage?.message?.startsWith("Let's wind down")) {
            setAssistantMessage(null);
        }
    }, [shutdownRitual, tasksCompletedToday, assistantMessage, setAssistantMessage]);

    // Global Keybindings Listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeEl = document.activeElement;
            const isInputFocused = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';

            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }

            if (e.key === 'Escape') {
                if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
                else if (isSearchOpen) setIsSearchOpen(false);
                else if (isSettingsOpen) setIsSettingsOpen(false);
                else if (detailModal.isOpen) setDetailModal({ isOpen: false, taskId: null });
                else if (focusTaskId) setFocusTaskId(null);
                else if (isMindfulMinuteOpen) setIsMindfulMinuteOpen(false);
                else if (isThemeCreatorOpen) setIsThemeCreatorOpen(false);
            }

            if (isInputFocused) return;
            
            switch(e.key) {
                case 'n': e.preventDefault(); document.querySelector('input[placeholder*="Capture a thought"]')?.focus(); break;
                case 's': e.preventDefault(); setIsSettingsOpen(true); break;
                case '1': setCurrentView('flow'); break;
                case '2': setCurrentView('calendar'); break;
                case '3': setCurrentView('constellations'); break;
                case '4': setCurrentView('grove'); break;
                case '5': setCurrentView('journal'); break;
                case '6': setCurrentView('review'); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCommandPaletteOpen, isSearchOpen, isSettingsOpen, detailModal.isOpen, focusTaskId, isMindfulMinuteOpen, isThemeCreatorOpen, setIsCommandPaletteOpen, setIsSearchOpen, setIsSettingsOpen, setDetailModal, setFocusTaskId, setIsMindfulMinuteOpen, setIsThemeCreatorOpen, setCurrentView]);

    return { initialLoadDone };
}
