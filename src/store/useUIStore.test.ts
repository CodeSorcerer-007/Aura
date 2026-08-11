import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './useUIStore';

describe('useUIStore', () => {
    beforeEach(() => {
        useUIStore.setState({
            currentView: 'flow',
            activeFilter: { type: 'all', value: null },
            toastMessage: null,
            achievementToast: null,
            assistantMessage: null,
            focusTaskId: null,
            winModalTaskId: null,
            isSettingsOpen: false,
            isSearchOpen: false,
            detailModal: { isOpen: false, taskId: null },
            shutdownRitual: { active: false, step: 0 },
        });
    });

    it('switches current view', () => {
        useUIStore.getState().setCurrentView('grove');
        expect(useUIStore.getState().currentView).toBe('grove');
    });

    it('updates active filter', () => {
        useUIStore.getState().setActiveFilter({ type: 'category', value: 'Work' });
        expect(useUIStore.getState().activeFilter).toEqual({ type: 'category', value: 'Work' });
    });

    it('manages modal visibility states', () => {
        useUIStore.getState().setIsSettingsOpen(true);
        expect(useUIStore.getState().isSettingsOpen).toBe(true);

        useUIStore.getState().setDetailModal({ isOpen: true, taskId: 'task-123' });
        expect(useUIStore.getState().detailModal).toEqual({ isOpen: true, taskId: 'task-123' });
    });

    it('handles shutdown ritual state progression', () => {
        useUIStore.getState().setShutdownRitual(true);
        expect(useUIStore.getState().shutdownRitual).toEqual({ active: true, step: 1 });

        useUIStore.getState().setShutdownRitual(prev => ({ ...prev, step: prev.step + 1 }));
        expect(useUIStore.getState().shutdownRitual.step).toBe(2);
    });
});
