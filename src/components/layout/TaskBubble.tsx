import React, { useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
    CheckIcon, CalendarIcon, 
    ClockIcon, FileTextIcon, PinIcon, ArchiveIcon, 
    PlayIcon, XIcon, LinkIcon
} from '../icons/Icons';
import { defaultCategories, isOverdue, formatDate } from '../../utils/helpers';
import { Task, CategoryStyle } from '../../types';

const GripIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h.01M8 15h.01M16 9h.01M16 15h.01" />
    </svg>
);

interface TaskBubbleProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onFocus: (id: string) => void;
    onToggleSubtask?: (taskId: string, subtaskIndex: number) => void;
    allCategories: Record<string, CategoryStyle>;
    isDependencyMet?: boolean;
    onOpenDetail: (id: string) => void;
    onTogglePin: (id: string) => void;
    onArchive: (id: string) => void;
}

export const TaskBubble: React.FC<TaskBubbleProps> = React.memo(({ 
    task, onToggle, onDelete, onFocus, 
    allCategories, isDependencyMet = true, 
    onOpenDetail, onTogglePin, onArchive 
}) => {
    const color = allCategories[task.category] || defaultCategories['General'];
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;
    const isLocked = !isDependencyMet;

    const glowStyle = useMemo(() => {
        if (task.completed) return {};
        const glowColor = color.glowColor || '#9ca3af';
        const blurAmount = task.priority * 4;
        const spreadAmount = task.priority * 1.5;
        return {
             boxShadow: `0 0 ${blurAmount}px ${spreadAmount}px ${glowColor}`
        };
    }, [task.completed, task.priority, color.glowColor]);

    return ( 
        <Reorder.Item 
            value={task}
            id={task.id}
            layout 
            initial={{ opacity: 0, y: 15, scale: 0.98 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} 
            whileDrag={{ scale: 1.02, boxShadow: "0px 10px 25px rgba(0,0,0,0.5)", zIndex: 50 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            style={glowStyle}
            className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${color.bg} ${color.border} ${task.completed ? 'opacity-50 brightness-75' : ''} ${isLocked ? 'opacity-60 brightness-90' : ''} ${task.isPinned ? 'border-amber-400/80' : ''}`}
        >
            <div className="flex items-start gap-2">
                 <div className="flex flex-col items-center mt-1 cursor-grab active:cursor-grabbing text-[var(--color-text-primary)]/30 hover:text-[var(--color-text-primary)]/80 transition-colors py-1 px-0.5 rounded" title="Drag to reorder">
                    <GripIcon className="w-5 h-5" />
                </div>
                <motion.button onClick={() => !isLocked && onToggle(task.id)} className={`w-7 h-7 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${task.completed ? 'bg-teal-400 border-teal-400' : 'border-[var(--color-text-primary)]/50'} ${isLocked ? 'cursor-not-allowed' : 'hover:border-[var(--color-text-primary)]'}`} whileTap={isLocked ? {} : { scale: 0.9 }}>{task.completed && <motion.div initial={{scale:0}} animate={{scale:1}}><CheckIcon className="w-5 h-5 text-black" /></motion.div>}</motion.button>
                <div className="flex-grow cursor-pointer" onClick={() => onOpenDetail(task.id)}>
                    <span className={`${task.completed ? 'line-through text-[var(--color-text-primary)]/60' : 'text-[var(--color-text-primary)]/90'}`}>{task.text}</span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {task.tags && task.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-500/50 text-gray-200 px-2 py-0.5 rounded-full">@{tag}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {task.deadline && (<div className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${isOverdue(task.deadline) && !task.completed ? 'text-rose-400' : 'text-[var(--color-text-primary)]/50'}`}><CalendarIcon className="w-3.5 h-3.5" /><span>{formatDate(task.deadline)}{task.recurring && ` (${task.recurring.type})`}</span></div>)}
                        {task.estimatedMinutes && <div className="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-text-primary)]/50" title="Estimated time"><ClockIcon className="w-3.5 h-3.5" /><span>{task.estimatedMinutes >= 60 ? `${Math.floor(task.estimatedMinutes/60)}h${task.estimatedMinutes%60>0?` ${task.estimatedMinutes%60}m`:''}` : `${task.estimatedMinutes}m`}</span></div>}
                        {task.focusSessions ? task.focusSessions > 0 && <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-text-primary)]/50"><span>🎯</span><span>{task.focusSessions}</span></div> : null}
                        {task.attachments && task.attachments.length > 0 && <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-text-primary)]/50"><FileTextIcon className="w-3.5 h-3.5" /><span>{task.attachments.length}</span></div>}
                    </div>
                    {task.dependsOn && <div className="mt-1 flex items-center gap-1 text-xs text-amber-400/80"><LinkIcon className="w-3 h-3"/><span>Depends on another task</span></div>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className={`text-xs px-2.5 py-1 rounded-full font-semibold ${color.bg} ${color.text}`}>{task.category}</div>
                    <div className="flex items-center gap-1">
                        {!task.completed && (
                            <motion.button 
                                onClick={() => onTogglePin(task.id)} 
                                className={`p-1.5 rounded-lg transition-colors ${task.isPinned ? 'text-amber-400' : 'text-[var(--color-text-primary)]/40 hover:text-amber-400 hover:bg-white/5'}`} 
                                whileTap={{ scale: 0.9 }} 
                                title="Pin Task"
                                aria-label={task.isPinned ? "Unpin task" : "Pin task"}
                            >
                                <PinIcon className="w-5 h-5" />
                            </motion.button>
                        )}
                        
                        {task.completed && (
                            <motion.button 
                                onClick={() => onArchive(task.id)} 
                                className="p-1.5 rounded-lg text-[var(--color-text-primary)]/40 hover:text-[var(--color-accent)] hover:bg-white/5 transition-colors" 
                                whileTap={{ scale: 0.9 }} 
                                title="Archive Task"
                                aria-label="Archive task"
                            >
                                <ArchiveIcon className="w-5 h-5" />
                            </motion.button>
                        )}
                        {!task.completed && (
                            <motion.button 
                                onClick={() => onFocus(task.id)} 
                                disabled={isLocked} 
                                className="p-1.5 rounded-lg text-[var(--color-text-primary)]/40 hover:text-teal-400 hover:bg-white/5 transition-colors disabled:opacity-50" 
                                whileTap={{ scale: 0.9 }} 
                                title="Focus on Task"
                                aria-label="Start focus session"
                            >
                                <PlayIcon className="w-5 h-5" />
                            </motion.button>
                        )}
                        <motion.button 
                            onClick={() => onDelete(task.id)} 
                            className="p-1.5 rounded-lg text-[var(--color-text-primary)]/40 hover:text-rose-400 hover:bg-white/5 transition-colors" 
                            whileTap={{ scale: 0.9 }} 
                            title="Delete Task"
                            aria-label="Delete task"
                        >
                            <XIcon className="w-5 h-5"/>
                        </motion.button>
                    </div>
                </div>
            </div>
            {totalSubtasks > 0 && (
                <div className="mt-3 pl-8">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-primary)]/60 mb-1 font-medium">
                        <span>Subtasks</span>
                        <span>{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                    <div className="w-full bg-[var(--color-text-primary)]/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div className="bg-teal-400 h-1.5 rounded-full" initial={{width:0}} animate={{width: `${progress * 100}%`}} transition={{ duration: 0.3 }} />
                    </div>
                </div>
            )}
        </Reorder.Item> 
    );
});
