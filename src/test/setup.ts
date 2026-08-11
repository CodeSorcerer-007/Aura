import { vi } from 'vitest';

// Mock Tone.js to prevent AudioContext / AudioParam errors in jsdom environment
vi.mock('tone', () => {
    class MockSynth {
        toDestination() { return this; }
        triggerAttackRelease() { return this; }
    }
    return {
        default: {
            now: () => 0,
            start: vi.fn().mockResolvedValue(undefined),
            Synth: MockSynth,
        },
        now: () => 0,
        start: vi.fn().mockResolvedValue(undefined),
        Synth: MockSynth,
    };
});

// Suppress known non-fatal jsdom warnings during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && (args[0].includes('IndexedDB write failed') || args[0].includes('Audio play blocked'))) {
        return;
    }
    originalConsoleError(...args);
};
