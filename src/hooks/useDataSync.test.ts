import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { useDataSync } from './useDataSync';

vi.mock('../utils/db', () => ({
    getDBItem: vi.fn().mockResolvedValue(null),
    setDBItem: vi.fn().mockResolvedValue(undefined),
    setDBItemDebounced: vi.fn(),
    setFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
}));

describe('useDataSync', () => {
    beforeEach(() => {
        useTaskStore.setState({ tasks: [], templates: [], journalEntries: [], customCategories: {}, isLoading: false });
        useSettingsStore.setState({ theme: 'default', soundEffectsEnabled: true });
        useUIStore.setState({ toastMessage: null });
    });

    it('restores imported state data properly', () => {
        const { result } = renderHook(() => useDataSync());

        const sampleBackupData = {
            tasks: [{ id: 't-100', text: 'Restored Task', completed: false, createdAt: Date.now() }],
            theme: 'forest',
            shutdownTime: '21:30',
            soundEffectsEnabled: false
        };

        act(() => {
            result.current.applyImportedData(sampleBackupData);
        });

        expect(useTaskStore.getState().tasks.length).toBe(1);
        expect(useTaskStore.getState().tasks[0].text).toBe('Restored Task');
        expect(useSettingsStore.getState().theme).toBe('forest');
        expect(useSettingsStore.getState().shutdownTime).toBe('21:30');
        expect(useSettingsStore.getState().soundEffectsEnabled).toBe(false);
        expect(useUIStore.getState().toastMessage?.type).toBe('success');
    });
});
