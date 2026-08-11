import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from './useTaskStore';

vi.mock('../utils/db', () => ({
    getDBItem: vi.fn().mockResolvedValue(null),
    setDBItem: vi.fn().mockResolvedValue(undefined),
    setDBItemDebounced: vi.fn(),
    setFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
}));

describe('useTaskStore', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [], templates: [], journalEntries: [], customCategories: {}, isLoading: false });
    });

    it('adds a new task with natural language parsing', () => {
        const store = useTaskStore.getState();
        const task = store.addTask('Buy groceries #Health !! @routine');

        expect(task).not.toBeNull();
        expect(task?.category).toBe('Health');
        expect(task?.priority).toBe(3); // !! -> length 2 + 1 = 3
        expect(task?.tags).toContain('routine');
        expect(useTaskStore.getState().tasks.length).toBe(1);
    });

    it('toggles task completion status', () => {
        const store = useTaskStore.getState();
        const task = store.addTask('Read book');
        if (!task) return;

        expect(task.completed).toBe(false);
        store.toggleTask(task.id);

        const updated = useTaskStore.getState().tasks.find(t => t.id === task.id);
        expect(updated?.completed).toBe(true);
    });

    it('deletes a task by id', () => {
        const store = useTaskStore.getState();
        const task = store.addTask('Temporary task');
        if (!task) return;

        expect(useTaskStore.getState().tasks.length).toBe(1);
        store.deleteTask(task.id);
        expect(useTaskStore.getState().tasks.length).toBe(0);
    });

    it('toggles task pin status', () => {
        const store = useTaskStore.getState();
        const task = store.addTask('Important task');
        if (!task) return;

        expect(task.isPinned).toBe(false);
        store.togglePin(task.id);
        expect(useTaskStore.getState().tasks[0].isPinned).toBe(true);
    });

    it('toggles subtask completion', () => {
        const store = useTaskStore.getState();
        const task = store.addTask('Complex task');
        if (!task) return;

        store.saveTaskDetail(task.id, {
            subtasks: [
                { id: 's1', text: 'Step 1', completed: false },
                { id: 's2', text: 'Step 2', completed: false }
            ]
        });

        store.toggleSubtask(task.id, 0);
        const updated = useTaskStore.getState().tasks.find(t => t.id === task.id);
        expect(updated?.subtasks[0].completed).toBe(true);
        expect(updated?.subtasks[1].completed).toBe(false);
    });

    it('saves task templates and applies them', () => {
        const store = useTaskStore.getState();
        store.addTask('Sprint item 1 #Work');
        store.addTask('Sprint item 2 #Work');

        store.saveTemplate('Sprint Setup');
        expect(useTaskStore.getState().templates.length).toBe(1);
        expect(useTaskStore.getState().templates[0].name).toBe('Sprint Setup');

        // Apply template
        store.addTask('', 'Sprint Setup');
        // Initial 2 tasks + 2 from template = 4 tasks total
        expect(useTaskStore.getState().tasks.length).toBe(4);
    });

    it('handles recurring tasks by advancing deadline and keeping a completed record', () => {
        const store = useTaskStore.getState();
        const task = store.addTask('Daily exercise every day');
        if (!task) return;

        expect(task.recurring?.type).toBe('daily');
        store.toggleTask(task.id);

        const tasks = useTaskStore.getState().tasks;
        expect(tasks.length).toBe(2); // original updated for tomorrow + 1 completed copy
        const completedInstance = tasks.find(t => t.completed);
        expect(completedInstance).toBeDefined();
    });
});
