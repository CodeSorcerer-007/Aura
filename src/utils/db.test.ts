import { describe, it, expect } from 'vitest';
import { migrateData } from './db';

describe('IndexedDB db helper & migrations', () => {
    it('returns null/undefined intact when data is empty', () => {
        expect(migrateData('aura-tasks', null)).toBeNull();
        expect(migrateData('aura-tasks', undefined)).toBeUndefined();
    });

    it('migrates legacy task objects with default missing fields', () => {
        const legacyTasks = [
            { id: 't1', text: 'Legacy task' }
        ];

        const migrated = migrateData('aura-tasks', legacyTasks);
        expect(migrated).toHaveLength(1);
        expect(migrated[0].priority).toBe(2);
        expect(migrated[0].category).toBe('General');
        expect(migrated[0].subtasks).toEqual([]);
        expect(migrated[0].attachments).toEqual([]);
        expect(migrated[0].isPinned).toBe(false);
    });

    it('passes through non-task data structures unmodified', () => {
        const settings = { theme: 'dark', sound: true };
        expect(migrateData('aura-theme', settings)).toEqual(settings);
    });
});
