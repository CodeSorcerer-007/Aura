import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, CheckIcon, ZapIcon, StarIcon } from '../icons/Icons';
import { Task, CategoryStyle } from '../../types';

interface CalendarViewProps {
    tasks: Task[];
    toggleTask: (id: string) => void;
    onFocus: (id: string) => void;
    onOpenDetail: (id: string) => void;
    allCategories: Record<string, CategoryStyle>;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, toggleTask, onFocus, onOpenDetail }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'timeline'>('month');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
    const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        tasks.forEach(task => {
            if (task.isArchived) return;
            let dateKey: string | null = null;
            if (task.deadline) {
                dateKey = task.deadline.split('T')[0];
            } else if (task.createdAt) {
                dateKey = new Date(task.createdAt).toISOString().split('T')[0];
            }
            if (dateKey) {
                if (!map[dateKey]) map[dateKey] = [];
                map[dateKey].push(task);
            }
        });
        return map;
    }, [tasks]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const daysGrid = useMemo(() => {
        const grid: Array<{ day: number; dateStr: string } | null> = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            grid.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            grid.push({ day: d, dateStr });
        }
        return grid;
    }, [firstDayOfWeek, daysInMonth, year, month]);

    const selectedTasks = selectedDateStr ? (tasksByDate[selectedDateStr] || []) : [];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.4 }} 
            className="max-w-6xl mx-auto space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-xl">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {monthNames[month]} {year}
                        </h2>
                        <p className="text-xs text-[var(--color-text-secondary)]">Isolated offline calendar view</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleToday}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] text-[var(--color-text-primary)] transition-all"
                    >
                        Today
                    </button>
                    <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-0.5">
                        <button 
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-[var(--color-bg-secondary-hover)] rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            title="Previous Month"
                        >
                            ◄
                        </button>
                        <button 
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-[var(--color-bg-secondary-hover)] rounded-md text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            title="Next Month"
                        >
                            ►
                        </button>
                    </div>
                    <div className="flex bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-0.5 text-xs font-medium">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'month' ? 'bg-[var(--color-accent)] text-black font-semibold' : 'text-[var(--color-text-secondary)]'}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-[var(--color-accent)] text-black font-semibold' : 'text-[var(--color-text-secondary)]'}`}
                        >
                            Timeline
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'month' && (
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-[var(--color-text-secondary)]">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day} className="py-2">{day}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                        {daysGrid.map((item, idx) => {
                            if (!item) {
                                return <div key={`empty-${idx}`} className="h-24 sm:h-28 bg-[var(--color-bg)]/20 rounded-xl opacity-30 pointer-events-none" />;
                            }
                            const { day, dateStr } = item;
                            const dayTasks = tasksByDate[dateStr] || [];
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDateStr;
                            const completedCount = dayTasks.filter(t => t.completed).length;

                            return (
                                <motion.div
                                    key={dateStr}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setSelectedDateStr(dateStr)}
                                    className={`h-24 sm:h-28 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                                        isToday 
                                            ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10' 
                                            : isSelected
                                            ? 'border-[var(--color-accent)] bg-[var(--color-bg-secondary-hover)]'
                                            : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary-hover)]'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                                            isToday ? 'bg-[var(--color-accent)] text-black' : 'text-[var(--color-text-primary)]'
                                        }`}>
                                            {day}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium">
                                                {completedCount}/{dayTasks.length}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 overflow-hidden my-1">
                                        {dayTasks.slice(0, 2).map(t => (
                                            <div 
                                                key={t.id} 
                                                className={`text-[11px] truncate px-1.5 py-0.5 rounded border ${
                                                    t.completed 
                                                        ? 'line-through opacity-50 bg-[var(--color-bg-secondary)] border-transparent' 
                                                        : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] text-[var(--color-text-primary)]'
                                                }`}
                                            >
                                                {t.isPinned && "★ "}{t.text}
                                            </div>
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <p className="text-[10px] text-[var(--color-accent)] font-semibold px-1">
                                                +{dayTasks.length - 2} more
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {viewMode === 'timeline' && (
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold mb-4">Task Timeline & Deadlines</h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {Object.entries(tasksByDate)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([dateKey, dayTasks]) => (
                                <div key={dateKey} className="border-l-2 border-[var(--color-accent)] pl-4 py-1 space-y-2">
                                    <div className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
                                        {dateKey === todayStr ? `Today (${dateKey})` : dateKey}
                                    </div>
                                    <div className="space-y-1.5">
                                        {dayTasks.map(t => (
                                            <div 
                                                key={t.id} 
                                                onClick={() => onOpenDetail(t.id)}
                                                className="flex items-center justify-between bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] p-2.5 rounded-xl cursor-pointer transition-all"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleTask(t.id); }}
                                                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                                                            t.completed ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-black' : 'border-[var(--color-border)]'
                                                        }`}
                                                    >
                                                        {t.completed && <CheckIcon className="w-3 h-3" />}
                                                    </button>
                                                    <span className={`text-sm ${t.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                                                        {t.text}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {t.category && (
                                                        <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                                            #{t.category}
                                                        </span>
                                                    )}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onFocus(t.id); }}
                                                        className="p-1 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-lg"
                                                        title="Start Focus Session"
                                                    >
                                                        <ZapIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedDateStr && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedDateStr(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.9, y: 20 }} 
                            onClick={(e) => e.stopPropagation()} 
                            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-lg shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-xl font-bold">Tasks for {selectedDateStr}</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{selectedTasks.length} task(s) logged</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedDateStr(null)}
                                    className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-lg font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                                {selectedTasks.length > 0 ? (
                                    selectedTasks.map(t => (
                                        <div 
                                            key={t.id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => toggleTask(t.id)}
                                                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                                        t.completed ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-black' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
                                                    }`}
                                                >
                                                    {t.completed && <CheckIcon className="w-3.5 h-3.5" />}
                                                </button>
                                                <span 
                                                    onClick={() => { setSelectedDateStr(null); onOpenDetail(t.id); }}
                                                    className={`text-sm cursor-pointer hover:underline ${t.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}
                                                >
                                                    {t.isPinned && <StarIcon className="w-3.5 h-3.5 inline mr-1 text-amber-400 fill-amber-400" />}
                                                    {t.text}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => { setSelectedDateStr(null); onFocus(t.id); }}
                                                className="px-2.5 py-1 text-xs rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold hover:bg-[var(--color-accent)] hover:text-black transition-all flex items-center gap-1"
                                            >
                                                <ZapIcon className="w-3.5 h-3.5" /> Focus
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-[var(--color-text-secondary)] py-8 text-sm">
                                        No tasks scheduled for this date.
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
