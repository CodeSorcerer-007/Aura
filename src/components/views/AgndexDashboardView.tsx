import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task, CategoryStyle } from '../../types';
import { WidgetCanvas } from '../widgets/WidgetCanvas';
import { AddWidgetDrawer } from '../widgets/AddWidgetDrawer';
import { useWidgetStore } from '../../store/useWidgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useUIStore } from '../../store/useUIStore';
import { SparklesIcon, StarIcon, ZapIcon } from '../icons/Icons';

export interface AgndexDashboardViewProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onArchiveTask: (id: string) => void;
  onTogglePin: (id: string) => void;
  onFocusTask: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onPlantSeed: () => void;
  allCategories: Record<string, CategoryStyle>;
  allTags: string[];
}

export const AgndexDashboardView: React.FC<AgndexDashboardViewProps> = (props) => {
  const isAddDrawerOpen = useWidgetStore(s => s.isAddWidgetDrawerOpen);
  const setIsAddDrawerOpen = useWidgetStore(s => s.setIsAddWidgetDrawerOpen);
  const addWidget = useWidgetStore(s => s.addWidget);
  const careerProfile = useWidgetStore(s => s.careerProfile);
  const stats = useSettingsStore(s => s.stats);
  const setIsMorningRitualOpen = useUIStore(s => s.setIsMorningRitualOpen);
  const setShutdownRitual = useUIStore(s => s.setShutdownRitual);
  const setIsMindfulMinuteOpen = useUIStore(s => s.setIsMindfulMinuteOpen);

  // Live time ticker
  const [timeStr, setTimeStr] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (hours < 12) setGreeting('Good morning');
      else if (hours < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Agndex Desktop Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[var(--color-bg-secondary)] via-[var(--color-bg-secondary)]/90 to-[var(--color-bg-secondary)]/70 border border-[var(--color-border)] shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
              <SparklesIcon className="w-3.5 h-3.5 text-teal-400" /> Agndex Workspace OS
            </span>
            <span className="text-xs text-white/50 font-mono">• {timeStr}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">{careerProfile.role.split('&')[0].trim()}</span>
          </h1>
          <p className="text-xs text-white/60 mt-0.5">
            {stats.streak} day streak • {stats.goldenSeeds} Golden Seeds • Fully offline & private
          </p>
        </div>

        {/* Quick Launch Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMorningRitualOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <StarIcon className="w-3.5 h-3.5 fill-amber-300" /> Morning MITs
          </button>

          <button
            onClick={() => setIsMindfulMinuteOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-teal-400/10 hover:bg-teal-400/20 text-teal-300 border border-teal-400/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            🧘 Zen Reset
          </button>

          <button
            onClick={() => setShutdownRitual(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-400/10 hover:bg-indigo-400/20 text-indigo-300 border border-indigo-400/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            🌙 Shutdown
          </button>
        </div>
      </div>

      {/* Main Widget Canvas */}
      <WidgetCanvas {...props} />

      {/* Add Widget Drawer */}
      <AddWidgetDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        onAddWidget={addWidget}
      />
    </motion.div>
  );
};
