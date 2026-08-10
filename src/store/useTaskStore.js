import { create } from 'zustand';
import { getDBItem, setDBItem, setFile, deleteFile } from '../utils/db';
import { getTodayDateString, defaultCategories, parseIntelligentDeadline, getLocalString } from '../utils/helpers';
import { useSettingsStore } from './useSettingsStore';
import { useUIStore } from './useUIStore';

export const useTaskStore = create((set, get) => ({
    tasks: [],
    templates: [],
    journalEntries: [],
    customCategories: {},
    isLoading: true,

    // Initial load from IndexedDB
    loadInitialData: async () => {
        try {
            const [savedTasks, savedTemplates, savedCategories, savedJournal] = await Promise.all([
                getDBItem('aura-tasks'),
                getDBItem('aura-templates'),
                getDBItem('aura-custom-categories'),
                getDBItem('aura-journal-entries')
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

    // Task Actions
    setTasks: (updater) => {
        set((state) => {
            const nextTasks = typeof updater === 'function' ? updater(state.tasks) : updater;
            setDBItem('aura-tasks', nextTasks);
            return { tasks: nextTasks };
        });
    },

    setJournalEntries: (updater) => {
        set((state) => {
            const nextJournal = typeof updater === 'function' ? updater(state.journalEntries) : updater;
            setDBItem('aura-journal-entries', nextJournal);
            return { journalEntries: nextJournal };
        });
    },

    logDistraction: (distractionText) => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
            const existing = state.journalEntries.find(e => e.date === today);
            let nextJournal;
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
            const newTasks = template.tasks.map(t => ({...t, id: crypto.randomUUID(), subtasks: [], win: null, completionDate: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false })); 
            
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
            
            if (taskToToggle.priority >= 2 && !taskToToggle.recurring) {
                useUIStore.getState().setWinModalTaskId(id);
            }
        }

        set((state) => {
            let newTasks = state.tasks.map(t => {
                if (t.id === id) {
                    if (t.recurring) {
                        const nextDate = new Date(t.deadline || getTodayDateString());
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
                const completedInstance = { ...taskToToggle, id: Date.now().toString(), completed: true, recurring: null, completionDate: getTodayDateString() };
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
        let deletedTask = null;
        set((state) => {
            deletedTask = state.tasks.find(t => t.id === id);
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
        let attachmentObj;
        if (isNative) {
            attachmentObj = fileOrMetadata;
        } else {
            const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
                if (section && t.timeOfDay !== section && section !== 'pinned' && section !== 'completed') {
                    return { ...t, timeOfDay: section };
                }
                return t;
            });

            const updated = [...updatedSectionTasks, ...otherTasks];
            setDBItem('aura-tasks', updated);
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
            setDBItem('aura-templates', updated);
            return { templates: updated };
        });
    }
}));
