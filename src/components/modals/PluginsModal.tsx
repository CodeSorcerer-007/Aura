import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuraPlugin } from '../../types';
import { pluginRegistry } from '../../plugins/pluginRegistry';
import { XIcon, SparklesIcon } from '../icons/Icons';

export interface PluginsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginsModal: React.FC<PluginsModalProps> = ({ isOpen, onClose }) => {
  const [plugins, setPlugins] = useState<AuraPlugin[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const refreshPlugins = () => {
    setPlugins(pluginRegistry.getAllPlugins());
  };

  useEffect(() => {
    if (isOpen) {
      pluginRegistry.init().then(refreshPlugins);
    }
  }, [isOpen]);

  const handleToggle = async (id: string) => {
    await pluginRegistry.togglePlugin(id);
    refreshPlugins();
  };

  const handleSettingChange = async (pluginId: string, key: string, value: any) => {
    await pluginRegistry.updatePluginSetting(pluginId, key, value);
    refreshPlugins();
  };

  const filteredPlugins = selectedCategory === 'all'
    ? plugins
    : plugins.filter(p => p.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#121826] border border-white/15 rounded-3xl shadow-2xl p-6 flex flex-col z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-lg">
              🧩
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Addons & Plugin Ecosystem</h3>
              <p className="text-xs text-white/50">Enable tactile components, audio modules, and integrations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 py-3 border-b border-white/5 overflow-x-auto text-xs">
          {['all', 'productivity', 'audio', 'gamification', 'analytics', 'lifestyle'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl capitalize font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-400 text-black shadow-md'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Plugin List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {filteredPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {plugin.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{plugin.name}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-white/60">
                        v{plugin.version}
                      </span>
                      {plugin.builtin && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 font-bold">
                          Core
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">{plugin.description}</p>
                    <p className="text-[10px] text-white/40 mt-1">Author: {plugin.author}</p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(plugin.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors p-0.5 shrink-0 ${
                    plugin.enabled ? 'bg-teal-400' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-5 h-5 rounded-full bg-black shadow-md"
                    animate={{ x: plugin.enabled ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Plugin Settings if Enabled */}
              {plugin.enabled && plugin.settings && plugin.settings.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-2 mt-1">
                  {plugin.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between text-xs text-white/80">
                      <span>{setting.label}</span>
                      {setting.type === 'boolean' && (
                        <input
                          type="checkbox"
                          checked={setting.value}
                          onChange={e => handleSettingChange(plugin.id, setting.key, e.target.checked)}
                          className="rounded accent-teal-400"
                        />
                      )}
                      {setting.type === 'select' && setting.options && (
                        <select
                          value={setting.value}
                          onChange={e => handleSettingChange(plugin.id, setting.key, e.target.value)}
                          className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          {setting.options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>{plugins.filter(p => p.enabled).length} of {plugins.length} addons active</span>
          <span className="font-mono text-[10px]">Portable JSON Schema v3.0</span>
        </div>
      </motion.div>
    </div>
  );
};
