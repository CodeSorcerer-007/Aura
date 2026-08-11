import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getTodayDateString, demoTasks } from '../utils/helpers';
import { isElectron } from '../utils/electronBridge';

import { useStreakAndArchive } from './useStreakAndArchive';
import { useAchievements } from './useAchievements';
import { useAssistantMessages } from './useAssistantMessages';
import { useMorningRitual } from './useMorningRitual';
import { useGlobalKeybindings } from './useGlobalKeybindings';

/**
 * Top-level headless orchestrator for the app.
 * This hook composes focused sub-hooks instead of doing everything itself,
 * keeping each concern isolated and independently testable.
 */
export function useAppLogic() {
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const loadInitialData = useTaskStore(state => state.loadInitialData);
    const setTasks = useTaskStore(state => state.setTasks);

    const loadSettings = useSettingsStore(state => state.loadSettings);
    const hasLaunched = useSettingsStore(state => state.hasLaunched);
    const setHasLaunched = useSettingsStore(state => state.setHasLaunched);
    const tasks = useTaskStore(state => state.tasks);
    const templates = useTaskStore(state => state.templates);
    const journalEntries = useTaskStore(state => state.journalEntries);
    const customCategories = useTaskStore(state => state.customCategories);

    const stats = useSettingsStore(state => state.stats);
    const unlockedAchievements = useSettingsStore(state => state.unlockedAchievements);
    const theme = useSettingsStore(state => state.theme);
    const customThemes = useSettingsStore(state => state.customThemes);
    const grove = useSettingsStore(state => state.grove);
    const shutdownTime = useSettingsStore(state => state.shutdownTime);
    const soundEffectsEnabled = useSettingsStore(state => state.soundEffectsEnabled);
    const autoArchiveEnabled = useSettingsStore(state => state.autoArchiveEnabled);
    const notificationsEnabled = useSettingsStore(state => state.notificationsEnabled);
    const performAutoBackup = useSettingsStore(state => state.performAutoBackup);

    // ── Initial Load ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!initialLoadDone) {
            Promise.all([loadInitialData(), loadSettings()]).then(() => {
                setInitialLoadDone(true);
            });
        }
    }, [initialLoadDone, loadInitialData, loadSettings]);

    // ── First Launch Demo Tasks ───────────────────────────────────────────────
    useEffect(() => {
        if (initialLoadDone && !hasLaunched) {
            setTasks(demoTasks);
            setHasLaunched(true);
        }
    }, [initialLoadDone, hasLaunched, setTasks, setHasLaunched]);

    // ── Silent Auto Backup (Electron only) ───────────────────────────────────
    useEffect(() => {
        if (initialLoadDone && isElectron()) {
            performAutoBackup({
                tasks, templates, stats, unlockedAchievements, theme,
                grove, customCategories, journalEntries, customThemes,
                shutdownTime, soundEffectsEnabled, autoArchiveEnabled,
                notificationsEnabled,
            });
        }
    }, [
        tasks, initialLoadDone, performAutoBackup, templates, stats,
        unlockedAchievements, theme, grove, customCategories, journalEntries,
        customThemes, shutdownTime, soundEffectsEnabled, autoArchiveEnabled,
        notificationsEnabled,
    ]);

    // ── Battery Saver: pause heavy animations when window loses focus ─────────
    useEffect(() => {
        const handleBlur  = () => document.body.classList.add('paused-animations');
        const handleFocus = () => document.body.classList.remove('paused-animations');
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // ── Composed focused sub-hooks ────────────────────────────────────────────
    useStreakAndArchive(initialLoadDone);
    useAchievements(initialLoadDone);
    useAssistantMessages(initialLoadDone);
    useMorningRitual(initialLoadDone);
    useGlobalKeybindings();

    return { initialLoadDone };
}
