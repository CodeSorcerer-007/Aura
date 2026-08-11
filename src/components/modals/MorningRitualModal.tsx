import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../../types';

const MORNING_QUOTES = [
    "The secret of getting ahead is getting started.",
    "Small progress is still progress.",
    "Focus on what matters, let go of what doesn't.",
    "Energy flows where intention goes.",
    "Today is a fresh start. Make it count.",
    "One task at a time. One step at a time.",
    "Clarity before action. Intention before effort.",
];

interface MorningRitualModalProps {
    isOpen: boolean;
    tasks: Task[];
    onClose: () => void;
    onSetMITs: (taskIds: string[]) => void;
}

export const MorningRitualModal: React.FC<MorningRitualModalProps> = ({ isOpen, tasks, onClose, onSetMITs }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const today = new Date();
    const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
    const dayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const quote = MORNING_QUOTES[today.getDate() % MORNING_QUOTES.length];

    const pendingTasks = tasks.filter(t => !t.completed && !t.isArchived);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : prev.length < 3 ? [...prev, id] : prev
        );
    };

    const handleConfirm = () => {
        onSetMITs(selectedIds);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
                className="w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-5xl mb-4"
                    >
                        🌅
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-1">{greeting}</h1>
                    <p className="text-white/50 text-sm mb-4">{dayStr}</p>
                    <p className="text-white/70 italic text-sm max-w-xs mx-auto">"{quote}"</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
                    <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                        <span className="text-amber-400">★</span>
                        Your 3 Most Important Tasks Today
                    </h2>
                    <p className="text-white/50 text-xs mb-4">
                        Pick up to 3 tasks to pin to the top of your day. These are your non-negotiables.
                    </p>

                    {pendingTasks.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-4">No pending tasks yet — add some after you close this!</p>
                    ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            <AnimatePresence>
                                {pendingTasks.slice(0, 20).map((task, i) => {
                                    const isSelected = selectedIds.includes(task.id);
                                    const isDisabled = !isSelected && selectedIds.length >= 3;
                                    return (
                                        <motion.button
                                            key={task.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            onClick={() => !isDisabled && toggleSelect(task.id)}
                                            disabled={isDisabled}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                                                isSelected
                                                    ? 'bg-amber-500/20 border-amber-400/60 text-white'
                                                    : isDisabled
                                                        ? 'bg-white/3 border-white/5 text-white/30 cursor-not-allowed'
                                                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                                isSelected ? 'bg-amber-400 border-amber-400' : 'border-white/30'
                                            }`}>
                                                {isSelected && <span className="text-black text-xs font-bold">{selectedIds.indexOf(task.id) + 1}</span>}
                                            </span>
                                            <span className="text-sm">{task.text}</span>
                                        </motion.button>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    {selectedIds.length > 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-xs text-amber-400/80 mt-3"
                        >
                            {selectedIds.length === 3 ? '✓ Perfect — 3 MITs selected' : `${selectedIds.length}/3 selected`}
                        </motion.p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm transition-all"
                    >
                        Skip for today
                    </button>
                    <motion.button
                        onClick={handleConfirm}
                        whileTap={{ scale: 0.97 }}
                        className="flex-2 flex-grow py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
                    >
                        {selectedIds.length > 0 ? `Pin ${selectedIds.length} Task${selectedIds.length !== 1 ? 's' : ''} & Start Day` : "Start Day →"}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};
