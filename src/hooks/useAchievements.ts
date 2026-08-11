import { useCallback, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { achievementsList } from '../utils/helpers';

/**
 * Monitors task and stats changes and unlocks achievements when
 * their conditions are first met.
 */
export function useAchievements(initialLoadDone: boolean) {
    const tasks = useTaskStore(state => state.tasks);

    const stats = useSettingsStore(state => state.stats);
    const unlockedAchievements = useSettingsStore(state => state.unlockedAchievements);
    const setUnlockedAchievements = useSettingsStore(state => state.setUnlockedAchievements);
    const playSoundEffect = useSettingsStore(state => state.playSoundEffect);

    const setAchievementToast = useUIStore(state => state.setAchievementToast);

    const checkAchievements = useCallback(() => {
        for (const achievement of achievementsList) {
            if (!unlockedAchievements.includes(achievement.id) && achievement.check(tasks, stats)) {
                setUnlockedAchievements(prev => [...prev, achievement.id]);
                setAchievementToast(achievement);
                playSoundEffect('achievement');
                setTimeout(() => setAchievementToast(null), 4000);
            }
        }
    }, [unlockedAchievements, tasks, stats, setUnlockedAchievements, setAchievementToast, playSoundEffect]);

    useEffect(() => {
        if (initialLoadDone) {
            checkAchievements();
        }
    }, [tasks, stats, initialLoadDone, checkAchievements]);
}
