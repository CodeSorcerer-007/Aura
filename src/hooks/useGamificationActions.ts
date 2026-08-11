import { Task } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { useTaskStore } from '../store/useTaskStore';

export function useGamificationActions() {
    const stats = useSettingsStore(s => s.stats);
    const setStats = useSettingsStore(s => s.setStats);
    const unlockedAchievements = useSettingsStore(s => s.unlockedAchievements);
    const setGrove = useSettingsStore(s => s.setGrove);

    const setIsPlanting = useUIStore(s => s.setIsPlanting);
    const setIsMorningRitualOpen = useUIStore(s => s.setIsMorningRitualOpen);

    const toggleTask = useTaskStore(s => s.toggleTask);
    const setTasks = useTaskStore(s => s.setTasks);

    const handlePlantSeed = () => {
        if (stats.goldenSeeds > 0) {
            setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds - 1 }));
            setIsPlanting(true);
        }
    };

    const finishPlanting = () => {
        const unlockedTrees = ['oak'];
        if (unlockedAchievements.includes('streak_3')) unlockedTrees.push('pine');
        if (unlockedAchievements.includes('focused_finish')) unlockedTrees.push('cherry');
        const randomType = unlockedTrees[Math.floor(Math.random() * unlockedTrees.length)];
        setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: randomType }]);
        setIsPlanting(false);
    };

    const handleFocusComplete = (taskId: string) => {
        toggleTask(taskId);
        setStats(s => ({ ...s, focusedTasksCompleted: s.focusedTasksCompleted + 1 }));
        setTasks((prevTasks: Task[]) => prevTasks.map(t => t.id === taskId ? { ...t, focusSessions: (t.focusSessions || 0) + 1 } : t));
    };

    const handleSetMITs = (taskIds: string[]) => {
        if (taskIds.length > 0) {
            setTasks(prev => prev.map(t => ({ ...t, isPinned: taskIds.includes(t.id) || t.isPinned })));
        }
        setIsMorningRitualOpen(false);
    };

    return {
        handlePlantSeed,
        finishPlanting,
        handleFocusComplete,
        handleSetMITs,
    };
}
