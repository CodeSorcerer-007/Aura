import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task } from '../../types';

interface DayDatePanelProps {
    tasks?: Task[];
}

export const DayDatePanel: React.FC<DayDatePanelProps> = ({ tasks = [] }) => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    // Calculate planned vs available capacity
    const { totalPlannedMinutes, capacityPercent, overPlanned } = useMemo(() => {
        const pendingTasks = tasks.filter(t => !t.completed && !t.isArchived && t.estimatedMinutes);
        const total = pendingTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
        const WORKDAY_MINUTES = 480;
        return {
            totalPlannedMinutes: total,
            capacityPercent: Math.min((total / WORKDAY_MINUTES) * 100, 100),
            overPlanned: total > WORKDAY_MINUTES,
        };
    }, [tasks]);

    const formatTime = (mins: number) => {
        if (mins < 60) return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const hasEstimates = totalPlannedMinutes > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6 max-w-sm mx-auto"
        >
            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] shadow-lg mb-3">
                <p className="text-xl font-bold text-[var(--color-text-primary)]">{day}</p>
                <p className="text-md text-[var(--color-text-secondary)]">{date}</p>
            </div>

            {hasEstimates && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className={`p-3 rounded-xl border ${overPlanned ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)]'}`}
                >
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                        <span className="text-[var(--color-text-secondary)] font-medium">⏱ Day Capacity</span>
                        <span className={`font-bold ${overPlanned ? 'text-rose-400' : 'text-[var(--color-text-primary)]'}`}>
                            {formatTime(totalPlannedMinutes)} planned
                        </span>
                    </div>
                    <div className="w-full bg-[var(--color-bg)] rounded-full h-2 overflow-hidden">
                        <motion.div
                            className={`h-2 rounded-full ${overPlanned ? 'bg-rose-400' : 'bg-[var(--color-accent)]'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${capacityPercent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                    </div>
                    {overPlanned && (
                        <p className="text-xs text-rose-400/80 mt-1.5 text-right">
                            ⚠️ Over-planned — consider deferring some tasks
                        </p>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};
