/**
 * Shared ritual message strings.
 * Centralised here to avoid the same array being defined in both
 * useAppLogic.ts and App.tsx, which would cause them to drift.
 */

export const SHUTDOWN_RITUAL_MESSAGES = [
    (tasksCompletedToday: number) =>
        `Let's wind down for the day. You completed ${tasksCompletedToday} tasks today. How do you feel?`,
    () => "Is there anything left on your mind? Capture any final thoughts for tomorrow.",
    () => "Your mind is clear. It's time to disconnect. See you tomorrow!",
] as const;

/** Total number of steps in the shutdown ritual. */
export const SHUTDOWN_RITUAL_STEP_COUNT = SHUTDOWN_RITUAL_MESSAGES.length;
