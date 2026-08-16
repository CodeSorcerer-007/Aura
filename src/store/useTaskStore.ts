import { create } from 'zustand';
import { getDBItem, setDBItem, setDBItemDebounced, setFile, deleteFile } from '../utils/db';
import { getTodayDateString, parseIntelligentDeadline, getLocalString } from '../utils/helpers';
import { useSettingsStore } from './useSettingsStore';
import { useUIStore } from './useUIStore';
import { Task, Template, JournalEntry, Attachment } from '../types';

export interface TaskState {
    tasks: Task[];
    templates: Template[];
    journalEntries: JournalEntry[];
    customCategories: Record<string, any>;
    isLoading: boolean;

    loadInitialData: () => Promise<void>;
    setTasks: (updater: Task[] | ((prev: Task[]) => Task[])) => void;
    setTemplates: (updater: Template[] | ((prev: Template[]) => Template[])) => void;
    reorderTask: (newOrder: { id: string }[]) => void;
    setJournalEntries: (updater: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])) => void;
    setCustomCategories: (updater: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
    logDistraction: (distractionText: string) => void;
    addTask: (taskInput: string | { text: string; category?: string; timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime' }, applyTemplate?: string | null) => Task | null;
    toggleTask: (id: string) => void;
    togglePin: (id: string) => void;
    deleteTask: (id: string) => Task | null;
    archiveTask: (id: string) => void;
    restoreTask: (id: string) => void;
    saveTaskDetail: (id: string, textOrUpdates: any, notes?: string, tags?: string[], estimatedMinutes?: number) => void;
    setTaskDependency: (taskId: string, dependencyId: string | undefined) => void;
    addAttachmentToTask: (taskId: string, fileOrMetadata: any, isNative?: boolean) => Promise<void>;
    deleteAttachmentFromTask: (taskId: string, attachment: Attachment) => Promise<void>;
    toggleSubtask: (taskId: string, subtaskIndex: number) => void;
    updateTaskOrderAndSection: (newOrder: Task[], section?: string) => void;
    saveTemplate: (templateName: string, tasksToInclude?: Task[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    templates: [],
    journalEntries: [],
    customCategories: {},
    isLoading: true,

    // Initial load from IndexedDB
    loadInitialData: async () => {
        try {
            const [savedTasks, savedTemplates, savedCategories, savedJournal] = await Promise.all([
                getDBItem<Task[]>('aura-tasks'),
                getDBItem<Template[]>('aura-templates'),
                getDBItem<Record<string, any>>('aura-custom-categories'),
                getDBItem<JournalEntry[]>('aura-journal-entries')
            ]);

            set({
                tasks: savedTasks || [],
                templates: savedTemplates || [],
                journalEntries: savedJournal || [],
                customCategories: savedCategories || {},
                isLoading: false
            });
        } catch (error) {
            console.error('Error loading task data from IndexedDB:', error);
            set({ isLoading: false });
        }
    },

    setTasks: (updater) => {
        set((state) => {
            const nextTasks = typeof updater === 'function' ? updater(state.tasks) : updater;
            setDBItem('aura-tasks', nextTasks);
            return { tasks: nextTasks };
        });
    },

    setTemplates: (updater) => {
        set((state) => {
            const nextTemplates = typeof updater === 'function' ? updater(state.templates) : updater;
            setDBItem('aura-templates', nextTemplates);
            return { templates: nextTemplates };
        });
    },

    reorderTask: (newOrder) => {
        set((state) => {
            const updatedIds = newOrder.map(t => t.id);
            const updatedTasks = state.tasks.map((t) => {
                const pos = updatedIds.indexOf(t.id);
                return pos !== -1 ? { ...t, order: pos } : t;
            });
            setDBItemDebounced('aura-tasks', updatedTasks);
            return { tasks: updatedTasks };
        });
    },

    setJournalEntries: (updater) => {
        set((state) => {
            const nextJournal = typeof updater === 'function' ? updater(state.journalEntries) : updater;
            setDBItem('aura-journal-entries', nextJournal);
            return { journalEntries: nextJournal };
        });
    },

    setCustomCategories: (updater) => {
        set((state) => {
            const next = typeof updater === 'function' ? updater(state.customCategories) : updater;
            setDBItem('aura-custom-categories', next);
            return { customCategories: next };
        });
    },

    logDistraction: (distractionText) => {
        const today = getTodayDateString() || new Date().toISOString().split('T')[0];
        set((state) => {
            const existing = state.journalEntries.find(e => e.date === today);
            let nextJournal: JournalEntry[];
            if (existing) {
                nextJournal = state.journalEntries.map(e =>
                    e.date === today
                        ? { ...e, distractions: [...(e.distractions || []), { text: distractionText, time: new Date().toISOString() }] }
                        : e
                );
            } else {
                nextJournal = [...state.journalEntries, { date: today, content: '', distractions: [{ text: distractionText, time: new Date().toISOString() }] }];
            }
            setDBItem('aura-journal-entries', nextJournal);
            return { journalEntries: nextJournal };
        });
    },

    addTask: (taskInput, applyTemplate = null) => {
        useSettingsStore.getState().playSoundEffect('add');
        if (applyTemplate) { 
            const template = get().templates.find(t => t.name === applyTemplate); 
            if (!template) return null; 
            const newTasks: Task[] = template.tasks.map(t => ({
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                text: t.text,
                category: t.category,
                priority: t.priority,
                timeOfDay: t.timeOfDay,
                completed: false,
                subtasks: [],
                win: null,
                completionDate: null,
                deadline: null,
                recurring: null,
                notes: '',
                attachments: [],
                tags: [],
                isPinned: false,
                focusSessions: 0,
                isArchived: false
            })); 
            
            set((state) => {
                const updated = [...state.tasks, ...newTasks];
                setDBItem('aura-tasks', updated);
                return { tasks: updated };
            });
            return null; 
        }

        const text = typeof taskInput === 'string' ? taskInput : taskInput.text;
        if (!text || !text.trim()) return null;

        const priorityMatch = text.match(/!+/);
        const priority = priorityMatch ? Math.min(priorityMatch[0].length + 1, 3) : 2;

        const categoryMatch = text.match(/#(\w+)/);
        const category = categoryMatch ? categoryMatch[1] : (typeof taskInput === 'object' && taskInput.category ? taskInput.category : 'General');

        const tagMatches = text.match(/@(\w+)/g);
        const tags = tagMatches ? tagMatches.map(t => t.substring(1)) : [];

        const cleanedText = text.replace(/!+/g, '').replace(/#\w+/g, '').replace(/@\w+/g, '');
        const { deadline, recurring, cleanedText: finalText } = parseIntelligentDeadline(cleanedText);

        const time = typeof taskInput === 'object' && taskInput.timeOfDay ? taskInput.timeOfDay : 'morning';

        const newTask: Task = {
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            text: finalText.replace(/  +/g, ' ').trim(),
            completed: false,
            priority,
            category,
            timeOfDay: time,
            deadline,
            subtasks: [],
            win: null,
            completionDate: null,
            recurring,
            notes: '',
            attachments: [],
            tags,
            isPinned: false,
            focusSessions: 0,
            isArchived: false
        };

        set((state) => {
            const updated = [newTask, ...state.tasks];
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });

        return newTask;
    },

    toggleTask: (id) => {
        const taskToToggle = get().tasks.find(t => t.id === id);
        if (!taskToToggle) return;

        const isCompleting = !taskToToggle.completed;
        if (isCompleting) {
            useSettingsStore.getState().playSoundEffect('complete');
            useSettingsStore.getState().incrementGroveGrowth();
            
            // Only show the win modal for high-priority (urgent) tasks — priority 3.
            // Priority 2 is the default for all tasks, so this prevents the modal
            // from firing on almost every completion.
            if (taskToToggle.priority === 3 && !taskToToggle.recurring) {
                useUIStore.getState().setWinModalTaskId(id);
            }
        }

        set((state) => {
            let newTasks = state.tasks.map(t => {
                if (t.id === id) {
                    if (t.recurring) {
                        const nextDate = new Date(t.deadline || getTodayDateString() || Date.now());
                        if (t.recurring.type === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                        if (t.recurring.type === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                        if (t.recurring.type === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                        return { ...t, deadline: getLocalString(nextDate) };
                    }
                    return {
                        ...t,
                        completed: isCompleting,
                        completionDate: isCompleting ? getTodayDateString() : null
                    };
                }
                return t;
            });

            if (taskToToggle.recurring && isCompleting) {
                const completedInstance: Task = { ...taskToToggle, id: Date.now().toString(), completed: true, recurring: null, completionDate: getTodayDateString() };
                newTasks.push(completedInstance);
            }

            setDBItem('aura-tasks', newTasks);
            return { tasks: newTasks };
        });
    },

    togglePin: (id) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t);
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    deleteTask: (id) => {
        let deletedTask: Task | null = null;
        set((state) => {
            deletedTask = state.tasks.find(t => t.id === id) || null;
            const updated = state.tasks.filter(t => t.id !== id);
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
        return deletedTask;
    },

    archiveTask: (id) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === id ? { ...t, isArchived: true } : t);
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    restoreTask: (id) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === id ? { ...t, isArchived: false } : t);
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    saveTaskDetail: (id, textOrUpdates, notes, tags, estimatedMinutes) => {
        set((state) => {
            const updates = typeof textOrUpdates === 'object' && textOrUpdates !== null
                ? textOrUpdates
                : { text: textOrUpdates, notes, tags, estimatedMinutes };
            const updated = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    setTaskDependency: (taskId, dependencyId) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === taskId ? { ...t, dependsOn: dependencyId } : t);
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    addAttachmentToTask: async (taskId, fileOrMetadata, isNative = false) => {
        let attachmentObj: Attachment;
        if (isNative) {
            attachmentObj = fileOrMetadata;
        } else {
            const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
            await setFile(fileId, fileOrMetadata);
            attachmentObj = {
                id: fileId,
                name: fileOrMetadata.name,
                size: fileOrMetadata.size,
                type: fileOrMetadata.type
            };
        }

        set((state) => {
            const updated = state.tasks.map(t => {
                if (t.id === taskId) {
                    const existing = t.attachments || [];
                    return { ...t, attachments: [...existing, attachmentObj] };
                }
                return t;
            });
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    deleteAttachmentFromTask: async (taskId, attachment) => {
        if (attachment.id && !attachment.path) {
            try {
                await deleteFile(attachment.id);
            } catch (e) {}
        }

        set((state) => {
            const updated = state.tasks.map(t => {
                if (t.id === taskId) {
                    const existing = t.attachments || [];
                    return { ...t, attachments: existing.filter(a => a.id !== attachment.id) };
                }
                return t;
            });
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    toggleSubtask: (taskId, subtaskIndex) => {
        set((state) => {
            const updated = state.tasks.map(t => {
                if (t.id === taskId) {
                    const newSubtasks = [...t.subtasks];
                    newSubtasks[subtaskIndex] = {
                        ...newSubtasks[subtaskIndex],
                        completed: !newSubtasks[subtaskIndex].completed
                    };
                    return { ...t, subtasks: newSubtasks };
                }
                return t;
            });
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    updateTaskOrderAndSection: (newOrder, section) => {
        set((state) => {
            const otherTasks = state.tasks.filter(t => {
                if (section === 'pinned') return !t.isPinned || t.completed || t.isArchived;
                if (section === 'completed') return !t.completed || t.isArchived;
                return t.isPinned || t.completed || t.isArchived || t.timeOfDay !== section;
            });

            const updatedSectionTasks = newOrder.map(t => {
                if (section && t.timeOfDay !== (section as any) && section !== 'pinned' && section !== 'completed') {
                    return { ...t, timeOfDay: section as any };
                }
                return t;
            });

            const updated = [...updatedSectionTasks, ...otherTasks];
            setDBItem('aura-tasks', updated);
            return { tasks: updated };
        });
    },

    saveTemplate: (templateName, tasksToInclude) => {
        set((state) => {
            const rawTasks = tasksToInclude || state.tasks.filter(t => !t.completed && !t.isArchived && (!templateName || t.category === templateName));
            const tasksToSave = rawTasks.length > 0 ? rawTasks : state.tasks.filter(t => !t.completed && !t.isArchived);
            if (tasksToSave.length === 0) return state;

            const templateTasks = tasksToSave.map(t => ({
                text: t.text,
                category: t.category,
                priority: t.priority,
                timeOfDay: t.timeOfDay
            }));

            const newTemplate: Template = { id: crypto.randomUUID(), name: templateName, tasks: templateTasks };
            const updated = [...state.templates, newTemplate];
            setDBItem('aura-templates', updated);
            return { templates: updated };
        });
    }
}));
