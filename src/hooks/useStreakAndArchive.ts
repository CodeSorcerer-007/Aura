import { useCallback, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { getTodayDateString, getLocalString } from '../utils/helpers';
import { Task } from '../types';

/**
 * Handles daily streak tracking and auto-archiving completed tasks
 * from the previous day when the date rolls over.
 */
export function useStreakAndArchive(initialLoadDone: boolean) {
    const tasks = useTaskStore(state => state.tasks);
    const setTasks = useTaskStore(state => state.setTasks);

    const stats = useSettingsStore(state => state.stats);
    const setStats = useSettingsStore(state => state.setStats);
    const autoArchiveEnabled = useSettingsStore(state => state.autoArchiveEnabled);

    const updateStreakAndArchive = useCallback(() => {
        const today = getTodayDateString();
        const lastActive = stats.lastActiveDate;
        const tasksCompletedToday = tasks.some(t => t.completionDate === today);

        if (lastActive !== today) {
            if (autoArchiveEnabled) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalString(yesterday);
                setTasks((currentTasks: Task[]) =>
                    currentTasks.map(t =>
                        t.completionDate === yesterdayStr ? { ...t, isArchived: true } : t
                    )
                );
            }

            if (tasksCompletedToday && today) {
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

    useEffect(() => {
        if (initialLoadDone) {
            updateStreakAndArchive();
        }
    }, [tasks, stats, initialLoadDone, updateStreakAndArchive]);
}
