import { describe, it, expect } from 'vitest';
import { parseIntelligentDeadline } from './helpers';

describe('parseIntelligentDeadline NLP Parser', () => {
    it('parses "by friday" correctly', () => {
        const { deadline, cleanedText } = parseIntelligentDeadline('Finish report by friday');
        expect(cleanedText).toBe('Finish report');
        expect(deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('parses "next month" correctly', () => {
        const { deadline, cleanedText } = parseIntelligentDeadline('Pay bills next month');
        expect(cleanedText).toBe('Pay bills');
        expect(deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('parses "end of week" correctly', () => {
        const { deadline, cleanedText } = parseIntelligentDeadline('Submit project end of week');
        expect(cleanedText).toBe('Submit project');
        expect(deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('parses "end of month" correctly', () => {
        const { deadline, cleanedText } = parseIntelligentDeadline('Review goals end of month');
        expect(cleanedText).toBe('Review goals');
        expect(deadline).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('parses "Q3" quarter deadlines', () => {
        const { deadline, cleanedText } = parseIntelligentDeadline('Launch campaign Q3');
        expect(cleanedText).toBe('Launch campaign');
        expect(deadline).toMatch(/^\d{4}-09-30$/);
    });

    it('parses recurring daily pattern', () => {
        const { recurring, cleanedText } = parseIntelligentDeadline('Workout every day');
        expect(cleanedText).toBe('Workout');
        expect(recurring).toEqual({ type: 'daily' });
    });

    it('parses recurring weekly pattern', () => {
        const { recurring, cleanedText } = parseIntelligentDeadline('Team sync every week');
        expect(cleanedText).toBe('Team sync');
        expect(recurring).toEqual({ type: 'weekly' });
    });
});
