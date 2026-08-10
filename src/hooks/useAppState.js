import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { usePreferences } from './usePreferences';
import { setFile, deleteFile } from '../utils/db';
import { 
    getLocalString, getTodayDateString, demoTasks, defaultCategories, 
    motivationalQuotes, parseIntelligentDeadline, achievementsList 
} from '../utils/helpers';

export function useAppState() {
    const [tasks, setTasks, tasksLoaded] = usePreferences('aura-tasks', []);
    const [templates, setTemplates, templatesLoaded] = usePreferences('aura-templates', []);
    const [stats, setStats, statsLoaded] = usePreferences('aura-stats', { goldenSeeds: 0, streak: 0, lastActiveDate: null, focusedTasksCompleted: 0 });
    const [unlockedAchievements, setUnlockedAchievements, achievementsLoaded] = usePreferences('aura-achievements', []);
    const [theme, setTheme, themeLoaded] = usePreferences('aura-theme', 'dark');
    const [grove, setGrove, groveLoaded] = usePreferences('aura-grove', []);
    const [customCategories, setCustomCategories, categoriesLoaded] = usePreferences('aura-custom-categories', {});
    const [hasLaunched, setHasLaunched, launchedLoaded] = usePreferences('aura-has-launched', false);
    const [journalEntries, setJournalEntries, journalLoaded] = usePreferences('aura-journal-entries', []);
    const [customThemes, setCustomThemes, customThemesLoaded] = usePreferences('aura-custom-themes', []);
    const [shutdownTime, setShutdownTime, shutdownTimeLoaded] = usePreferences('aura-shutdown-time', '18:00');
    const [soundEffectsEnabled, setSoundEffectsEnabled, soundEffectsLoaded] = usePreferences('aura-sound-effects', true);
    const [autoArchiveEnabled, setAutoArchiveEnabled, autoArchiveLoaded] = usePreferences('aura-auto-archive', true);
    const [notificationsEnabled, setNotificationsEnabled, notificationsLoaded] = usePreferences('aura-notifications-enabled', false);

    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('flow');
    const [focusTaskId, setFocusTaskId] = useState(null);
    const [winModalTaskId, setWinModalTaskId] = useState(null);
    const [assistantMessage, setAssistantMessage] = useState(null);
    const [templateSuggestion, setTemplateSuggestion] = useState(null);
    const [activeFilter, setActiveFilter] = useState({ type: 'all', value: null });
    const [achievementToast, setAchievementToast] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPlanting, setIsPlanting] = useState(false);
    
    // Modals
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [detailModal, setDetailModal] = useState({ isOpen: false, taskId: null });
    const [isMindfulMinuteOpen, setIsMindfulMinuteOpen] = useState(false);
    const [isThemeCreatorOpen, setIsThemeCreatorOpen] = useState(false);
    const [shutdownRitual, setShutdownRitual] = useState({ active: false, step: 0 });
    const [toastMessage, setToastMessage] = useState(null);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isShareSummaryOpen, setIsShareSummaryOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    
    const importInputRef = useRef(null);

    const allCategories = useMemo(() => ({...defaultCategories, ...customCategories}), [customCategories]);
    
    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            setToastMessage({ type: 'error', text: 'Notifications not supported on this browser.' });
            return;
        }
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setToastMessage({ type: 'success', text: 'Notifications enabled!' });
            setNotificationsEnabled(true);
        } else {
            setToastMessage({ type: 'error', text: 'Notifications were denied.' });
            setNotificationsEnabled(false);
        }
    }, [setNotificationsEnabled]);
    
    const handleSetNotifications = useCallback((enabled) => {
        setNotificationsEnabled(enabled);
        if (enabled && Notification.permission !== 'granted') {
            requestNotificationPermission();
        }
    }, [setNotificationsEnabled, requestNotificationPermission]);

    const showNotification = useCallback((title, options) => {
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }, [notificationsEnabled]);

    const playSoundEffect = useCallback((effect) => {
        if (!soundEffectsEnabled) return;
        
        const now = Tone.now();
        Tone.start().then(() => {
            switch (effect) {
                case 'add':
                    new Tone.Synth().toDestination().triggerAttackRelease("C5", "8n", now);
                    break;
                case 'complete':
                    new Tone.Synth().toDestination().triggerAttackRelease("E6", "8n", now);
                    break;
                case 'achievement':
                    new Tone.PluckSynth().toDestination().triggerAttackRelease("C7", "8n", now);
                    break;
                default:
                    break;
            }
        });
    }, [soundEffectsEnabled]);
    
    useEffect(() => {
        const allDataLoaded = tasksLoaded && templatesLoaded && statsLoaded && achievementsLoaded && themeLoaded && groveLoaded && categoriesLoaded && launchedLoaded && journalLoaded && customThemesLoaded && shutdownTimeLoaded && soundEffectsLoaded && autoArchiveLoaded && notificationsLoaded;
        if (allDataLoaded) {
             if (!hasLaunched) {
                setTasks(demoTasks);
                setHasLaunched(true);
            }
            setTimeout(() => setIsLoading(false), 1200);
        }
    }, [tasksLoaded, templatesLoaded, statsLoaded, achievementsLoaded, themeLoaded, groveLoaded, categoriesLoaded, launchedLoaded, journalLoaded, customThemesLoaded, shutdownTimeLoaded, soundEffectsLoaded, autoArchiveLoaded, notificationsLoaded, hasLaunched, setTasks, setHasLaunched]);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        const updateTimeOfDay = () => {
            const hour = new Date().getHours(); 
            if (hour >= 5 && hour < 12) setTimeOfDay('morning'); 
            else if (hour >= 12 && hour < 17) setTimeOfDay('day'); 
            else if (hour >= 17 && hour < 20) setTimeOfDay('evening'); 
            else setTimeOfDay('night');
        };
        updateTimeOfDay();
        const interval = setInterval(updateTimeOfDay, 60000);
        return () => clearInterval(interval);
    }, []);

    const runAssistant = useCallback(() => {
        const lastPromptKey = 'aura-last-assistant-prompt';
        const lastPromptDate = localStorage.getItem(lastPromptKey);
        if (lastPromptDate === getTodayDateString()) return;

        const now = new Date();
        const [shutdownHour, shutdownMinute] = shutdownTime.split(':').map(Number);
        if (now.getHours() === shutdownHour && now.getMinutes() >= shutdownMinute && !shutdownRitual.active) {
            setShutdownRitual({ active: true, step: 0 });
            localStorage.setItem(lastPromptKey, getTodayDateString());
            return;
        }
        
        const dayOfWeek = now.getDay();
        if (dayOfWeek === 1) {
            setAssistantMessage({ message: "It's a new week! Let's get organized. What are your main goals?" });
            localStorage.setItem(lastPromptKey, getTodayDateString());
        } else if (dayOfWeek === 5) {
             setAssistantMessage({ message: "It's Friday! A great time to look back at your wins this week in the Grove." });
             localStorage.setItem(lastPromptKey, getTodayDateString());
        }
    }, [shutdownTime, shutdownRitual.active]);

    const checkAchievements = useCallback(() => {
        for (const achievement of achievementsList) {
            if (!unlockedAchievements.includes(achievement.id) && achievement.check(tasks, stats, grove)) {
                setUnlockedAchievements(prev => [...prev, achievement.id]);
                setAchievementToast(achievement);
                playSoundEffect('achievement');
                setTimeout(() => setAchievementToast(null), 4000);
            }
        }
    }, [unlockedAchievements, tasks, stats, grove, setUnlockedAchievements, playSoundEffect]);

    const updateStreakAndArchive = useCallback(() => {
        const today = getTodayDateString();
        const lastActive = stats.lastActiveDate;
        const tasksCompletedToday = tasks.some(t => t.completionDate === today);

        if (lastActive !== today) {
            if (autoArchiveEnabled) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalString(yesterday);
                setTasks(currentTasks => currentTasks.map(t => (t.completionDate === yesterdayStr ? {...t, isArchived: true} : t)));
            }

            if (tasksCompletedToday) {
                 const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalString(yesterday);

                if (lastActive === yesterdayStr) {
                    setStats(prev => ({ ...prev, streak: prev.streak + 1, lastActiveDate: today }));
                } else {
                    setStats(prev => ({ ...prev, streak: 1, lastActiveDate: today }));
                }
            }
        }
    }, [stats.lastActiveDate, tasks, autoArchiveEnabled, setTasks, setStats]);

    useEffect(() => {
        if (!isLoading) {
             checkAchievements(); 
             updateStreakAndArchive();
             runAssistant();
        }
    }, [tasks, stats, isLoading, grove, shutdownTime, checkAchievements, updateStreakAndArchive, runAssistant]);

    const addTask = useCallback((text, applyTemplate = null) => {
        playSoundEffect('add');
        if (applyTemplate) { 
            const template = templates.find(t => t.name === applyTemplate); 
            if (!template) return; 
            const newTasks = template.tasks.map(t => ({...t, id: crypto.randomUUID(), subtasks: [], win: null, completionDate: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false })); 
            setTasks(prev => [...prev, ...newTasks]); 
            setTemplateSuggestion(null); 
            return; 
        }
        if (templateSuggestion) { setTemplateSuggestion(null); }
        
        const matchingTemplate = templates.find(t => text.toLowerCase().includes(t.name.toLowerCase()));
        if (matchingTemplate) { setTemplateSuggestion({ templateName: matchingTemplate.name, taskText: text }); return; }

        let { deadline, cleanedText, recurring } = parseIntelligentDeadline(text);

        const tagRegex = /@(\w+)/g;
        const tags = [...cleanedText.matchAll(tagRegex)].map(match => match[1]);
        cleanedText = cleanedText.replace(tagRegex, '').trim();

        let priority = 2;
        if (cleanedText.includes('!')) {
            priority = 3;
            cleanedText = cleanedText.replace(/(^|\s)!+(?=\s|$)/g, ' ').replace(/!+$/, '').trim();
        }
        if (cleanedText.toLowerCase().includes('urgent')) { priority = 3; cleanedText = cleanedText.replace(/urgent/ig, '').trim(); }
        if (cleanedText.toLowerCase().includes('low priority')) { priority = 1; cleanedText = cleanedText.replace(/low priority/ig, '').trim(); }
        let category = 'General'; 
        const categoryMatch = cleanedText.match(/#(\w+)/); 
        if (categoryMatch) { 
            category = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1); 
            cleanedText = cleanedText.replace(/#\w+/, '').trim(); 
        }
        let time = 'afternoon'; 
        if (cleanedText.toLowerCase().includes('morning')) { time = 'morning'; cleanedText = cleanedText.replace(/morning/ig, '').trim(); } 
        if (cleanedText.toLowerCase().includes('evening') || cleanedText.toLowerCase().includes('night')) { time = 'evening'; cleanedText = cleanedText.replace(/evening|night/ig, '').trim(); }
        
        const newTask = { id: crypto.randomUUID(), text: cleanedText.replace(/  +/g, ' ').trim(), completed: false, priority, category, timeOfDay: time, deadline, subtasks: [], win: null, completionDate: null, recurring, notes: '', attachments: [], tags, isPinned: false, focusSessions: 0, isArchived: false };
        setTasks(prevTasks => [...prevTasks, newTask]);
    }, [playSoundEffect, templates, templateSuggestion, setTasks]);
    
    const toggleTask = useCallback(async (id) => {
        const taskToToggle = tasks.find(t => t.id === id);
        if (!taskToToggle) return;

        const isCompleting = !taskToToggle.completed;
        if (isCompleting) {
            playSoundEffect('complete');
            setGrove(prevGrove => {
                const latestTreeIndex = prevGrove.findLastIndex(tree => tree.growthPoints < tree.maxGrowth);
                if (latestTreeIndex > -1) {
                    const newGrove = [...prevGrove];
                    newGrove[latestTreeIndex] = { ...newGrove[latestTreeIndex], growthPoints: newGrove[latestTreeIndex].growthPoints + 1 };
                    return newGrove;
                }
                return prevGrove;
            });
            if (taskToToggle.priority >= 2 && !taskToToggle.recurring) {
                setWinModalTaskId(id);
            }
        }

        setTasks(prevTasks => {
            let newTasks = prevTasks.map(t => {
                if (t.id === id) {
                    if (t.recurring) {
                        const nextDate = new Date(t.deadline || getTodayDateString());
                        if (t.recurring.type === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                        if (t.recurring.type === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                        if (t.recurring.type === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                        return { ...t, deadline: getLocalString(nextDate) };
                    }
                    return { ...t, completed: !t.completed, completionDate: t.completed ? null : getTodayDateString() };
                }
                return t;
            });

            if (taskToToggle.recurring && isCompleting) {
                const completedInstance = { ...taskToToggle, id: Date.now(), completed: true, recurring: null, completionDate: getTodayDateString() };
                newTasks.push(completedInstance);
            }

            return newTasks;
        });
    }, [playSoundEffect, setTasks, setGrove, tasks]);

    const togglePin = useCallback((id) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    }, [setTasks]);
    
    const handleSkipWin = useCallback((id) => {
        setWinModalTaskId(null);
    }, []);

    const saveWin = useCallback((id, winText) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, win: winText } : t));
        setWinModalTaskId(null);
    }, [setTasks]);
    
    const deleteTask = useCallback(async (id) => {
        const taskToDelete = tasks.find(t => t.id === id);
        if (!taskToDelete) return;

        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));

        setToastMessage({
            type: 'info',
            text: `Deleted "${taskToDelete.text.length > 25 ? taskToDelete.text.substring(0, 25) + '...' : taskToDelete.text}"`,
            actionLabel: 'Undo',
            onAction: () => {
                setTasks(prevTasks => [...prevTasks, taskToDelete]);
                setToastMessage({ type: 'success', text: 'Task restored!' });
            }
        });

        // Delay file cleanup to allow undo
        setTimeout(async () => {
            if (taskToDelete.attachments && taskToDelete.attachments.length > 0) {
                for (const att of taskToDelete.attachments) {
                    try { await deleteFile(att.id); } catch(e) {}
                }
            }
        }, 5500);
    }, [tasks, setTasks]);

    const archiveTask = useCallback((id) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, isArchived: true } : t));
    }, [setTasks]);

    const restoreTask = useCallback((id) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, isArchived: false } : t));
    }, [setTasks]);

    const saveTaskDetail = useCallback((id, newText, newNotes, newTags) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, text: newText, notes: newNotes, tags: newTags } : t));
    }, [setTasks]);

    const setTaskDependency = useCallback((taskId, dependencyId) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, dependsOn: dependencyId } : t));
    }, [setTasks]);

    const addAttachmentToTask = useCallback(async (taskId, file) => {
        const fileId = crypto.randomUUID();
        const attachmentMeta = { id: fileId, name: file.name, type: file.type };
        
        await setFile(fileId, file);

        setTasks(currentTasks => 
            currentTasks.map(task => {
                if (task.id === taskId) {
                    const attachments = task.attachments || [];
                    return { ...task, attachments: [...attachments, attachmentMeta] };
                }
                return task;
            })
        );
    }, [setTasks]);

    const deleteAttachmentFromTask = useCallback(async (taskId, attachment) => {
        await deleteFile(attachment.id);
        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id === taskId) {
                    return {
                        ...task,
                        attachments: task.attachments.filter(att => att.id !== attachment.id),
                    };
                }
                return task;
            })
        );
    }, [setTasks]);

    const saveTemplate = useCallback((category, tasksToSave) => {
        const templateTasks = tasksToSave.map(t => ({ text: t.text, category: t.category, priority: t.priority, timeOfDay: t.timeOfDay }));
        setTemplates(prev => [...prev, { name: category, tasks: templateTasks }]);
    }, [setTemplates]);
    
    const handlePlantSeed = useCallback(() => {
        if (stats.goldenSeeds > 0) {
            setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds - 1 }));
            setIsPlanting(true);
        }
    }, [stats.goldenSeeds, setStats]);
    
    const finishPlanting = useCallback(() => {
        const unlockedTrees = ['oak'];
        if (unlockedAchievements.includes('streak_3')) unlockedTrees.push('pine');
        if (unlockedAchievements.includes('focused_finish')) unlockedTrees.push('cherry');
        const randomType = unlockedTrees[Math.floor(Math.random() * unlockedTrees.length)];
        
        setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: randomType }]);
        setIsPlanting(false);
    }, [unlockedAchievements, setGrove]);

    const reorderTask = useCallback((taskId, direction) => {
        setTasks(prevTasks => {
            const tasksToSort = prevTasks.filter(t => !t.completed);
            const completedTasks = prevTasks.filter(t => t.completed);
            
            const index = tasksToSort.findIndex(t => t.id === taskId);
            if (index === -1) return prevTasks;
            
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= tasksToSort.length) return prevTasks;
            
            const [movedTask] = tasksToSort.splice(index, 1);
            tasksToSort.splice(newIndex, 0, movedTask);
            
            return [...tasksToSort, ...completedTasks];
        });
    }, [setTasks]);

    const updateTaskOrderAndSection = useCallback((reorderedSectionTasks, timeSection) => {
        setTasks(prevTasks => {
            const currentIds = new Set(reorderedSectionTasks.map(t => t.id));
            const otherTasks = prevTasks.filter(t => !currentIds.has(t.id));
            
            const updatedSectionTasks = reorderedSectionTasks.map(t => {
                if (timeSection && t.timeOfDay !== timeSection) {
                    return { ...t, timeOfDay: timeSection };
                }
                return t;
            });

            return [...updatedSectionTasks, ...otherTasks];
        });
    }, [setTasks]);

    const toggleSubtask = useCallback((taskId, subtaskText) => {
        setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === taskId) {
                const newSubtasks = task.subtasks.map(st => st.text === subtaskText ? { ...st, completed: !st.completed } : st);
                return { ...task, subtasks: newSubtasks };
            }
            return task;
        }));
    }, [setTasks]);

    const focusTask = useMemo(() => tasks.find(t => t.id === focusTaskId), [tasks, focusTaskId]);
    const tasksCompletedToday = useMemo(() => tasks.filter(t => t.completionDate === getTodayDateString()).length, [tasks]);
    const MOMENTUM_GOAL = 5;
    const momentumProgress = Math.min(tasksCompletedToday / MOMENTUM_GOAL, 1);
    
    useEffect(() => {
        if (!isLoading && tasksCompletedToday >= MOMENTUM_GOAL) {
            const today = getTodayDateString();
            const awardedDateKey = 'momentum-awarded-date';
            const lastAwardedDate = localStorage.getItem(awardedDateKey);
            if (lastAwardedDate !== today) {
                setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds + 1 }));
                localStorage.setItem(awardedDateKey, today);
            }
        }
    }, [tasksCompletedToday, isLoading, setStats]);

    const filteredTasks = useMemo(() => {
        const nonArchived = tasks.filter(t => !t.isArchived);
        if (activeFilter.type === 'all') return nonArchived;
        if (activeFilter.type === 'priority') return nonArchived.filter(t => t.priority === 3);
        if (activeFilter.type === 'category') return nonArchived.filter(t => t.category === activeFilter.value);
        if (activeFilter.type === 'tag') return nonArchived.filter(t => (t.tags || []).includes(activeFilter.value));
        if (activeFilter.type === 'due_this_week') {
            const today = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
            return nonArchived.filter(t => !t.completed && t.deadline && new Date(t.deadline) <= endOfWeek);
        }
        return nonArchived;
    }, [tasks, activeFilter]);
    
    const detailTask = useMemo(() => tasks.find(t => t.id === detailModal.taskId), [tasks, detailModal.taskId]);
    const dailyQuote = useMemo(() => { 
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      return motivationalQuotes[dayOfYear % motivationalQuotes.length];
    }, []);

    const dailyStats = useMemo(() => {
        const todayStr = getTodayDateString();
        const completedToday = tasks.filter(t => t.completionDate === todayStr).length;
        const focusToday = tasks.reduce((acc, task) => {
            if (task.completionDate === todayStr) {
                return acc + (task.focusSessions || 0);
            }
            return acc;
        }, 0);
        const achievementsToday = unlockedAchievements.length;
        return { completed: completedToday, focusSessions: focusToday, achievements: achievementsToday };
    }, [tasks, unlockedAchievements]);

    const shutdownRitualMessages = [
        `Let's wind down for the day. You completed ${tasksCompletedToday} tasks today. How do you feel?`,
        "Is there anything left on your mind? Capture any final thoughts for tomorrow.",
        "Your mind is clear. It's time to disconnect. See you tomorrow!"
    ];
    
    useEffect(() => {
        if (shutdownRitual.active) {
            setAssistantMessage({ message: shutdownRitualMessages[shutdownRitual.step] });
        } else if (!shutdownRitual.active && assistantMessage?.message.startsWith("Let's wind down")) {
            setAssistantMessage(null);
        }
    }, [shutdownRitual]);

    const baseThemes = [
        { id: 'dark', name: 'OLED Dark', bg: 'bg-black', text: 'text-white' },
        { id: 'light', name: 'Clean Light', bg: 'bg-gray-100', text: 'text-black' },
        { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-black', text: 'text-cyan-400' },
        { id: 'crimson', name: 'Crimson', bg: 'bg-black', text: 'text-red-400' },
        { id: 'forest', name: 'Forest', bg: 'bg-[#0b2e13]', text: 'text-[#a3b899]' },
        { id: 'ocean', name: 'Ocean', bg: 'bg-[#001f3f]', text: 'text-[#81d4fa]' },
        { id: 'dune', name: 'Dune', bg: 'bg-[#2a1d0c]', text: 'text-[#e3d5b8]' },
        { id: 'sakura', name: 'Sakura', bg: 'bg-[#fef6f6]', text: 'text-[#5e2d2d]' },
        { id: 'solarized', name: 'Solarized', bg: 'bg-[#002b36]', text: 'text-[#93a1a1]' },
        { id: 'dracula', name: 'Dracula', bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]' },
        { id: 'nord', name: 'Nord', bg: 'bg-[#2E3440]', text: 'text-[#E5E9F0]' },
        { id: 'gruvbox', name: 'Gruvbox', bg: 'bg-[#282828]', text: 'text-[#ebdbb2]' },
        { id: 'monokai', name: 'Monokai', bg: 'bg-[#272822]', text: 'text-[#F8F8F2]' },
        { id: 'rose_pine', name: 'Rosé Pine', bg: 'bg-[#191724]', text: 'text-[#e0def4]' },
        { id: 'matcha', name: 'Matcha', bg: 'bg-[#243029]', text: 'text-[#adadad]' },
        { id: 'latte', name: 'Latte', bg: 'bg-[#eff1f5]', text: 'text-[#4c4f69]' },
    ];

    const allThemes = useMemo(() => [...baseThemes, ...customThemes], [customThemes]);

    const handleFocusComplete = useCallback((taskId) => {
        toggleTask(taskId);
        setStats(s => ({...s, focusedTasksCompleted: s.focusedTasksCompleted + 1}));
        setTasks(prevTasks => prevTasks.map(t => 
            t.id === taskId ? {...t, focusSessions: (t.focusSessions || 0) + 1} : t
        ));
        showNotification("Focus session complete!", {
            body: `Great work on: ${tasks.find(t => t.id === taskId)?.text}`,
        });
    }, [toggleTask, setStats, setTasks, showNotification, tasks]);

    const handleExport = useCallback(() => {
        const data = { tasks, templates, stats, unlockedAchievements, theme, grove, customCategories, hasLaunched, journalEntries, customThemes, shutdownTime, soundEffectsEnabled, autoArchiveEnabled, notificationsEnabled };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `aura-backup-${getTodayDateString()}.json`;
        link.click();
        setToastMessage({ type: 'success', text: 'Data exported successfully!' });
    }, [tasks, templates, stats, unlockedAchievements, theme, grove, customCategories, hasLaunched, journalEntries, customThemes, shutdownTime, soundEffectsEnabled, autoArchiveEnabled, notificationsEnabled]);

    const handleImport = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.tasks) setTasks(data.tasks);
                if (data.templates) setTemplates(data.templates);
                if (data.stats) setStats(data.stats);
                if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements);
                if (data.theme) setTheme(data.theme);
                if (data.grove) setGrove(data.grove);
                if (data.customCategories) setCustomCategories(data.customCategories);
                if (data.hasLaunched) setHasLaunched(data.hasLaunched);
                if (data.journalEntries) setJournalEntries(data.journalEntries);
                if (data.customThemes) setCustomThemes(data.customThemes);
                if (data.shutdownTime) setShutdownTime(data.shutdownTime);
                if (data.soundEffectsEnabled) setSoundEffectsEnabled(data.soundEffectsEnabled);
                if (data.autoArchiveEnabled) setAutoArchiveEnabled(data.autoArchiveEnabled);
                if (data.notificationsEnabled) setNotificationsEnabled(data.notificationsEnabled);
                setToastMessage({ type: 'success', text: 'Data imported successfully!' });
            } catch (error) {
                console.error("Error parsing import file:", error);
                setToastMessage({ type: 'error', text: 'Failed to import data. Invalid file format.' });
            }
        };
        reader.readAsText(file);
    }, [setTasks, setTemplates, setStats, setUnlockedAchievements, setTheme, setGrove, setCustomCategories, setHasLaunched, setJournalEntries, setCustomThemes, setShutdownTime, setSoundEffectsEnabled, setAutoArchiveEnabled, setNotificationsEnabled]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeEl = document.activeElement;
            const isInputFocused = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA';

            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }

            if (e.key === 'Escape') {
                if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
                else if (isSearchOpen) setIsSearchOpen(false);
                else if (isSettingsOpen) setIsSettingsOpen(false);
                else if (detailModal.isOpen) setDetailModal({ isOpen: false, taskId: null });
                else if (focusTaskId) setFocusTaskId(null);
                else if (isMindfulMinuteOpen) setIsMindfulMinuteOpen(false);
                else if (isThemeCreatorOpen) setIsThemeCreatorOpen(false);
            }

            if (isInputFocused) return;
            
            switch(e.key) {
                case 'n': e.preventDefault(); document.querySelector('input[placeholder*="Capture a thought"]')?.focus(); break;
                case 's': e.preventDefault(); setIsSettingsOpen(true); break;
                case '1': setCurrentView('flow'); break;
                case '2': setCurrentView('constellations'); break;
                case '3': setCurrentView('grove'); break;
                case '4': setCurrentView('journal'); break;
                case '5': setCurrentView('review'); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCommandPaletteOpen, isSearchOpen, isSettingsOpen, detailModal.isOpen, focusTaskId, isMindfulMinuteOpen, isThemeCreatorOpen]);

    const commands = useMemo(() => [
        { label: "New Task", action: () => document.querySelector('input[placeholder*="Capture a thought"]')?.focus(), shortcut: "N" },
        { label: "Open Search", action: () => setIsSearchOpen(true), shortcut: "" },
        { label: "Open Settings", action: () => setIsSettingsOpen(true), shortcut: "S" },
        { label: "Toggle Theme: Dark", action: () => setTheme('dark'), shortcut: "" },
        { label: "Toggle Theme: Light", action: () => setTheme('light'), shortcut: "" },
        { label: "Go to Flow", action: () => setCurrentView('flow'), shortcut: "1" },
        { label: "Go to Projects", action: () => setCurrentView('constellations'), shortcut: "2" },
        { label: "Go to Grove", action: () => setCurrentView('grove'), shortcut: "3" },
        { label: "Go to Journal", action: () => setCurrentView('journal'), shortcut: "4" },
        { label: "Go to Review", action: () => setCurrentView('review'), shortcut: "5" },
    ], [setTheme]);

    return {
        tasks, setTasks, templates, setTemplates, stats, setStats, unlockedAchievements, setUnlockedAchievements,
        theme, setTheme, grove, setGrove, customCategories, setCustomCategories, hasLaunched, setHasLaunched,
        journalEntries, setJournalEntries, customThemes, setCustomThemes, shutdownTime, setShutdownTime,
        soundEffectsEnabled, setSoundEffectsEnabled, autoArchiveEnabled, setAutoArchiveEnabled,
        notificationsEnabled, setNotificationsEnabled, isLoading, currentView, setCurrentView,
        focusTaskId, setFocusTaskId, winModalTaskId, setWinModalTaskId, assistantMessage, setAssistantMessage,
        templateSuggestion, setTemplateSuggestion, activeFilter, setActiveFilter, achievementToast, setAchievementToast,
        isSettingsOpen, setIsSettingsOpen, isPlanting, setIsPlanting, isSearchOpen, setIsSearchOpen,
        detailModal, setDetailModal, isMindfulMinuteOpen, setIsMindfulMinuteOpen, isThemeCreatorOpen, setIsThemeCreatorOpen,
        shutdownRitual, setShutdownRitual, toastMessage, setToastMessage, isArchiveOpen, setIsArchiveOpen,
        isShareSummaryOpen, setIsShareSummaryOpen, isCommandPaletteOpen, setIsCommandPaletteOpen, importInputRef,
        allCategories, allThemes, focusTask, momentumProgress, filteredTasks, detailTask, dailyQuote, dailyStats,
        shutdownRitualMessages, commands,
        requestNotificationPermission, handleSetNotifications, showNotification, playSoundEffect, addTask,
        toggleTask, togglePin, handleSkipWin, saveWin, deleteTask, archiveTask, restoreTask, saveTaskDetail,
        setTaskDependency, addAttachmentToTask, deleteAttachmentFromTask, saveTemplate, handlePlantSeed, finishPlanting,
        reorderTask, updateTaskOrderAndSection, toggleSubtask, handleFocusComplete, handleExport, handleImport
    };
}
