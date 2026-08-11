// --- App Configuration & Utilities ---
import { Task, UserStats, RecurringRule } from '../types';

export const getLocalString = (date: Date | string | number | null | undefined): string | null => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getTodayDateString = (): string | null => getLocalString(new Date());

export const demoTasks: Task[] = [
  { id: '1', createdAt: Date.now(), text: "Welcome to Aura! Try capturing a thought below. Add tags like @home", completed: false, priority: 2, category: 'General', timeOfDay: 'morning', deadline: null, subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: undefined, notes: '', attachments: [], tags: ['home'], isPinned: false, focusSessions: 0, isArchived: false },
  { id: '2', createdAt: Date.now(), text: "Mark a task as complete by clicking the circle", completed: true, priority: 2, category: 'General', timeOfDay: 'morning', deadline: null, subtasks: [], win: null, completionDate: getTodayDateString(), recurring: null, dependsOn: undefined, notes: 'You can un-complete it too!', attachments: [], tags: [], isPinned: false, focusSessions: 1, isArchived: false },
  { id: '3', createdAt: Date.now(), text: "Create a high-priority task by adding '!' #Urgent", completed: false, priority: 3, category: 'Urgent', timeOfDay: 'afternoon', deadline: getTodayDateString(), subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: undefined, notes: '', attachments: [], tags: [], isPinned: true, focusSessions: 0, isArchived: false },
  { id: '4', createdAt: Date.now(), text: "This task repeats every day @routine", completed: false, priority: 2, category: 'Personal', timeOfDay: 'evening', deadline: getTodayDateString(), subtasks: [], win: null, completionDate: null, recurring: { type: 'daily' }, dependsOn: undefined, notes: '', attachments: [], tags: ['routine'], isPinned: false, focusSessions: 0, isArchived: false },
  { id: '5', createdAt: Date.now(), text: "Organize project with subtasks", completed: false, priority: 2, category: 'Work', timeOfDay: 'afternoon', deadline: null, subtasks: [ { id: 's1', text: "Outline proposal", completed: true }, { id: 's2', text: "Draft initial designs", completed: false }, { id: 's3', text: "Get feedback", completed: false } ], win: null, completionDate: null, recurring: null, dependsOn: undefined, notes: 'Subtasks help break down complex goals.', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false },
  { id: '6', createdAt: Date.now(), text: "Explore different views using the bottom navigation", completed: false, priority: 1, category: 'Ideas', timeOfDay: 'evening', deadline: null, subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: undefined, notes: 'Each view gives a different perspective on your tasks.', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false }
];

export interface CategoryConfig {
    bg: string;
    border: string;
    text: string;
    solid: string;
    glowColor: string;
}

export const defaultCategories: Record<string, CategoryConfig> = {
    'Work': { bg: 'bg-sky-500/30', border: 'border-sky-400/50', text: 'text-sky-200', solid: 'bg-sky-500', glowColor: '#38bdf8' },
    'Personal': { bg: 'bg-lime-500/30', border: 'border-lime-400/50', text: 'text-lime-200', solid: 'bg-lime-500', glowColor: '#a3e635' },
    'Design': { bg: 'bg-fuchsia-500/30', border: 'border-fuchsia-400/50', text: 'text-fuchsia-200', solid: 'bg-fuchsia-500', glowColor: '#d946ef' },
    'Development': { bg: 'bg-indigo-500/30', border: 'border-indigo-400/50', text: 'text-indigo-200', solid: 'bg-indigo-500', glowColor: '#818cf8' },
    'Study': { bg: 'bg-amber-500/30', border: 'border-amber-400/50', text: 'text-amber-200', solid: 'bg-amber-500', glowColor: '#fbbd23' },
    'Urgent': { bg: 'bg-rose-500/30', border: 'border-rose-400/50', text: 'text-rose-200', solid: 'bg-rose-500', glowColor: '#fb7185' },
    'Health': { bg: 'bg-green-500/30', border: 'border-green-400/50', text: 'text-green-200', solid: 'bg-green-500', glowColor: '#4ade80' },
    'Finance': { bg: 'bg-teal-500/30', border: 'border-teal-400/50', text: 'text-teal-200', solid: 'bg-teal-500', glowColor: '#2dd4bf' },
    'Ideas': { bg: 'bg-orange-500/30', border: 'border-orange-400/50', text: 'text-orange-200', solid: 'bg-orange-500', glowColor: '#fb923c' },
    'Chores': { bg: 'bg-stone-500/30', border: 'border-stone-400/50', text: 'text-stone-200', solid: 'bg-stone-500', glowColor: '#a8a29e' },
    'General': { bg: 'bg-slate-500/30', border: 'border-slate-400/50', text: 'text-slate-200', solid: 'bg-slate-500', glowColor: '#94a3b8' },
};

