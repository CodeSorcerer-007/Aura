import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, XIcon } from '../icons/Icons';
import { getLocalString, formatDate, defaultCategories, achievementsList } from '../../utils/helpers';
import { Task, CategoryStyle, UserStats } from '../../types';

interface ReviewViewProps {
    tasks: Task[];
    achievements: string[];
    allCategories: Record<string, CategoryStyle>;
    stats: UserStats;
    onDeleteStale: (id: string) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({ tasks, achievements, allCategories, stats, onDeleteStale }) => {
    const completedTasks = tasks.filter(t => t.completed && t.completionDate);

    const heatmapData = useMemo(() => {
        const data = new Map<string, { level: number }>();
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = getLocalString(date);
            if (dateKey) data.set(dateKey, { level: 0 });
        }
        completedTasks.forEach(task => {
            const date = task.completionDate!;
            if (data.has(date)) {
                data.get(date)!.level++;
            }
        });
        return Array.from(data.entries()).reverse();
    }, [completedTasks]);

    const trendData = useMemo(() => {
        const trend: { date: string; count: number }[] = [];
        let maxCount = 0;
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = getLocalString(d) || '';
            const count = completedTasks.filter(t => t.completionDate === dateStr).length;
            if (count > maxCount) maxCount = count;
            trend.push({ date: dateStr, count });
        }
        return { trend, maxCount };
    }, [completedTasks]);

    const recentHistory = useMemo(() => {
        return [...completedTasks].sort((a, b) => {
            const timeA = a.createdAt || (a.completionDate ? new Date(a.completionDate).getTime() : 0);
            const timeB = b.createdAt || (b.completionDate ? new Date(b.completionDate).getTime() : 0);
            return timeB - timeA;
        }).slice(0, 5);
    }, [completedTasks]);
    
    const categoryData = useMemo(() => {
        const data = completedTasks.reduce((acc: Record<string, number>, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(data).sort((a,b) => b[1] - a[1]);
    }, [completedTasks]);

    const tagData = useMemo(() => {
        const data = completedTasks.reduce((acc: Record<string, number>, task) => {
            (task.tags || []).forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});
        return Object.entries(data).sort((a,b) => b[1] - a[1]);
    }, [completedTasks]);

    const totalTagCount = useMemo(() => {
        return completedTasks.flatMap(t => t.tags || []).length;
    }, [completedTasks]);

    const staleTasks = useMemo(() => {
        const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
        return tasks.filter(task => {
            if (task.completed || task.isArchived) return false;
            const created = task.createdAt || (typeof task.id === 'number' ? task.id : null);
            return created ? created < twoWeeksAgo : false;
        });
    }, [tasks]);

    const totalCompleted = completedTasks.length;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Your Review</h2>
                <p className="text-[var(--color-text-secondary)]">Reflect on your productivity and progress.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Productivity Heatmap</h3>
                    <div className="flex flex-wrap gap-1">
                        {heatmapData.map(([date, data]) => (
                            <div
                                key={date}
                                className={`w-3 h-3 rounded-sm ${data.level === 0 ? 'bg-[var(--color-bg)]' : 'bg-[var(--color-accent)]'}`}
                                style={data.level > 0 ? { opacity: Math.min(data.level * 0.25, 1) } : {}}
                                title={`${data.level} tasks on ${formatDate(date) || date}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Current Streak</h3>
                    <div className="text-center">
                        <p className="text-6xl font-bold text-amber-400">{stats.streak}</p>
                        <p className="text-[var(--color-text-secondary)]">day{stats.streak !== 1 && 's'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
                    <div className="space-y-2">
                        {categoryData.length > 0 ? categoryData.map(([category, count]) => (
                            <div key={category}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">{category}</span>
                                    <span className="text-[var(--color-text-secondary)]">{count} tasks</span>
                                </div>
                                <div className="w-full bg-[var(--color-bg)] rounded-full h-2">
                                    <div 
                                        className={`${allCategories[category]?.solid || defaultCategories['General'].solid} h-2 rounded-full`}
                                        style={{ width: `${totalCompleted > 0 ? (count / totalCompleted) * 100 : 0}%`}}
                                    />
                                </div>
                            </div>
                        )) : <p className="text-[var(--color-text-secondary)] text-sm">No completed tasks with categories yet.</p>}
                    </div>
                </div>
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Tag Breakdown</h3>
                    <div className="space-y-2">
                        {tagData.length > 0 ? tagData.slice(0, 5).map(([tag, count]) => (
                            <div key={tag}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">@{tag}</span>
                                    <span className="text-[var(--color-text-secondary)]">{count} tasks</span>
                                </div>
                                <div className="w-full bg-[var(--color-bg)] rounded-full h-2">
                                    <div 
                                        className="bg-purple-400 h-2 rounded-full"
                                        style={{ width: `${totalTagCount > 0 ? (count / totalTagCount) * 100 : 0}%`}}
                                    />
                                </div>
                            </div>
                        )) : <p className="text-[var(--color-text-secondary)] text-sm">No completed tasks with tags yet.</p>}
                    </div>
                </div>
            </div>
            
            {staleTasks.length > 0 && (
                 <div className="text-left p-4 bg-[var(--color-bg-secondary)] border border-rose-500/30 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Unfinished Business</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">These tasks were created over two weeks ago. Consider completing, rescheduling, or deleting them.</p>
                    <div className="space-y-2">
                      {staleTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-[var(--color-bg)] rounded-md">
                          <span className="text-sm">{task.text}</span>
                          <button onClick={() => onDeleteStale(task.id)} className="text-rose-400 hover:text-rose-600"><XIcon className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">14-Day Trend</h3>
                    <div className="h-40 flex items-end justify-between relative mt-8">
                        {trendData.trend.map((d) => {
                            const height = trendData.maxCount === 0 ? 0 : (d.count / trendData.maxCount) * 100;
                            const formattedDate = formatDate(d.date) || d.date;
                            return (
                                <div key={d.date} className="w-full mx-1 flex flex-col justify-end items-center group relative h-full">
                                    <div 
                                        className="w-full bg-[var(--color-accent)] rounded-t-sm opacity-80 group-hover:opacity-100 transition-all"
                                        style={{ height: `${height}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                                    ></div>
                                    <div className="absolute -top-8 bg-[var(--color-bg)] text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-[var(--color-border)] whitespace-nowrap">
                                        {d.count} tasks<br/><span className="text-[10px] text-gray-400">{formattedDate ? formattedDate.split(',')[0] : ''}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg flex flex-col">
                    <h3 className="text-xl font-bold mb-4">Recent History</h3>
                    <div className="flex-1 overflow-y-auto space-y-4 relative pl-4">
                        <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-[var(--color-border)] rounded"></div>
                        {recentHistory.map((t) => (
                            <div key={t.id} className="relative pl-4">
                                <div className="absolute -left-[22px] top-1.5 w-3 h-3 bg-[var(--color-accent)] rounded-full border-2 border-[var(--color-bg-secondary)]"></div>
                                <p className="text-sm font-semibold">{t.text}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{t.completionDate ? (formatDate(t.completionDate) || t.completionDate) : ''}</p>
                            </div>
                        ))}
                        {recentHistory.length === 0 && <p className="text-[var(--color-text-secondary)] text-sm italic">No completed tasks yet.</p>}
                    </div>
                </div>
            </div>

            <div className="text-left p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                <h3 className="text-xl font-bold mb-4">Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {achievementsList.map(ach => (
                        <div key={ach.id} className={`p-3 rounded-lg text-center ${achievements.includes(ach.id) ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700/50 opacity-60'}`}>
                           <TrophyIcon className={`w-8 h-8 mx-auto mb-2 ${achievements.includes(ach.id) ? 'text-amber-400' : 'text-slate-500'}`} />
                           <p className="font-semibold text-sm">{ach.title}</p>
                           <p className="text-xs text-[var(--color-text-primary)]/60">{ach.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
