import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Task, CategoryStyle } from '../../types';
import { CheckIcon, ZapIcon, StarIcon, ArchiveIcon } from '../icons/Icons';

export interface CardSwipeDeckProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onArchive: (id: string) => void;
  onFocus: (id: string) => void;
  onTogglePin: (id: string) => void;
  allCategories: Record<string, CategoryStyle>;
  className?: string;
}

export const CardSwipeDeck: React.FC<CardSwipeDeckProps> = ({
  tasks,
  onComplete,
  onArchive,
  onFocus,
  onTogglePin,
  allCategories,
  className = '',
}) => {
  const activeTasks = tasks.filter(t => !t.completed && !t.isArchived);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep index in bounds
  const currentTask = activeTasks[currentIndex] || null;
  const nextTask = activeTasks[currentIndex + 1] || null;
  const thirdTask = activeTasks[currentIndex + 2] || null;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);

  // Directional Glow Indicators
  const completeOpacity = useTransform(x, [20, 120], [0, 1]);
  const archiveOpacity = useTransform(x, [-20, -120], [0, 1]);
  const focusOpacity = useTransform(y, [-20, -100], [0, 1]);
  const pinOpacity = useTransform(y, [20, 100], [0, 1]);

  const handleSwipe = (direction: 'right' | 'left' | 'up' | 'down') => {
    if (!currentTask) return;
    const id = currentTask.id;

    if (direction === 'right') {
      onComplete(id);
    } else if (direction === 'left') {
      onArchive(id);
    } else if (direction === 'up') {
      onFocus(id);
    } else if (direction === 'down') {
      onTogglePin(id);
    }

    x.set(0);
    y.set(0);
  };

  const handleDragEnd = (_: any, info: { offset: { x: number; y: number } }) => {
    const thresholdX = 100;
    const thresholdY = 80;

    if (info.offset.x > thresholdX) {
      handleSwipe('right');
    } else if (info.offset.x < -thresholdX) {
      handleSwipe('left');
    } else if (info.offset.y < -thresholdY) {
      handleSwipe('up');
    } else if (info.offset.y > thresholdY) {
      handleSwipe('down');
    } else {
      x.set(0);
      y.set(0);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowRight') handleSwipe('right');
      else if (e.key === 'ArrowLeft') handleSwipe('left');
      else if (e.key === 'ArrowUp') handleSwipe('up');
      else if (e.key === 'ArrowDown') handleSwipe('down');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentTask]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Deck Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-text-primary)]">🎴 Swipe Triage</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/70">
            {activeTasks.length} in deck
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono">
          <span className="hidden sm:inline">➡️ Done</span>
          <span className="hidden sm:inline">⬅️ Defer</span>
          <span className="hidden sm:inline">⬆️ Focus</span>
        </div>
      </div>

      {/* Card Arena */}
      <div className="relative flex-1 flex items-center justify-center my-3 min-h-[190px]">
        {currentTask ? (
          <div className="relative w-full h-full max-w-sm flex items-center justify-center">
            {/* Background 3rd Card */}
            {thirdTask && (
              <div
                className="absolute inset-x-4 bottom-0 top-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-md pointer-events-none scale-90 translate-y-3 opacity-30"
              />
            )}

            {/* Background 2nd Card */}
            {nextTask && (
              <div
                className="absolute inset-x-2 bottom-1 top-2 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg pointer-events-none scale-95 translate-y-1.5 opacity-60"
              />
            )}

            {/* Top Interactive Card */}
            <motion.div
              key={currentTask.id}
              style={{ x, y, rotate }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              whileTap={{ cursor: 'grabbing' }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1e293b]/90 to-[#0f172a]/90 border border-white/20 p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between cursor-grab select-none overflow-hidden"
            >
              {/* Direction Badges Glow */}
              <motion.div
                style={{ opacity: completeOpacity }}
                className="absolute inset-0 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl pointer-events-none flex items-center justify-center font-bold text-emerald-300 text-lg uppercase tracking-wider gap-2"
              >
                <CheckIcon className="w-8 h-8" /> Complete
              </motion.div>

              <motion.div
                style={{ opacity: archiveOpacity }}
                className="absolute inset-0 bg-rose-500/20 border-2 border-rose-400 rounded-2xl pointer-events-none flex items-center justify-center font-bold text-rose-300 text-lg uppercase tracking-wider gap-2"
              >
                <ArchiveIcon className="w-8 h-8" /> Defer / Archive
              </motion.div>

              <motion.div
                style={{ opacity: focusOpacity }}
                className="absolute inset-0 bg-teal-500/20 border-2 border-teal-400 rounded-2xl pointer-events-none flex items-center justify-center font-bold text-teal-300 text-lg uppercase tracking-wider gap-2"
              >
                <ZapIcon className="w-8 h-8" /> Deep Focus
              </motion.div>

              <motion.div
                style={{ opacity: pinOpacity }}
                className="absolute inset-0 bg-amber-500/20 border-2 border-amber-400 rounded-2xl pointer-events-none flex items-center justify-center font-bold text-amber-300 text-lg uppercase tracking-wider gap-2"
              >
                <StarIcon className="w-8 h-8" /> Pin Priority
              </motion.div>

              {/* Card Content */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white/10 text-white/90 border-white/10">
                    {currentTask.category || 'General'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {currentTask.priority === 3 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        🔥 High Priority
                      </span>
                    )}
                    {currentTask.isPinned && (
                      <StarIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                </div>

                <h3 className="text-base font-semibold text-white leading-snug line-clamp-3">
                  {currentTask.text}
                </h3>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <div className="flex items-center gap-2">
                  {currentTask.deadline && <span>📅 {currentTask.deadline}</span>}
                  {currentTask.estimatedMinutes && <span>⏱️ {currentTask.estimatedMinutes}m</span>}
                </div>

                <span className="text-[10px] font-mono text-white/40">Drag or swipe card</span>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-dashed border-white/10 text-[var(--color-text-secondary)]">
            <CheckIcon className="w-8 h-8 text-teal-400 mb-2" />
            <p className="text-sm font-semibold text-white">Deck Cleared!</p>
            <p className="text-xs text-white/50 mt-0.5">All active tasks triaged. Take a mindful breath.</p>
          </div>
        )}
      </div>

      {/* Manual Action Buttons Bar */}
      {currentTask && (
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            onClick={() => handleSwipe('left')}
            className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 text-xs font-semibold transition-colors border border-white/5"
            title="Defer / Archive (Left Arrow)"
          >
            <ArchiveIcon className="w-3.5 h-3.5" /> Defer
          </button>
          <button
            onClick={() => handleSwipe('down')}
            className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/70 hover:text-amber-300 text-xs font-semibold transition-colors border border-white/5"
            title="Pin / Unpin (Down Arrow)"
          >
            <StarIcon className="w-3.5 h-3.5" /> Pin
          </button>
          <button
            onClick={() => handleSwipe('up')}
            className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/5 hover:bg-teal-500/20 text-white/70 hover:text-teal-300 text-xs font-semibold transition-colors border border-white/5"
            title="Deep Focus (Up Arrow)"
          >
            <ZapIcon className="w-3.5 h-3.5" /> Focus
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors border border-emerald-500/30"
            title="Complete (Right Arrow)"
          >
            <CheckIcon className="w-3.5 h-3.5" /> Done
          </button>
        </div>
      )}
    </div>
  );
};
