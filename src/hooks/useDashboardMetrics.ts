import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { motivationalQuotes, defaultCategories } from '../utils/helpers';

export function useDashboardMetrics() {
    const tasks = useTaskStore(s => s.tasks);
    const customCategories = useTaskStore(s => s.customCategories);
    const unlockedAchievements = useSettingsStore(s => s.unlockedAchievements);
    const customThemes = useSettingsStore(s => s.customThemes);
    const activeFilter = useUIStore(s => s.activeFilter);

    const allCategories = useMemo(() => ({ ...defaultCategories, ...customCategories }), [customCategories]);

    const baseThemes = useMemo(() => [
        { id: 'dark', name: 'OLED Dark', bg: 'bg-black', text: 'text-white' },
        { id: 'light', name: 'Clean Light', bg: 'bg-gray-100', text: 'text-black' },
        { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-black', text: 'text-cyan-400' },
        { id: 'crimson', name: 'Crimson', bg: 'bg-black', text: 'text-red-400' },
        { id: 'forest', name: 'Forest', bg: 'bg-[#0b2e13]', text: 'text-[#a3b899]' },
        { id: 'ocean', name: 'Ocean', bg: 'bg-[#001f3f]', text: 'text-[#81d4fa]' },
        { id: 'dune', name: 'Dune', bg: 'bg-[#2a1d0c]', text: 'text-[#e3d5b8]' },
        { id: 'sakura', name: 'Sakura', bg: 'bg-[#fef6f6]', text: 'text-[#5e2d2d]' },
        { id: 'solarized', name: 'Solarized', bg: 'bg-[#002b36]', text: 'text-[#93a1a1]' },
        { id: 'dracula', name: 'Dracula', bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]' },
    ], []);

    const allThemes = useMemo(() => [...baseThemes, ...customThemes], [baseThemes, customThemes]);

    const tasksCompletedToday = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return tasks.filter(t => t.completionDate === todayStr).length;
    }, [tasks]);

    const momentumProgress = Math.min(tasksCompletedToday / 5, 1);

    const filteredTasks = useMemo(() => {
        const nonArchived = tasks.filter(t => !t.isArchived);
        if (activeFilter.type === 'all') return nonArchived;
        if (activeFilter.type === 'priority') return nonArchived.filter(t => t.priority === 3);
        if (activeFilter.type === 'category') return nonArchived.filter(t => t.category === activeFilter.value);
        if (activeFilter.type === 'tag') return nonArchived.filter(t => (t.tags || []).includes(activeFilter.value));
        if (activeFilter.type === 'due_this_week') {
            const today = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
            return nonArchived.filter(t => !t.completed && t.deadline && new Date(t.deadline) <= endOfWeek);
        }
        return nonArchived;
    }, [tasks, activeFilter]);

    const dailyQuote = useMemo(() => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        return motivationalQuotes[dayOfYear % motivationalQuotes.length];
    }, []);

    const dailyStats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const completedToday = tasks.filter(t => t.completionDate === todayStr).length;
        const focusToday = tasks.reduce((acc, task) => task.completionDate === todayStr ? acc + (task.focusSessions || 0) : acc, 0);
        return { completed: completedToday, focusSessions: focusToday, achievements: unlockedAchievements.length };
    }, [tasks, unlockedAchievements]);

    return {
        allCategories,
        baseThemes,
        allThemes,
        tasksCompletedToday,
        momentumProgress,
        filteredTasks,
        dailyQuote,
        dailyStats
    };
}
