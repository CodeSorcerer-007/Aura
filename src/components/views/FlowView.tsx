import React, { useMemo, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DayDatePanel } from '../layout/DayDatePanel';
import { FilterBar } from '../layout/FilterBar';
import { TaskBubble } from '../layout/TaskBubble';
import { PinIcon, SunIcon, SunsetIcon, MoonIcon, CheckIcon } from '../icons/Icons';
import { defaultCategories } from '../../utils/helpers';
import { Task, CategoryStyle, ActiveFilter } from '../../types';

interface TimeSectionProps {
    title: string;
    icon: React.ReactElement<{ className?: string }>;
    tasks: Task[];
    timeSection: string;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    onFocus: (id: string) => void;
    isCompletedSection?: boolean;
    onReorderGroup: (newOrder: Task[], section: string) => void;
    onToggleSubtask?: (taskId: string, subtaskIndex: number) => void;
    allCategories: Record<string, CategoryStyle>;
    allTasks: Task[];
    onOpenDetail: (id: string) => void;
    onTogglePin: (id: string) => void;
    onArchive: (id: string) => void;
}

export const TimeSection: React.FC<TimeSectionProps> = ({ 
    title, icon, tasks, timeSection, toggleTask, deleteTask, 
    onFocus, isCompletedSection = false, onReorderGroup, 
    onToggleSubtask, allCategories, allTasks, 
    onOpenDetail, onTogglePin, onArchive 
}) => {
    if (tasks.length === 0 && !isCompletedSection) return null;
    
    return ( 
        <motion.section layout className="rounded-2xl p-2 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-[var(--color-text-primary)]/80">
                    {React.cloneElement(icon, { className: "w-7 h-7" })}
                    <span>{title}</span>
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-text-primary)]/10 text-[var(--color-text-primary)]/60 font-medium">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
            </div>
            
            <Reorder.Group 
                axis="y" 
                values={tasks} 
                onReorder={(newOrder) => onReorderGroup(newOrder, timeSection)}
                className="space-y-3"
            >
                <AnimatePresence initial={false}>
                    {tasks.map((task) => {
                        const dependency = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;
                        const isDependencyMet = !dependency || dependency.completed;
                        return (
                            <TaskBubble 
                                key={task.id} 
                                task={task}
                                allCategories={allCategories}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                                onFocus={onFocus}
                                onToggleSubtask={onToggleSubtask}
                                isDependencyMet={isDependencyMet}
                                onOpenDetail={onOpenDetail}
                                onTogglePin={onTogglePin}
                                onArchive={onArchive}
                            />
                        );
                    })}
                </AnimatePresence>
                {tasks.length === 0 && isCompletedSection && (
                    <p className="text-[var(--color-text-secondary)]/80 pl-4 py-2">No tasks completed yet.</p>
                )}
            </Reorder.Group>
        </motion.section> 
    );
};

interface VirtualizedCompletedSectionProps {
    tasks: Task[];
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    onFocus: (id: string) => void;
    onToggleSubtask?: (taskId: string, subtaskIndex: number) => void;
    allCategories: Record<string, CategoryStyle>;
    allTasks: Task[];
    onOpenDetail: (id: string) => void;
    onTogglePin: (id: string) => void;
    onArchive: (id: string) => void;
}

const VirtualizedCompletedSection: React.FC<VirtualizedCompletedSectionProps> = ({ tasks, toggleTask, deleteTask, onFocus, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const ITEM_HEIGHT = 110;

    const rowVirtualizer = useVirtualizer({
        count: tasks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => ITEM_HEIGHT,
        overscan: 5,
    });

    if (tasks.length === 0) return null;

    return (
        <motion.section layout className="rounded-2xl p-2 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-3 text-2xl font-semibold text-[var(--color-text-primary)]/80">
                    <CheckIcon className="w-7 h-7" />
                    <span>Completed</span>
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-text-primary)]/10 text-[var(--color-text-primary)]/60 font-medium">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </span>
            </div>
            <div 
                ref={parentRef}
                className="overflow-auto max-h-[480px] pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                <div
                    style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const task = tasks[virtualRow.index];
                        const dependency = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;
                        const isDependencyMet = !dependency || dependency.completed;
                        return (
                            <div
                                key={task.id}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                    paddingBottom: '12px',
                                }}
                            >
                                <TaskBubble 
                                    task={task}
                                    allCategories={allCategories}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onFocus={onFocus}
                                    onToggleSubtask={onToggleSubtask}
                                    isDependencyMet={isDependencyMet}
                                    onOpenDetail={onOpenDetail}
                                    onTogglePin={onTogglePin}
                                    onArchive={onArchive}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
};

