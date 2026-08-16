import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { isElectron, performNativeBackup, performNativeRestore } from '../utils/electronBridge';

export function useDataSync() {
    const tasks = useTaskStore(s => s.tasks);
    const templates = useTaskStore(s => s.templates);
    const journalEntries = useTaskStore(s => s.journalEntries);
    const customCategories = useTaskStore(s => s.customCategories);
    const setTasks = useTaskStore(s => s.setTasks);
    const setJournalEntries = useTaskStore(s => s.setJournalEntries);

    const theme = useSettingsStore(s => s.theme);
    const setTheme = useSettingsStore(s => s.setTheme);
    const grove = useSettingsStore(s => s.grove);
    const setGrove = useSettingsStore(s => s.setGrove);
    const stats = useSettingsStore(s => s.stats);
    const setStats = useSettingsStore(s => s.setStats);
    const unlockedAchievements = useSettingsStore(s => s.unlockedAchievements);
    const customThemes = useSettingsStore(s => s.customThemes);

    const setToastMessage = useUIStore(s => s.setToastMessage);

    const applyImportedData = (data: any) => {
        if (data.tasks) setTasks(data.tasks);
        if (data.templates) useTaskStore.getState().setTemplates(data.templates);
        if (data.stats) setStats(data.stats);
        if (data.unlockedAchievements) useSettingsStore.getState().setUnlockedAchievements(data.unlockedAchievements);
        if (data.theme) setTheme(data.theme);
        if (data.grove) setGrove(data.grove);
        if (data.customCategories) useTaskStore.getState().setCustomCategories(data.customCategories);
        if (data.journalEntries) setJournalEntries(data.journalEntries);
        if (data.customThemes) useSettingsStore.getState().setCustomThemes(data.customThemes);
        if (data.shutdownTime) useSettingsStore.getState().setShutdownTime(data.shutdownTime);
        if (data.morningTime) useSettingsStore.getState().setMorningTime(data.morningTime);
        if (data.soundEffectsEnabled !== undefined) useSettingsStore.getState().setSoundEffectsEnabled(data.soundEffectsEnabled);
        if (data.autoArchiveEnabled !== undefined) useSettingsStore.getState().setAutoArchiveEnabled(data.autoArchiveEnabled);
        if (data.notificationsEnabled !== undefined) useSettingsStore.getState().setNotificationsEnabled(data.notificationsEnabled);
        if (data.autoStartEnabled !== undefined) useSettingsStore.getState().setAutoStartEnabled(data.autoStartEnabled);
        setToastMessage({ type: 'success', text: 'Data restored successfully!' });
    };

    const handleExport = async () => {
        const data = {
            tasks,
            templates,
            stats,
            unlockedAchievements,
            theme,
            grove,
            customCategories,
            journalEntries,
            customThemes,
            shutdownTime: useSettingsStore.getState().shutdownTime,
            morningTime: useSettingsStore.getState().morningTime,
            soundEffectsEnabled: useSettingsStore.getState().soundEffectsEnabled,
            autoArchiveEnabled: useSettingsStore.getState().autoArchiveEnabled,
            notificationsEnabled: useSettingsStore.getState().notificationsEnabled,
            autoStartEnabled: useSettingsStore.getState().autoStartEnabled
        };
        if (isElectron()) {
            const res = await performNativeBackup(data);
            if (res && res.success) {
                setToastMessage({ type: 'success', text: `Backup saved to ${res.filepath}` });
            } else {
                setToastMessage({ type: 'error', text: 'Failed to create backup.' });
            }
            return;
        }

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `aura-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        setToastMessage({ type: 'success', text: 'Data exported successfully!' });
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement> | null) => {
        if (isElectron()) {
            const result = await performNativeRestore();
            if (result && !result.canceled) {
                const dataToApply = result.data || result;
                if (dataToApply && typeof dataToApply === 'object' && (dataToApply.tasks || dataToApply.stats || dataToApply.theme)) {
                    applyImportedData(dataToApply);
                }
            }
            return;
        }

        // Web fallback
        const file = e?.target?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                applyImportedData(data);
            } catch (error) {
                console.error("Error parsing import file:", error);
                setToastMessage({ type: 'error', text: 'Failed to import data. Invalid file format.' });
            } finally {
                if (e?.target) e.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return {
        handleExport,
        handleImport,
        applyImportedData
    };
}
