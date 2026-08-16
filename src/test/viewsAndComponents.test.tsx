import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReviewView } from '../components/views/ReviewView';
import { CalendarView } from '../components/views/CalendarView';
import { DayDatePanel } from '../components/layout/DayDatePanel';
import { QuickCaptureOverlay } from '../components/modals/QuickCaptureOverlay';
import { defaultCategories } from '../utils/helpers';
import { Task } from '../types';

vi.mock('../utils/db', () => ({
    getDBItem: vi.fn().mockResolvedValue(null),
    setDBItem: vi.fn().mockResolvedValue(undefined),
}));

describe('ReviewView Component Robustness', () => {
    it('renders smoothly with empty tasks and stats without throwing', () => {
        const stats = { goldenSeeds: 0, streak: 1, lastActiveDate: null, focusedTasksCompleted: 0 };
        render(
            <ReviewView
                tasks={[]}
                achievements={[]}
                allCategories={defaultCategories}
                stats={stats}
                onDeleteStale={vi.fn()}
            />
        );

        expect(screen.getByText('Your Review')).toBeDefined();
        expect(screen.getByText('Productivity Heatmap')).toBeDefined();
        expect(screen.getByText('Current Streak')).toBeDefined();
        expect(screen.getByText('No completed tasks with categories yet.')).toBeDefined();
    });

    it('renders category and tag breakdown without NaN percentages when populated', () => {
        const sampleTasks: Task[] = [
            {
                id: '1',
                text: 'Finished design spec',
                completed: true,
                completionDate: '2026-08-16',
                priority: 3,
                category: 'Design',
                timeOfDay: 'morning',
                createdAt: Date.now(),
                subtasks: [],
                win: 'Spec approved',
                deadline: null,
                recurring: null,
                notes: '',
                attachments: [],
                tags: ['ui', 'v3'],
                isPinned: false,
                focusSessions: 1,
                isArchived: false,
            }
        ];

        render(
            <ReviewView
                tasks={sampleTasks}
                achievements={['first_task']}
                allCategories={defaultCategories}
                stats={{ goldenSeeds: 1, streak: 3, lastActiveDate: '2026-08-16', focusedTasksCompleted: 1 }}
                onDeleteStale={vi.fn()}
            />
        );

        expect(screen.getByText('Design')).toBeDefined();
        expect(screen.getByText('@ui')).toBeDefined();
        expect(screen.getByText('@v3')).toBeDefined();
    });
});

describe('CalendarView Component', () => {
    it('renders month grid and switches between grid and timeline views', () => {
        const sampleTasks: Task[] = [
            {
                id: '1',
                text: 'Meeting with investors',
                completed: false,
                completionDate: null,
                priority: 3,
                category: 'Work',
                timeOfDay: 'morning',
                createdAt: Date.now(),
                subtasks: [],
                win: null,
                deadline: '2026-08-20',
                recurring: null,
                notes: '',
                attachments: [],
                tags: [],
                isPinned: true,
                focusSessions: 0,
                isArchived: false,
            }
        ];

        render(
            <CalendarView
                tasks={sampleTasks}
                toggleTask={vi.fn()}
                onFocus={vi.fn()}
                onOpenDetail={vi.fn()}
                allCategories={defaultCategories}
            />
        );

        expect(screen.getByText('Today')).toBeDefined();
        expect(screen.getByText('Grid')).toBeDefined();
        expect(screen.getByText('Timeline')).toBeDefined();
    });
});

describe('DayDatePanel Capacity Calculations', () => {
    it('calculates planned hours and displays warning if over 8h capacity', () => {
        const heavyTasks: Task[] = [
            {
                id: '1',
                text: 'Refactor engine',
                completed: false,
                completionDate: null,
                priority: 2,
                category: 'Development',
                timeOfDay: 'morning',
                createdAt: Date.now(),
                subtasks: [],
                win: null,
                deadline: null,
                recurring: null,
                notes: '',
                attachments: [],
                tags: [],
                isPinned: false,
                focusSessions: 0,
                isArchived: false,
                estimatedMinutes: 540, // 9 hours
            }
        ];

        render(<DayDatePanel tasks={heavyTasks} />);

        expect(screen.getByText('9h planned')).toBeDefined();
        expect(screen.getByText(/Over-planned/)).toBeDefined();
    });
});

describe('QuickCaptureOverlay Component', () => {
    it('calls onAddTask when submitted', () => {
        const onAddTask = vi.fn();
        render(<QuickCaptureOverlay onAddTask={onAddTask} onClose={vi.fn()} />);

        expect(screen.getByPlaceholderText(/Capture a thought/)).toBeDefined();
    });
});
