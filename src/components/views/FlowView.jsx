import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayDatePanel } from '../layout/DayDatePanel';
import { FilterBar } from '../layout/FilterBar';
import { TaskBubble } from '../layout/TaskBubble';
import { PinIcon, SunIcon, SunsetIcon, MoonIcon, CheckIcon } from '../icons/Icons';
import { defaultCategories } from '../../utils/helpers';

export const TimeSection = ({ 
    title, icon, tasks, toggleTask, deleteTask, 
    onFocus, isCompletedSection = false, onReorder, 
    onToggleSubtask, allCategories, allTasks, 
    onOpenDetail, onTogglePin, onArchive 
}) => {
    if (tasks.length === 0 && !isCompletedSection) return null;
    return ( 
        <motion.section layout>
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-[var(--color-text-primary)]/80 mb-4">
                {React.cloneElement(icon, { className: "w-7 h-7" })}
                <span>{title}</span>
            </h2>
            <div className="space-y-3">
                <AnimatePresence>
                    {tasks.map((task) => {
                        const dependency = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;
                        const isDependencyMet = !dependency || dependency.completed;
                        return <TaskBubble key={task.id} {...{task, allCategories, onToggle: toggleTask, onDelete: deleteTask, onFocus, onReorder, onToggleSubtask, isDependencyMet, onOpenDetail, onTogglePin, onArchive}} />
                    })}
                </AnimatePresence>
                {tasks.length === 0 && isCompletedSection && <p className="text-[var(--color-text-secondary)]/80 pl-4">No tasks completed yet.</p>}
            </div>
        </motion.section> 
    );
};

export const FlowView = ({ 
    tasks, toggleTask, deleteTask, onFocus, 
    activeFilter, setActiveFilter, onReorder, 
    onToggleSubtask, allTasks, allCategories, 
    onOpenDetail, onTogglePin, onArchive 
}) => {
    const nonArchivedTasks = tasks.filter(t => !t.isArchived);
    const pinnedTasks = nonArchivedTasks.filter(t => t.isPinned && !t.completed);
    const uncompletedTasks = nonArchivedTasks.filter(t => !t.isPinned && !t.completed);
    const morningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'morning'); 
    const afternoonTasks = uncompletedTasks.filter(t => t.timeOfDay === 'afternoon'); 
    const eveningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'evening'); 
    const completedTasks = nonArchivedTasks.filter(t => t.completed);
    const categories = useMemo(() => [...Object.keys(defaultCategories), ...Object.keys(allCategories).filter(c => !defaultCategories[c])], [allCategories]);
    const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags || []))], [tasks]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto">
            <DayDatePanel />
            <FilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} categories={categories} allTags={allTags}/>
            <div className="space-y-12 mt-6">
                {pinnedTasks.length > 0 && <TimeSection title="Pinned" icon={<PinIcon />} tasks={pinnedTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />}
                <TimeSection title="Morning" icon={<SunIcon />} tasks={morningTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />
                <TimeSection title="Afternoon" icon={<SunsetIcon />} tasks={afternoonTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />
                <TimeSection title="Evening" icon={<MoonIcon />} tasks={eveningTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />
                {completedTasks.length > 0 && <TimeSection title="Completed" icon={<CheckIcon />} tasks={completedTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} isCompletedSection />}
            </div>
        </motion.div>
    );
};
