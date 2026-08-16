import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { parseIntelligentDeadline, getTodayDateString, achievementsList } from '../utils/helpers';
import { Task } from '../types';

vi.mock('../utils/db', () => ({
    getDBItem: vi.fn().mockResolvedValue(null),
    setDBItem: vi.fn().mockResolvedValue(undefined),
    setDBItemDebounced: vi.fn(),
    setFile: vi.fn().mockResolvedValue(undefined),
    getFile: vi.fn().mockResolvedValue(null),
    deleteFile: vi.fn().mockResolvedValue(undefined),
}));

describe('User Journey 1: New User First Session & Task Creation', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [], templates: [], journalEntries: [], customCategories: {}, isLoading: false });
        useSettingsStore.setState({
            theme: 'dark',
            stats: { completedCount: 0, streak: 1, lastActiveDate: null, totalFocusMinutes: 0, goldenSeeds: 0, focusedTasksCompleted: 0 },
            unlockedAchievements: [],
            grove: []
        });
        useUIStore.setState({ focusTaskId: null, winModalTaskId: null, toastMessage: null });
    });

    it('creates tasks using natural language syntax with tags, categories, priority, and deadlines', () => {
        const store = useTaskStore.getState();

        // High priority task with category, tag, and deadline
        const task1 = store.addTask('Complete quarterly tax review by friday #Finance ! @audit');
        expect(task1).not.toBeNull();
        expect(task1?.category).toBe('Finance');
        expect(task1?.priority).toBe(2); // ! -> min(1+1, 3) = 2; !! -> 3
        expect(task1?.tags).toContain('audit');
        expect(task1?.deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(task1?.text).toBe('Complete quarterly tax review');

        // Urgent task with !!
        const task2 = store.addTask('Fix production bug #Development !! @urgent');
        expect(task2?.priority).toBe(3);
        expect(task2?.category).toBe('Development');
    });

    it('supports task details: notes, time estimates, subtasks, and dependencies', () => {
        const store = useTaskStore.getState();
        const prerequisite = store.addTask('Deploy backend v2 #Development')!;
        const dependent = store.addTask('Run integration smoke test #Development')!;

        // Add subtasks and notes
        store.saveTaskDetail(dependent.id, {
            notes: 'Test authentication and data export endpoints',
            estimatedMinutes: 45,
            subtasks: [
                { id: 's1', text: 'Check login', completed: false },
                { id: 's2', text: 'Check export JSON', completed: false }
            ]
        });

        // Set dependency
        store.setTaskDependency(dependent.id, prerequisite.id);

        const updatedDependent = useTaskStore.getState().tasks.find(t => t.id === dependent.id);
        expect(updatedDependent?.dependsOn).toBe(prerequisite.id);
        expect(updatedDependent?.notes).toContain('Test authentication');
        expect(updatedDependent?.estimatedMinutes).toBe(45);
        expect(updatedDependent?.subtasks).toHaveLength(2);

        // Toggle subtask
        store.toggleSubtask(dependent.id, 0);
        const subtaskUpdated = useTaskStore.getState().tasks.find(t => t.id === dependent.id);
        expect(subtaskUpdated?.subtasks[0].completed).toBe(true);
        expect(subtaskUpdated?.subtasks[1].completed).toBe(false);
    });
});

describe('User Journey 2: Deep Work Focus Session & Distraction Logging', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [], journalEntries: [] });
        useSettingsStore.setState({
            stats: { completedCount: 0, streak: 1, lastActiveDate: null, totalFocusMinutes: 0, goldenSeeds: 0, focusedTasksCompleted: 0 }
        });
    });

    it('logs distractions during focus session into today\'s journal', () => {
        const store = useTaskStore.getState();
        store.logDistraction('Checked social media notifications');
        store.logDistraction('Thought about dinner plans');

        const entries = useTaskStore.getState().journalEntries;
        const todayStr = getTodayDateString() || new Date().toISOString().split('T')[0];
        const todayEntry = entries.find(e => e.date === todayStr);

        expect(todayEntry).toBeDefined();
        expect(todayEntry?.distractions).toHaveLength(2);
        expect(todayEntry?.distractions?.[0].text).toBe('Checked social media notifications');
    });

    it('tracks focused task completion count', () => {
        const taskStore = useTaskStore.getState();
        const settingsStore = useSettingsStore.getState();

        const task = taskStore.addTask('Design landing page hero')!;
        taskStore.toggleTask(task.id);
        settingsStore.setStats(s => ({
            ...s,
            focusedTasksCompleted: s.focusedTasksCompleted + 1,
            totalFocusMinutes: s.totalFocusMinutes + 25
        }));

        const updatedStats = useSettingsStore.getState().stats;
        expect(updatedStats.focusedTasksCompleted).toBe(1);
        expect(updatedStats.totalFocusMinutes).toBe(25);

        // Check achievement condition
        const deepFocusAch = achievementsList.find(a => a.id === 'focused_finish');
        expect(deepFocusAch?.check(useTaskStore.getState().tasks, updatedStats)).toBe(true);
    });
});