export const motivationalQuotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It’s not the load that breaks you down, it’s the way you carry it.", author: "Lou Holtz" },
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "Believe you can and you’re halfway there.", author: "Theodore Roosevelt" },
  { quote: "Well done is better than well said.", author: "Benjamin Franklin" },
  { quote: "A year from now you may wish you had started today.", author: "Karen Lamb" }
];

export const formatDate = (dateString?: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isOverdue = (dateString?: string | null): boolean => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateString + 'T00:00:00');
    return deadline < today;
};

export interface IntelligentDeadlineResult {
    deadline: string | null;
    cleanedText: string;
    recurring: RecurringRule | null;
}

export const parseIntelligentDeadline = (text: string): IntelligentDeadlineResult => {
    let cleanedText = text;
    let deadline: string | null = null;
    let recurring: RecurringRule | null = null;
    const now = new Date();

    const recurringPatterns: { regex: RegExp; type: 'daily' | 'weekly' | 'monthly' }[] = [
        { regex: /every day/i, type: 'daily' },
        { regex: /every week/i, type: 'weekly' },
        { regex: /every month/i, type: 'monthly' },
        { regex: /daily/i, type: 'daily' },
        { regex: /weekly/i, type: 'weekly' },
        { regex: /monthly/i, type: 'monthly' },
    ];

    for (const pattern of recurringPatterns) {
        if (pattern.regex.test(cleanedText)) {
            recurring = { type: pattern.type };
            cleanedText = cleanedText.replace(pattern.regex, '').trim();
            break;
        }
    }

    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const getNextWeekday = (targetName: string, allowSameDay = false): Date => {
        const d = new Date(now);
        const targetDay = weekdays.indexOf(targetName.toLowerCase());
        let dayDiff = targetDay - now.getDay();
        if (dayDiff < (allowSameDay ? 0 : 1)) dayDiff += 7;
        d.setDate(now.getDate() + dayDiff);
        return d;
    };

    const patterns = [
        {
            regex: /in (\d+) (day|week|month|fortnight)s?/i,
            handler: (matches: RegExpMatchArray) => {
                const num = parseInt(matches[1], 10);
                const unit = matches[2].toLowerCase();
                const d = new Date(now);
                if (unit === 'day') d.setDate(now.getDate() + num);
                if (unit === 'week') d.setDate(now.getDate() + num * 7);
                if (unit === 'month') d.setMonth(now.getMonth() + num);
                if (unit === 'fortnight') d.setDate(now.getDate() + 14 * num);
                return d;
            }
        },
        {
            regex: /\b(today|tomorrow)\b/i,
            handler: (matches: RegExpMatchArray) => {
                const d = new Date(now);
                if (matches[1].toLowerCase() === 'tomorrow') d.setDate(now.getDate() + 1);
                return d;
            }
        },
        {
            regex: /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|year)/i,
            handler: (matches: RegExpMatchArray) => {
                const d = new Date(now);
                const unit = matches[1].toLowerCase();
                if (unit === 'week') { d.setDate(now.getDate() + 7); return d; }
                if (unit === 'month') { d.setMonth(now.getMonth() + 1); d.setDate(1); return d; }
                if (unit === 'year') { d.setFullYear(now.getFullYear() + 1); d.setMonth(0); d.setDate(1); return d; }
                return getNextWeekday(unit);
            }
        },
        {
            regex: /(?:by|on) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            handler: (matches: RegExpMatchArray) => getNextWeekday(matches[1], true)
        },
        {
            regex: /end of (the )?week/i,
            handler: () => getNextWeekday('sunday')
        },
        {
            regex: /end of (next )?month/i,
            handler: (matches: RegExpMatchArray) => {
                const d = new Date(now);
                const monthOffset = matches[1] ? 2 : 1;
                d.setMonth(now.getMonth() + monthOffset, 0);
                return d;
            }
        },
        {
            regex: /end of (the )?year/i,
            handler: () => new Date(now.getFullYear(), 11, 31)
        },
        {
            regex: /\bnext month\b/i,
            handler: () => {
                const d = new Date(now);
                d.setMonth(now.getMonth() + 1);
                d.setDate(1);
                return d;
            }
        },
        {
            regex: /\bQ([1-4])\b/i,
            handler: (matches: RegExpMatchArray) => {
                const quarter = parseInt(matches[1], 10);
                const startMonth = (quarter - 1) * 3;
                const year = startMonth < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
                return new Date(year, startMonth + 3, 0);
            }
        },
        {
            regex: /this weekend/i,
            handler: () => getNextWeekday('saturday', true)
        },
        {
            regex: /in a (day|week|month|fortnight)/i,
            handler: (matches: RegExpMatchArray) => {
                const unit = matches[1].toLowerCase();
                const d = new Date(now);
                if (unit === 'day') d.setDate(now.getDate() + 1);
                if (unit === 'week') d.setDate(now.getDate() + 7);
                if (unit === 'month') d.setMonth(now.getMonth() + 1);
                if (unit === 'fortnight') d.setDate(now.getDate() + 14);
                return d;
            }
        },
        {
            regex: /(?:on\s)?(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s(\d{1,2})/i,
            handler: (matches: RegExpMatchArray, fullMatch: string) => {
                const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
                const monthStr = fullMatch.replace(/on\s/i, '').substring(0, 3).toLowerCase();
                const month = months.indexOf(monthStr);
                const day = parseInt(matches[1], 10);
                if (month === -1 || isNaN(day)) return null;
                const year = now.getFullYear();
                const d = new Date(year, month, day);
                if (d < now) d.setFullYear(year + 1);
                return d;
            }
        },
    ];

    for (const pattern of patterns) {
        const match = cleanedText.match(pattern.regex);
        if (match) {
            const dateResult = pattern.handler(match, match[0]);
            if (dateResult) {
                deadline = getLocalString(dateResult);
                cleanedText = cleanedText.replace(match[0], '').replace(/  +/g, ' ').trim();
                break;
            }
        }
    }

    if (recurring && !deadline) {
        deadline = getTodayDateString();
    }

    return { deadline, cleanedText, recurring };
};

export interface Achievement {
    id: string;
    title: string;
    description: string;
    check: (tasks: Task[], stats: UserStats) => boolean;
}

export const achievementsList: Achievement[] = [
    { id: 'first_task', title: 'First Step', description: 'Complete your first task.', check: (tasks) => tasks.some(t => t.completed) },
    { id: 'high_priority', title: 'Task Master', description: 'Complete a high-priority task.', check: (tasks) => tasks.some(t => t.completed && t.priority === 3) },
    { id: 'first_win', title: 'Big Win!', description: 'Record your first win in the Grove.', check: (tasks) => tasks.some(t => Boolean(t.win)) },
    { id: 'golden_seed', title: 'Golden Touch', description: 'Earn your first Golden Seed.', check: (_tasks, stats) => stats.goldenSeeds > 0 },
    { id: 'streak_3', title: 'On a Roll', description: 'Complete a task 3 days in a row.', check: (_tasks, stats) => stats.streak >= 3 },
    { id: 'focused_finish', title: 'Deep Focus', description: 'Complete a task using the Focus Timer.', check: (_tasks, stats) => stats.focusedTasksCompleted > 0 },
];
