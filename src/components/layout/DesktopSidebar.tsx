import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ViewType, CategoryStyle } from '../../types';
import { useUIStore } from '../../store/useUIStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  CalendarIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  ArchiveIcon,
} from '../icons/Icons';

export interface DesktopSidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  allCategories: Record<string, CategoryStyle>;
  onOpenPlugins?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentView,
  onSelectView,
  onOpenPlugins,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const setIsSettingsOpen = useUIStore(s => s.setIsSettingsOpen);
  const setIsSearchOpen = useUIStore(s => s.setIsSearchOpen);
  const setIsShortcutsOpen = useUIStore(s => s.setIsShortcutsOpen);
  const setIsThemeCreatorOpen = useUIStore(s => s.setIsThemeCreatorOpen);
  const stats = useSettingsStore(s => s.stats);

  const navItems: { id: ViewType; label: string; icon: string; shortcut: string }[] = [
    { id: 'workspace', label: 'Workspace', icon: '💎', shortcut: '1' },
    { id: 'flow', label: 'Flow Timeline', icon: '🌊', shortcut: '2' },
    { id: 'calendar', label: 'Calendar', icon: '🗓️', shortcut: '3' },
    { id: 'constellations', label: 'Projects', icon: '🌌', shortcut: '4' },
    { id: 'grove', label: 'The Grove', icon: '🌲', shortcut: '5' },
    { id: 'journal', label: 'Journal', icon: '📖', shortcut: '6' },
    { id: 'review', label: 'Analytics', icon: '📊', shortcut: '7' },
  ];

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`hidden md:flex flex-col justify-between py-5 px-3 bg-[#0d131f]/95 border-r border-white/10 backdrop-blur-2xl transition-all duration-300 z-40 shrink-0 ${
        isExpanded ? 'w-56' : 'w-18'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-2 mb-6 cursor-pointer" onClick={() => onSelectView('workspace')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-teal-500/20 shrink-0">
            A
          </div>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <h2 className="text-sm font-extrabold text-white tracking-wide">AURA 3.0</h2>
              <p className="text-[10px] text-teal-400 font-mono">Agndex Edition</p>
            </motion.div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl transition-all group relative ${
                  isActive
                    ? 'bg-teal-400/15 text-teal-300 font-bold border border-teal-400/30 shadow-lg shadow-teal-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between flex-1 min-w-0"
                  >
                    <span className="text-xs truncate">{item.label}</span>
                    <span className="text-[10px] font-mono text-white/30 px-1.5 py-0.5 rounded bg-white/5">
                      {item.shortcut}
                    </span>
                  </motion.div>
                )}

                {/* Active Bar indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarBar"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-teal-400 rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tools & Profile */}
      <div className="space-y-2 pt-4 border-t border-white/10">
        {/* Search button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-xs transition-colors"
          title="Search Tasks (Cmd+F)"
        >
          <span className="text-base">🔍</span>
          {isExpanded && <span>Search</span>}
        </button>

        {/* Plugins / Addons button */}
        <button
          onClick={onOpenPlugins}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-white/60 hover:text-teal-300 hover:bg-white/5 text-xs transition-colors"
          title="Addons & Plugins"
        >
          <span className="text-base">🧩</span>
          {isExpanded && <span>Plugins</span>}
        </button>

        {/* Theme button */}
        <button
          onClick={() => setIsThemeCreatorOpen(true)}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-xs transition-colors"
          title="Customize Theme"
        >
          <span className="text-base">🎨</span>
          {isExpanded && <span>Themes</span>}
        </button>

        {/* Settings button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-xs transition-colors"
          title="Settings (S)"
        >
          <span className="text-base">⚙️</span>
          {isExpanded && <span>Settings</span>}
        </button>

        {/* Shortcuts button */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-xs transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <span className="text-base">❓</span>
          {isExpanded && <span>Shortcuts</span>}
        </button>
      </div>
    </aside>
  );
};