const VIRTUALIZE_THRESHOLD = 30;

interface FlowViewProps {
    tasks: Task[];
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    onFocus: (id: string) => void;
    activeFilter: ActiveFilter;
    setActiveFilter: (filter: ActiveFilter) => void;
    updateTaskOrderAndSection?: (newOrder: Task[], section: string) => void;
    onToggleSubtask?: (taskId: string, subtaskIndex: number) => void;
    allTasks: Task[];
    allCategories: Record<string, CategoryStyle>;
    onOpenDetail: (id: string) => void;
    onTogglePin: (id: string) => void;
    onArchive: (id: string) => void;
}

export const FlowView: React.FC<FlowViewProps> = ({ 
    tasks, toggleTask, deleteTask, onFocus, 
    activeFilter, setActiveFilter, updateTaskOrderAndSection, 
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

    const handleReorderGroup = (newOrder: Task[], section: string) => {
        if (updateTaskOrderAndSection) {
            updateTaskOrderAndSection(newOrder, section);
        }
    };

    const completedSectionProps = { tasks: completedTasks, toggleTask, deleteTask, onFocus, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto">
            <DayDatePanel tasks={tasks} />
            <FilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} categories={categories} allTags={allTags}/>
            <div className="space-y-10 mt-6">
                {pinnedTasks.length > 0 && (
                    <TimeSection 
                        title="Pinned" 
                        icon={<PinIcon />} 
                        tasks={pinnedTasks} 
                        timeSection="pinned"
                        onReorderGroup={handleReorderGroup}
                        toggleTask={toggleTask}
                        deleteTask={deleteTask}
                        onFocus={onFocus}
                        onToggleSubtask={onToggleSubtask}
                        allCategories={allCategories}
                        allTasks={allTasks}
                        onOpenDetail={onOpenDetail}
                        onTogglePin={onTogglePin}
                        onArchive={onArchive}
                    />
                )}
                <TimeSection 
                    title="Morning" 
                    icon={<SunIcon />} 
                    tasks={morningTasks} 
                    timeSection="morning"
                    onReorderGroup={handleReorderGroup}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    onFocus={onFocus}
                    onToggleSubtask={onToggleSubtask}
                    allCategories={allCategories}
                    allTasks={allTasks}
                    onOpenDetail={onOpenDetail}
                    onTogglePin={onTogglePin}
                    onArchive={onArchive}
                />
                <TimeSection 
                    title="Afternoon" 
                    icon={<SunsetIcon />} 
                    tasks={afternoonTasks} 
                    timeSection="afternoon"
                    onReorderGroup={handleReorderGroup}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    onFocus={onFocus}
                    onToggleSubtask={onToggleSubtask}
                    allCategories={allCategories}
                    allTasks={allTasks}
                    onOpenDetail={onOpenDetail}
                    onTogglePin={onTogglePin}
                    onArchive={onArchive}
                />
                <TimeSection 
                    title="Evening" 
                    icon={<MoonIcon />} 
                    tasks={eveningTasks} 
                    timeSection="evening"
                    onReorderGroup={handleReorderGroup}
                    toggleTask={toggleTask}
                    deleteTask={deleteTask}
                    onFocus={onFocus}
                    onToggleSubtask={onToggleSubtask}
                    allCategories={allCategories}
                    allTasks={allTasks}
                    onOpenDetail={onOpenDetail}
                    onTogglePin={onTogglePin}
                    onArchive={onArchive}
                />
                {completedTasks.length > VIRTUALIZE_THRESHOLD
                    ? <VirtualizedCompletedSection {...completedSectionProps} />
                    : completedTasks.length > 0 && (
                        <TimeSection 
                            title="Completed" 
                            icon={<CheckIcon />} 
                            tasks={completedTasks} 
                            timeSection="completed"
                            onReorderGroup={handleReorderGroup}
                            isCompletedSection 
                            toggleTask={toggleTask}
                            deleteTask={deleteTask}
                            onFocus={onFocus}
                            onToggleSubtask={onToggleSubtask}
                            allCategories={allCategories}
                            allTasks={allTasks}
                            onOpenDetail={onOpenDetail}
                            onTogglePin={onTogglePin}
                            onArchive={onArchive}
                        />
                    )
                }
            </div>
        </motion.div>
    );
};
