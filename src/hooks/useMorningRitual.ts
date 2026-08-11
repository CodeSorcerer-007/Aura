import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { isElectron } from '../utils/electronBridge';
import { useTaskStore } from '../store/useTaskStore';
import { getTodayDateString } from '../utils/helpers';

/**
 * Triggers the morning ritual modal once per calendar day on app load,
 * and wires up the Electron IPC listener that triggers it from
 * the morning notification click.
 */
export function useMorningRitual(initialLoadDone: boolean) {
    const addTask = useTaskStore(state => state.addTask);
    const setIsMorningRitualOpen = useUIStore(state => state.setIsMorningRitualOpen);

    // Show modal once per day on load
    useEffect(() => {
        if (initialLoadDone) {
            const lastRitualKey = 'aura-last-morning-ritual';
            const today = getTodayDateString();
            const last = localStorage.getItem(lastRitualKey);
            if (today && last !== today) {
                setIsMorningRitualOpen(true);
                localStorage.setItem(lastRitualKey, today);
            }
        }
    }, [initialLoadDone, setIsMorningRitualOpen]);

    // Electron: re-open ritual when the user clicks the morning notification
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            const cleanup = (window as any).electronAPI.onTriggerMorningRitual(() => {
                setIsMorningRitualOpen(true);
            });
            return cleanup;
        }
    }, [setIsMorningRitualOpen]);

    // Electron: listen for quick-capture tasks submitted from the overlay window
    useEffect(() => {
        if (isElectron() && window.electronAPI) {
            const cleanup = window.electronAPI.onAddTaskFromCapture((text) => {
                if (text && text.trim()) {
                    addTask(text);
                }
            });
            return cleanup;
        }
    }, [addTask]);
}
