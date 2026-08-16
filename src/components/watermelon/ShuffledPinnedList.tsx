import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, CategoryStyle } from '../../types';
import { StarIcon, ZapIcon, CheckIcon } from '../icons/Icons';

export interface ShuffledPinnedListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onTogglePin: (id: string) => void;
  onFocusTask: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  allCategories: Record<string, CategoryStyle>;
  className?: string;
}

export const ShuffledPinnedList: React.FC<ShuffledPinnedListProps> = ({
  tasks,
  onToggleTask,
  onTogglePin,
  onFocusTask,
  onOpenDetail,
  allCategories,
  className = '',
}) => {
  const pinnedTasks = tasks.filter(t => t.isPinned && !t.completed && !t.isArchived);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [shuffledOrder, setShuffledOrder] = useState<string[]>([]);
  const [spotlightTaskId, setSpotlightTaskId] = useState<string | null>(null);

  const displayTasks = React.useMemo(() => {
    if (shuffledOrder.length === 0) return pinnedTasks;
    const map = new Map(pinnedTasks.map(t => [t.id, t]));
    const ordered: Task[] = [];
    shuffledOrder.forEach(id => {
      if (map.has(id)) {
        ordered.push(map.get(id)!);
        map.delete(id);
      }
    });
    // Add any newly pinned tasks
    map.forEach(t => ordered.push(t));
    return ordered;
  }, [pinnedTasks, shuffledOrder, shuffleKey]);

  const handleShuffle = () => {
    const ids = [...pinnedTasks.map(t => t.id)];
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledOrder(ids);
    setShuffleKey(prev => prev + 1);
    setSpotlightTaskId(null);
  };

  const handleSpotlightRandom = () => {
    if (pinnedTasks.length === 0) return;
    const randomIdx = Math.floor(Math.random() * pinnedTasks.length);
    const chosen = pinnedTasks[randomIdx];
    setSpotlightTaskId(chosen.id);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header Actions */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <StarIcon className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <span className="text-xs font-bold text-[var(--color-text-primary)]">
            Pinned Priority ({pinnedTasks.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.92, rotate: -15 }}
            onClick={handleShuffle}
            disabled={pinnedTasks.length <= 1}
            title="Shuffle Priority Deck"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors disabled:opacity-40"
          >
            🔀 Shuffle
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSpotlightRandom}
            disabled={pinnedTasks.length === 0}
            title="Pick Random Next Task"
            className="px-2 py-1 rounded-lg bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 text-xs font-semibold text-[var(--color-accent)] transition-colors disabled:opacity-40"
          >
            🎲 Spotlight
          </motion.button>
        </div>
      </div>

      {/* Card List / Deck */}
      <div className="flex-1 overflow-y-auto pt-3 space-y-2 pr-1">
        <AnimatePresence mode="popLayout">
          {displayTasks.map((task, index) => {
            const isSpotlight = task.id === spotlightTaskId;
            const categoryStyle = allCategories[task.category] || allCategories['General'];

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: isSpotlight ? 1.02 : 1,
                  borderColor: isSpotlight ? 'var(--color-accent, #2dd4bf)' : 'rgba(255,255,255,0.08)',
                  backgroundColor: isSpotlight ? 'rgba(45, 212, 191, 0.08)' : 'rgba(255,255,255,0.03)',
                }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                  delay: index * 0.03,
                }}
                className={`group relative p-3 rounded-xl border backdrop-blur-sm transition-all flex flex-col gap-2 ${
                  isSpotlight ? 'shadow-lg shadow-teal-500/10 ring-1 ring-teal-400/40' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    {/* Rank Badge */}
                    <span className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white/70 group-hover:text-white">
                      #{index + 1}
                    </span>

                    {/* Task Title */}
                    <div className="flex-1 min-w-0">
                      <p
                        onClick={() => onOpenDetail?.(task.id)}
                        className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] cursor-pointer truncate"
                      >
                        {task.text}
                      </p>

                      {/* Metadata Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-[var(--color-text-secondary)]">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${categoryStyle?.bg || 'bg-white/10'} ${categoryStyle?.text || 'text-white/80'} ${categoryStyle?.border || 'border-white/10'}`}>
                          {task.category}
                        </span>

                        {task.estimatedMinutes && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[10px]">
                            ⏱️ {task.estimatedMinutes}m
                          </span>
                        )}

                        {task.subtasks && task.subtasks.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                            ☑️ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => onFocusTask(task.id)}
                      title="Start Deep Focus"
                      className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30"
                    >
                      <ZapIcon className="w-3.5 h-3.5" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => onToggleTask(task.id)}
                      title="Complete Task"
                      className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => onTogglePin(task.id)}
                      title="Unpin Task"
                      className="p-1.5 rounded-lg bg-white/5 text-amber-400 hover:bg-white/10"
                    >
                      <StarIcon className="w-3.5 h-3.5 fill-amber-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {pinnedTasks.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-white/10 text-[var(--color-text-secondary)]">
            <StarIcon className="w-6 h-6 text-white/20 mb-2" />
            <p className="text-xs font-semibold text-white/60">No pinned priority tasks</p>
            <p className="text-[11px] text-white/40 mt-0.5">Click star on any task to pin it here</p>
          </div>
        )}
      </div>
    </div>
  );
};
