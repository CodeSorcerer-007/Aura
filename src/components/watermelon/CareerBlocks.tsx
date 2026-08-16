import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CareerProfile, CareerGoal } from '../../types';
import { CheckIcon, StarIcon, TrophyIcon, PlusIcon } from '../icons/Icons';

export interface CareerBlocksProps {
  careerProfile: CareerProfile;
  onToggleGoal: (goalId: string) => void;
  onAddGoal?: (goal: Omit<CareerGoal, 'id'>) => void;
  onUpdateProfile?: (profile: Partial<CareerProfile>) => void;
  className?: string;
}

export const CareerBlocks: React.FC<CareerBlocksProps> = ({
  careerProfile,
  onToggleGoal,
  onAddGoal,
  onUpdateProfile,
  className = '',
}) => {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Engineering');
  const [newMetric, setNewMetric] = useState('');

  const completedGoals = careerProfile.goals.filter(g => g.completed).length;
  const totalGoals = careerProfile.goals.length;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddGoal?.({
      title: newTitle.trim(),
      category: newCategory,
      quarter: careerProfile.currentQuarter || 'Q3 2026',
      completed: false,
      progress: 0,
      metricLabel: newMetric ? 'Target' : undefined,
      metricValue: newMetric || undefined,
    });

    setNewTitle('');
    setNewMetric('');
    setIsAddingGoal(false);
  };

  return (
    <div className={`flex flex-col h-full gap-3 ${className}`}>
      {/* Top Bento Row: Profile Level & Velocity Gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Role & Level Bento */}
        <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {careerProfile.level || 'L6 • Architect'}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">
                {careerProfile.role || 'Senior Product Engineer'}
              </h4>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrophyIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-mono text-white/60 mb-1">
              <span>{careerProfile.currentQuarter} Roadmap</span>
              <span className="text-indigo-400 font-bold">{overallProgress}% completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Velocity Gauge Bento */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-500/10 to-transparent border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <motion.path
                className="text-teal-400"
                strokeDasharray={`${careerProfile.velocityScore || 94}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xs font-black font-mono text-white">
                {careerProfile.velocityScore || 94}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-teal-300 mt-1">Velocity Score</span>
          <span className="text-[10px] text-white/50">Top 5% Flow State</span>
        </div>
      </div>

      {/* Quarterly Goals List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[140px]">
        <div className="flex items-center justify-between text-xs font-bold text-white/80 px-1">
          <span>Quarterly Objectives ({completedGoals}/{totalGoals})</span>
          <button
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
          >
            <PlusIcon className="w-3.5 h-3.5" /> Add Goal
          </button>
        </div>

        <AnimatePresence>
          {isAddingGoal && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateGoal}
              className="p-3 rounded-xl bg-white/5 border border-teal-500/30 space-y-2"
            >
              <input
                type="text"
                placeholder="Objective title (e.g. Master Rust, Ship v3)..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-teal-400"
                autoFocus
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Metric target (e.g. 100 hrs, 10 articles)"
                  value={newMetric}
                  onChange={e => setNewMetric(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-white/40 focus:outline-none"
                />
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/80 focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design Systems">Design</option>
                  <option value="Mindfulness">Mindfulness</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Open Source">Open Source</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-teal-400 text-black text-xs font-bold hover:bg-teal-300"
                >
                  Save
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {careerProfile.goals.map((goal) => (
          <motion.div
            key={goal.id}
            layout
            onClick={() => onToggleGoal(goal.id)}
            className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              goal.completed
                ? 'bg-emerald-500/10 border-emerald-500/30 opacity-75'
                : 'bg-white/[0.03] border-white/10 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  goal.completed
                    ? 'bg-emerald-500 border-emerald-400 text-black'
                    : 'border-white/30 group-hover:border-teal-400'
                }`}
              >
                {goal.completed && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${goal.completed ? 'line-through text-white/50' : 'text-white'}`}>
                  {goal.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-white/50">
                  <span className="text-teal-400/80 font-mono">#{goal.category}</span>
                  {goal.metricValue && <span>• {goal.metricValue}</span>}
                </div>
              </div>
            </div>

            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              goal.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/70'
            }`}>
              {goal.progress}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
