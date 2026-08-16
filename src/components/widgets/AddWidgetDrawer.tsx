import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetType } from '../../types';
import { XIcon, PlusIcon } from '../icons/Icons';

export interface AddWidgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType) => void;
}

interface WidgetInfo {
  type: WidgetType;
  title: string;
  category: string;
  icon: string;
  description: string;
  defaultSize: string;
}

const AVAILABLE_WIDGETS: WidgetInfo[] = [
  {
    type: 'capture',
    title: 'Quick NLP Capture',
    category: 'Productivity',
    icon: '⚡',
    description: 'Instant thought capture with intelligent tags (#), priorities (!), and natural language deadlines.',
    defaultSize: 'Wide (3 cols)'
  },
  {
    type: 'triage_deck',
    title: 'Card Swipe Triage',
    category: 'Productivity / Watermelon UI',
    icon: '🎴',
    description: 'Tactile gesture deck to complete, defer, pin, or focus on tasks with keyboard arrow keys.',
    defaultSize: 'Medium (2 cols)'
  },
  {
    type: 'shuffled_pinned',
    title: 'Shuffled Priority Deck',
    category: 'Productivity / Watermelon UI',
    icon: '📌',
    description: 'Spring-animated pinned priority tasks with deck shuffling and intention spotlight.',
    defaultSize: 'Medium (2 cols)'
  },
  {
    type: 'focus_timer',
    title: 'Deep Work Focus Timer',
    category: 'Focus / Watermelon UI',
    icon: '⏱️',
    description: 'Adaptive magnetic slider Pomodoro timer with ambient soundscapes and distraction logging.',
    defaultSize: 'Medium (2 cols)'
  },
  {
    type: 'career_blocks',
    title: 'Career & Milestone Roadmap',
    category: 'Gamification / Watermelon UI',
    icon: '🏆',
    description: 'Bento craft blocks tracking quarterly objectives, velocity rating, and master level progression.',
    defaultSize: 'Large (2 cols, 2 rows)'
  },
  {
    type: 'momentum',
    title: 'Daily Velocity & Capacity',
    category: 'Analytics',
    icon: '📊',
    description: 'Planned vs 8h workday capacity gauge, tasks completed today, and streak heat index.',
    defaultSize: 'Medium (2 cols)'
  },
  {
    type: 'ambient',
    title: 'Tone Focus Soundscapes',
    category: 'Audio',
    icon: '🎧',
    description: 'Procedural offline sound synthesis with brown, pink, and white noise generators.',
    defaultSize: 'Small (1 col)'
  },
  {
    type: 'grove',
    title: 'The Grove Mini Garden',
    category: 'Gamification',
    icon: '🌲',
    description: 'Live tree growth visualization with golden seeds counter and 1-click planting.',
    defaultSize: 'Small (1 col)'
  },
  {
    type: 'scratchpad',
    title: 'Quick Scratchpad',
    category: 'Mindfulness',
    icon: '📝',
    description: 'Distraction logger and ephemeral scratchpad to preserve your flow state.',
    defaultSize: 'Small (1 col)'
  },
  {
    type: 'zen_minute',
    title: 'Mindful Minute Breathing',
    category: 'Mindfulness',
    icon: '🧘',
    description: 'Interactive box-breathing sphere with guided relaxation prompts.',
    defaultSize: 'Small (1 col)'
  },
  {
    type: 'voice_memo',
    title: 'Voice Memo & Speech Capture',
    category: 'Productivity / Audio',
    icon: '🎙️',
    description: 'High-fidelity audio memo recorder and real-time speech-to-text task creator.',
    defaultSize: 'Medium (2 cols)'
  }
];

export const AddWidgetDrawer: React.FC<AddWidgetDrawerProps> = ({
  isOpen,
  onClose,
  onAddWidget,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-md h-full bg-[#121826] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">Widget Gallery</h3>
                  <p className="text-xs text-white/50">Add widgets to your personalized desktop canvas</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Widget List */}
              <div className="mt-4 space-y-3">
                {AVAILABLE_WIDGETS.map((w) => (
                  <div
                    key={w.type}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-400/40 hover:bg-white/[0.06] transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-2xl mt-0.5 p-2 rounded-xl bg-white/5 border border-white/10">
                        {w.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                            {w.title}
                          </h4>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-2 mt-0.5">
                          {w.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-white/40">
                          <span className="px-1.5 py-0.5 rounded bg-white/5">{w.category}</span>
                          <span>•</span>
                          <span>{w.defaultSize}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onAddWidget(w.type);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-400 text-black font-bold text-xs flex items-center gap-1 hover:bg-teal-300 transition-all shadow-md shrink-0"
                    >
                      <PlusIcon className="w-3.5 h-3.5 stroke-[3]" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Tip */}
            <div className="pt-4 mt-6 border-t border-white/10 text-center text-xs text-white/40">
              💡 Tip: Toggle <span className="font-semibold text-white/60">Edit Mode</span> on your canvas to resize or reorder widgets.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
