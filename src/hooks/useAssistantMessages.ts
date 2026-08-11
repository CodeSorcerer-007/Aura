import { useCallback, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import { getTodayDateString } from '../utils/helpers';
import { SHUTDOWN_RITUAL_MESSAGES, SHUTDOWN_RITUAL_STEP_COUNT } from '../utils/ritualMessages';

/**
 * Drives the assistant banner messages:
 * - Weekly motivational prompts (Monday / Friday)
 * - Shutdown ritual sequence triggered at the configured end-of-day time
 * - Keeps the banner text in sync as the ritual advances through its steps
 */
export function useAssistantMessages(initialLoadDone: boolean) {
    const tasks = useTaskStore(state => state.tasks);

    const shutdownTime = useSettingsStore(state => state.shutdownTime);

    const assistantMessage = useUIStore(state => state.assistantMessage);
    const setAssistantMessage = useUIStore(state => state.setAssistantMessage);
    const shutdownRitual = useUIStore(state => state.shutdownRitual);

    // Derives the count here so we don't need to import from the store
    const tasksCompletedToday = tasks.filter(
        t => t.completionDate === getTodayDateString()
    ).length;

    const runAssistant = useCallback(() => {
        const lastPromptKey = 'aura-last-assistant-prompt';
        const lastPromptDate = localStorage.getItem(lastPromptKey);
        if (lastPromptDate === getTodayDateString()) return;

        const now = new Date();
        const [shutdownHour, shutdownMinute] = shutdownTime.split(':').map(Number);
        if (
            now.getHours() === shutdownHour &&
            now.getMinutes() >= shutdownMinute &&
            !shutdownRitual.active
        ) {
            useUIStore.getState().setShutdownRitual({ active: true, step: 0 });
            const todayStr = getTodayDateString();
            if (todayStr) localStorage.setItem(lastPromptKey, todayStr);
            return;
        }

        const dayOfWeek = now.getDay();
        const todayStr = getTodayDateString();
        if (dayOfWeek === 1) {
            setAssistantMessage("It's a new week! Let's get organized. What are your main goals?");
            if (todayStr) localStorage.setItem(lastPromptKey, todayStr);
        } else if (dayOfWeek === 5) {
            setAssistantMessage(
                "It's Friday! A great time to look back at your wins this week in the Grove."
            );
            if (todayStr) localStorage.setItem(lastPromptKey, todayStr);
        }
    }, [shutdownTime, shutdownRitual.active, setAssistantMessage]);

    // Sync banner text to the current shutdown ritual step
    useEffect(() => {
        if (shutdownRitual.active) {
            const builder = SHUTDOWN_RITUAL_MESSAGES[shutdownRitual.step];
            setAssistantMessage(builder ? builder(tasksCompletedToday) : null);
        } else if (!shutdownRitual.active && assistantMessage?.startsWith("Let's wind down")) {
            setAssistantMessage(null);
        }
    }, [shutdownRitual, tasksCompletedToday, assistantMessage, setAssistantMessage]);

    useEffect(() => {
        if (initialLoadDone) {
            runAssistant();
        }
    }, [tasks, initialLoadDone, shutdownTime, runAssistant]);
}