describe('User Journey 3: Gamification Loop & The Grove', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [] });
        useSettingsStore.setState({
            stats: { completedCount: 0, streak: 1, lastActiveDate: null, totalFocusMinutes: 0, goldenSeeds: 0, focusedTasksCompleted: 0 },
            grove: [],
            unlockedAchievements: []
        });
    });

    it('awards a golden seed and records win in journal when completing a high priority task', () => {
        const taskStore = useTaskStore.getState();
        const urgentTask = taskStore.addTask('Close Series A funding round !! #Finance')!;

        // Completing priority 3 task triggers win modal
        taskStore.toggleTask(urgentTask.id);
        expect(useUIStore.getState().winModalTaskId).toBe(urgentTask.id);

        // User saves win reflection
        const winText = "Signed term sheet after 3 months of negotiations!";
        taskStore.setTasks(prev => prev.map(t => t.id === urgentTask.id ? { ...t, win: winText, isGolden: true } : t));
        useSettingsStore.getState().setStats(s => ({ ...s, goldenSeeds: s.goldenSeeds + 1 }));

        expect(useSettingsStore.getState().stats.goldenSeeds).toBe(1);
        const task = useTaskStore.getState().tasks.find(t => t.id === urgentTask.id);
        expect(task?.win).toBe(winText);
        expect(task?.isGolden).toBe(true);

        // Golden Seed achievement should be met
        const goldenSeedAch = achievementsList.find(a => a.id === 'golden_seed');
        expect(goldenSeedAch?.check(useTaskStore.getState().tasks, useSettingsStore.getState().stats)).toBe(true);
    });

    it('spends golden seeds to plant trees in the grove', () => {
        const settings = useSettingsStore.getState();
        settings.setStats(s => ({ ...s, goldenSeeds: 2 }));

        // Plant first seed
        expect(useSettingsStore.getState().stats.goldenSeeds).toBe(2);
        useSettingsStore.getState().setStats(s => ({ ...s, goldenSeeds: s.goldenSeeds - 1 }));
        useSettingsStore.getState().setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: 'oak' }]);

        expect(useSettingsStore.getState().stats.goldenSeeds).toBe(1);
        expect(useSettingsStore.getState().grove).toHaveLength(1);
        expect(useSettingsStore.getState().grove[0].type).toBe('oak');

        // Grow the tree by completing tasks
        useSettingsStore.getState().incrementGroveGrowth();
        expect(useSettingsStore.getState().grove[0].growthPoints).toBe(1);
    });
});

describe('User Journey 4: Templates & Category Constellations', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [], templates: [] });
    });

    it('creates category-scoped templates from Constellations view and applies them', () => {
        const store = useTaskStore.getState();
        store.addTask('Write unit tests #Work');
        store.addTask('Run linter #Work');
        store.addTask('Buy groceries #Personal');

        const workTasks = useTaskStore.getState().tasks.filter(t => t.category === 'Work');
        store.saveTemplate('Work', workTasks);

        const templates = useTaskStore.getState().templates;
        expect(templates).toHaveLength(1);
        expect(templates[0].name).toBe('Work');
        expect(templates[0].tasks).toHaveLength(2);
        expect(templates[0].tasks.every(t => t.category === 'Work')).toBe(true);

        // Apply template
        store.addTask('', 'Work');
        expect(useTaskStore.getState().tasks.length).toBe(5); // 3 original + 2 from template
    });
});
