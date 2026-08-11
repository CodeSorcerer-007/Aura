import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardMetrics } from './useDashboardMetrics';
import { useTaskStore } from '../store/useTaskStore';
import { useUIStore } from '../store/useUIStore';
import { Task } from '../types';

describe('useDashboardMetrics', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [], customCategories: {} });
        useUIStore.setState({ activeFilter: { type: 'all', value: null } });
    });

    it('calculates tasks completed today and momentum progress', () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const sampleTasks: Task[] = [
            { id: '1', text: 'Task 1', completed: true, completionDate: todayStr, priority: 2, category: 'Work', timeOfDay: 'morning', createdAt: Date.now(), subtasks: [], win: null, deadline: null, recurring: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 1, isArchived: false },
            { id: '2', text: 'Task 2', completed: true, completionDate: todayStr, priority: 3, category: 'Personal', timeOfDay: 'afternoon', createdAt: Date.now(), subtasks: [], win: null, deadline: null, recurring: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 2, isArchived: false },
            { id: '3', text: 'Task 3', completed: false, completionDate: null, priority: 1, category: 'Work', timeOfDay: 'evening', createdAt: Date.now(), subtasks: [], win: null, deadline: null, recurring: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false },
        ];

        useTaskStore.setState({ tasks: sampleTasks });

        const { result } = renderHook(() => useDashboardMetrics());

        expect(result.current.tasksCompletedToday).toBe(2);
        expect(result.current.momentumProgress).toBe(0.4); // 2 / 5
        expect(result.current.dailyStats.focusSessions).toBe(3); // 1 + 2
    });

    it('filters tasks by active category filter', () => {
        const sampleTasks: Task[] = [
            { id: '1', text: 'Task Work', completed: false, completionDate: null, priority: 2, category: 'Work', timeOfDay: 'morning', createdAt: Date.now(), subtasks: [], win: null, deadline: null, recurring: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false },
            { id: '2', text: 'Task Personal', completed: false, completionDate: null, priority: 2, category: 'Personal', timeOfDay: 'afternoon', createdAt: Date.now(), subtasks: [], win: null, deadline: null, recurring: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false },
        ];

        useTaskStore.setState({ tasks: sampleTasks });
        useUIStore.setState({ activeFilter: { type: 'category', value: 'Work' } });

        const { result } = renderHook(() => useDashboardMetrics());

        expect(result.current.filteredTasks).toHaveLength(1);
        expect(result.current.filteredTasks[0].category).toBe('Work');
    });
});
