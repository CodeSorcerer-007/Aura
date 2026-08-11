import React from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '../icons/Icons';
import { formatDate } from '../../utils/helpers';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export const ArchiveModal = ({ isOpen, onClose, archivedTasks, onRestore, onDelete }) => {
    const trapRef = useFocusTrap(isOpen);
    if(!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4" style={{ WebkitAppRegion: 'no-drag' }}>
            <motion.div ref={trapRef} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Archived Tasks</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {archivedTasks.length > 0 ? archivedTasks.map(task => (
                        <div key={task.id} className="p-3 bg-[var(--color-bg)] rounded-lg flex justify-between items-center">
                            <div>
                                <p className="line-through">{task.text}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">Completed: {formatDate(task.completionDate)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onRestore(task.id)} className="text-emerald-400 hover:text-emerald-600">Restore</button>
                                <button onClick={() => onDelete(task.id)} className="text-rose-400 hover:text-rose-600">Delete</button>
                            </div>
                        </div>
                    )) : <p className="text-sm text-[var(--color-text-secondary)]">Your archive is empty.</p>}
                </div>
            </motion.div>
        </motion.div>
    );
};
