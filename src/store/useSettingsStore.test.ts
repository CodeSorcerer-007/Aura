import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSettingsStore } from './useSettingsStore';

vi.mock('../utils/db', () => ({
    getDBItem: vi.fn().mockResolvedValue(null),
    setDBItem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../utils/electronBridge', () => ({
    getStartupEnabled: vi.fn().mockResolvedValue(false),
    setStartupEnabled: vi.fn(),
    performNativeBackup: vi.fn().mockResolvedValue({ success: true, filepath: '/mock/backup.json' }),
}));

describe('useSettingsStore', () => {
    beforeEach(() => {
        useSettingsStore.setState({
            theme: 'dark',
            customThemes: [],
            soundEffectsEnabled: true,
            autoArchiveEnabled: false,
            notificationsEnabled: false,
            autoStartEnabled: false,
            shutdownTime: '18:00',
            morningTime: '09:00',
            grove: [{ id: 1, growthPoints: 0, maxGrowth: 5, type: 'oak' }],
            stats: { completedCount: 0, streak: 1, lastActiveDate: null, totalFocusMinutes: 0, goldenSeeds: 0, focusedTasksCompleted: 0 },
            unlockedAchievements: [],
            hasLaunched: false,
        });
    });

    it('updates theme correctly', () => {
        useSettingsStore.getState().setTheme('sunset');
        expect(useSettingsStore.getState().theme).toBe('sunset');
    });

    it('increments grove growth for current un-maxed tree', () => {
        useSettingsStore.getState().incrementGroveGrowth();
        const grove = useSettingsStore.getState().grove;
        expect(grove[0].growthPoints).toBe(1);
    });

    it('updates user stats', () => {
        useSettingsStore.getState().setStats((prev) => ({ ...prev, goldenSeeds: prev.goldenSeeds + 2 }));
        expect(useSettingsStore.getState().stats.goldenSeeds).toBe(2);
    });

    it('unlocks achievements without duplicates', () => {
        useSettingsStore.getState().setUnlockedAchievements(['first_task']);
        expect(useSettingsStore.getState().unlockedAchievements).toEqual(['first_task']);
    });

    it('toggles sound effects and settings flags', () => {
        useSettingsStore.getState().setSoundEffectsEnabled(false);
        expect(useSettingsStore.getState().soundEffectsEnabled).toBe(false);

        useSettingsStore.getState().setNotificationsEnabled(true);
        expect(useSettingsStore.getState().notificationsEnabled).toBe(true);

        useSettingsStore.getState().setShutdownTime('20:00');
        expect(useSettingsStore.getState().shutdownTime).toBe('20:00');
    });
});
