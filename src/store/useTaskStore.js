import { create } from 'zustand';
import { db } from '../utils/db';
import { getTodayDateString, defaultCategories, parseIntelligentDeadline } from '../utils/helpers';

export const useTaskStore = create((set, get) => ({
    tasks: [],
    templates: [],
    customCategories: {},
    isLoading: true,

    // Initial load from IndexedDB
    loadInitialData: async () => {
        try {
            const [savedTasks, savedTemplates, savedCategories] = await Promise.all([
                db.getTasks(),
                db.getTemplates(),
                db.getCustomCategories()
            ]);

            set({
                tasks: savedTasks || [],
                templates: savedTemplates || [],
                customCategories: savedCategories || {},
                isLoading: false
            });
        } catch (error) {
            console.error('Error loading task data from IndexedDB:', error);
            set({ isLoading: false });
        }
    },

    // Task Actions
    setTasks: (updater) => {
        set((state) => {
            const nextTasks = typeof updater === 'function' ? updater(state.tasks) : updater;
            db.saveTasks(nextTasks);
            return { tasks: nextTasks };
        });
    },

    addTask: (taskInput) => {
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

        const newTask = {
            id: crypto.randomUUID(),
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
            db.saveTasks(updated);
            return { tasks: updated };
        });

        return newTask;
    },

    toggleTask: (id) => {
        set((state) => {
            const updated = state.tasks.map(t => {
                if (t.id === id) {
                    const nowCompleted = !t.completed;
                    return {
                        ...t,
                        completed: nowCompleted,
                        completionDate: nowCompleted ? getTodayDateString() : null
                    };
                }
                return t;
            });
            db.saveTasks(updated);
            return { tasks: updated };
        });
    },

    togglePin: (id) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t);
            db.saveTasks(updated);
            return { tasks: updated };
        });
    },

    deleteTask: (id) => {
        let deletedTask = null;
        set((state) => {
            deletedTask = state.tasks.find(t => t.id === id);
            const updated = state.tasks.filter(t => t.id !== id);
            db.saveTasks(updated);
            return { tasks: updated };
        });
        return deletedTask;
    },

    archiveTask: (id) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === id ? { ...t, isArchived: true } : t);
            db.saveTasks(updated);
            return { tasks: updated };
        });
    },

    restoreTask: (id) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === id ? { ...t, isArchived: false } : t);
            db.saveTasks(updated);
            return { tasks: updated };
        });
    },

    saveTaskDetail: (id, updates) => {
        set((state) => {
            const updated = state.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
            db.saveTasks(updated);
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
            db.saveTasks(updated);
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
                if (section && t.timeOfDay !== section && section !== 'pinned' && section !== 'completed') {
                    return { ...t, timeOfDay: section };
                }
                return t;
            });

            const updated = [...updatedSectionTasks, ...otherTasks];
            db.saveTasks(updated);
            return { tasks: updated };
        });
    },

    saveTemplate: (templateName) => {
        set((state) => {
            const tasksToSave = state.tasks.filter(t => !t.completed && !t.isArchived);
            if (tasksToSave.length === 0) return state;

            const templateTasks = tasksToSave.map(t => ({
                text: t.text,
                category: t.category,
                priority: t.priority,
                timeOfDay: t.timeOfDay
            }));

            const newTemplate = { id: crypto.randomUUID(), name: templateName, tasks: templateTasks };
            const updated = [...state.templates, newTemplate];
            db.saveTemplates(updated);
            return { templates: updated };
        });
    }
}));
