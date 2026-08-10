import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchIcon, XIcon } from '../icons/Icons';
import { TaskBubble } from '../layout/TaskBubble';

export const SearchModal = ({ isOpen, onClose, tasks, toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, onOpenDetail, onTogglePin, onArchive }) => {
    const [searchTerm, setSearchTerm] = useState('');
    if (!isOpen) return null;

    const filteredTasks = tasks.filter(t => 
        !t.isArchived && (
            t.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        )
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Search Tasks</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="relative mb-6">
                    <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder="Search text, notes, @tags..."
                        className="w-full bg-[var(--color-bg)] pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <TaskBubble 
                                key={task.id} 
                                task={task} 
                                onToggle={toggleTask} 
                                onDelete={deleteTask} 
                                onFocus={onFocus} 
                                onReorder={onReorder} 
                                onToggleSubtask={onToggleSubtask} 
                                allCategories={allCategories} 
                                isDependencyMet={true} 
                                onOpenDetail={onOpenDetail} 
                                onTogglePin={onTogglePin} 
                                onArchive={onArchive}
                            />
                        ))
                    ) : (
                        <p className="text-center text-[var(--color-text-secondary)] py-4">No tasks found matching your search.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
