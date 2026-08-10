import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks & Utilities
import { usePreferences } from './hooks/usePreferences';
import { setFile, getFile, deleteFile } from './utils/db';
import { 
    getLocalString, getTodayDateString, demoTasks, defaultCategories, 
    motivationalQuotes, parseIntelligentDeadline, achievementsList 
} from './utils/helpers';

// Components
import { Header, AssistantPrompt } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { CaptureInput } from './components/layout/CaptureInput';
import { ThemeBackground } from './components/layout/ThemeBackground';
import { LoadingScreen, AchievementToast, GenericToast } from './components/layout/ToastsAndLoading';

// Views
import { FlowView } from './components/views/FlowView';
import { ConstellationsView } from './components/views/ConstellationsView';
import { GroveView, PlantingAnimation } from './components/views/GroveView';
import { JournalView } from './components/views/JournalView';
import { ReviewView } from './components/views/ReviewView';

// Modals
import { SettingsModal } from './components/modals/SettingsModal';
import { FocusView } from './components/modals/FocusView';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { SearchModal } from './components/modals/SearchModal';
import { MindfulMinuteModal } from './components/modals/MindfulMinuteModal';
import { ThemeCreatorModal } from './components/modals/ThemeCreatorModal';
import { ArchiveModal } from './components/modals/ArchiveModal';
import { ShareSummaryModal } from './components/modals/ShareSummaryModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { WinModal } from './components/modals/WinModal';

export default function App() {
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
    const [timeOfDay, setTimeOfDay] = useState('day');
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
    
    const requestNotificationPermission = async () => {
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
    };
    
    const handleSetNotifications = (enabled) => {
        setNotificationsEnabled(enabled);
        if(enabled && Notification.permission !== 'granted') {
            requestNotificationPermission();
        }
    };

    const showNotification = (title, options) => {
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    };

    const playSoundEffect = (effect) => {
        if (!soundEffectsEnabled || !window.Tone) return;
        
        const now = window.Tone.now();
        window.Tone.start().then(() => {
            switch (effect) {
                case 'add':
                    new window.Tone.Synth().toDestination().triggerAttackRelease("C5", "8n", now);
                    break;
                case 'complete':
                    new window.Tone.Synth().toDestination().triggerAttackRelease("E6", "8n", now);
                    break;
                case 'achievement':
                    new window.Tone.PluckSynth().toDestination().triggerAttackRelease("C7", "8n", now);
                    break;
                default:
                    break;
            }
        });
    };
    
    useEffect(() => {
        const allDataLoaded = tasksLoaded && templatesLoaded && statsLoaded && achievementsLoaded && themeLoaded && groveLoaded && categoriesLoaded && launchedLoaded && journalLoaded && customThemesLoaded && shutdownTimeLoaded && soundEffectsLoaded && autoArchiveLoaded && notificationsLoaded;
        if (allDataLoaded) {
             if (!hasLaunched) {
                setTasks(demoTasks);
                setHasLaunched(true);
            }
            setTimeout(() => setIsLoading(false), 1500);
            
            if(!window.Tone) {
                const script = document.createElement('script');
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js";
                script.async = true;
                script.onload = () => console.log('Tone.js loaded');
                document.body.appendChild(script);
            }
        }
    }, [tasksLoaded, templatesLoaded, statsLoaded, achievementsLoaded, themeLoaded, groveLoaded, categoriesLoaded, launchedLoaded, journalLoaded, customThemesLoaded, shutdownTimeLoaded, soundEffectsEnabled, autoArchiveLoaded, notificationsLoaded, hasLaunched]);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        const hour = new Date().getHours(); 
        if (hour >= 5 && hour < 12) setTimeOfDay('morning'); 
        else if (hour >= 12 && hour < 17) setTimeOfDay('day'); 
        else if (hour >= 17 && hour < 20) setTimeOfDay('evening'); 
        else setTimeOfDay('night');
    }, [isSettingsOpen, focusTaskId, currentView, isSearchOpen, detailModal.isOpen, isMindfulMinuteOpen, isThemeCreatorOpen, isArchiveOpen, isShareSummaryOpen]);

    useEffect(() => {
        if (!isLoading) {
             checkAchievements(); 
             updateStreakAndArchive();
             runAssistant();
        }
    }, [tasks, stats, isLoading, grove, shutdownTime]);

    const runAssistant = () => {
        const lastPromptKey = 'aura-last-assistant-prompt';
        const lastPromptDate = localStorage.getItem(lastPromptKey);
        if(lastPromptDate === getTodayDateString()) return;

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
    };

    const addTask = (text, applyTemplate = null) => {
        playSoundEffect('add');
        if (applyTemplate) { 
            const template = templates.find(t => t.name === applyTemplate); 
            if (!template) return; 
            const newTasks = template.tasks.map(t => ({...t, id: Date.now() + Math.random(), subtasks: [], win: null, completionDate: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false })); 
            setTasks(prev => [...prev, ...newTasks]); 
            setTemplateSuggestion(null); 
            return; 
        }
        if (templateSuggestion) { setTemplateSuggestion(null); }
        
        const matchingTemplate = templates.find(t => text.toLowerCase().includes(t.name.toLowerCase()));
        if(matchingTemplate) { setTemplateSuggestion({ templateName: matchingTemplate.name, taskText: text }); return; }

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
        
        const newTask = { id: Date.now(), text: cleanedText.replace(/  +/g, ' ').trim(), completed: false, priority, category, timeOfDay: time, deadline, subtasks: [], win: null, completionDate: null, recurring, notes: '', attachments: [], tags, isPinned: false, focusSessions: 0, isArchived: false };
        setTasks(prevTasks => [...prevTasks, newTask]);
    };
    
    const toggleTask = async (id) => {
        setTasks(prevTasks => {
            let taskToToggle = prevTasks.find(t => t.id === id);
            if (!taskToToggle) return prevTasks;

            const isCompleting = !taskToToggle.completed;
            if (isCompleting) {
                playSoundEffect('complete');
            }

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

            if (taskToToggle.recurring) {
                const completedInstance = { ...taskToToggle, id: Date.now(), completed: true, recurring: null, completionDate: getTodayDateString() };
                newTasks.push(completedInstance);
            }

            if (isCompleting) {
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

            return newTasks;
        });
    };

    const togglePin = (id) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    };
    
    const handleSkipWin = (id) => {
        setWinModalTaskId(null);
    };

    const saveWin = (id, winText) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, win: winText } : t));
        setWinModalTaskId(null);
    };
    
    const deleteTask = async (id) => {
        const taskToDelete = tasks.find(t => t.id === id);
        if (taskToDelete && taskToDelete.attachments) {
            for (const att of taskToDelete.attachments) {
                await deleteFile(att.id);
            }
        }
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    };

    const archiveTask = (id) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, isArchived: true } : t));
    };

    const restoreTask = (id) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, isArchived: false } : t));
    };

    const saveTaskDetail = (id, newText, newNotes, newTags) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, text: newText, notes: newNotes, tags: newTags } : t));
    };

    const setTaskDependency = (taskId, dependencyId) => {
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, dependsOn: dependencyId } : t));
    };

    const addAttachmentToTask = async (taskId, file) => {
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
    };

    const deleteAttachmentFromTask = async (taskId, attachment) => {
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
    };

    const saveTemplate = (category, tasksToSave) => {
        const templateTasks = tasksToSave.map(t => ({ text: t.text, category: t.category, priority: t.priority, timeOfDay: t.timeOfDay }));
        setTemplates(prev => [...prev, { name: category, tasks: templateTasks }]);
    };
    
    const handlePlantSeed = () => {
        if (stats.goldenSeeds > 0) {
            setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds - 1 }));
            setIsPlanting(true);
        }
    };
    
    const finishPlanting = () => {
        const unlockedTrees = ['oak'];
        if(unlockedAchievements.includes('streak_3')) unlockedTrees.push('pine');
        if(unlockedAchievements.includes('focused_finish')) unlockedTrees.push('cherry');
        const randomType = unlockedTrees[Math.floor(Math.random() * unlockedTrees.length)];
        
        setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: randomType }]);
        setIsPlanting(false);
    };

    const reorderTask = (taskId, direction) => {
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
    };

    const toggleSubtask = (taskId, subtaskText) => {
        setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === taskId) {
                const newSubtasks = task.subtasks.map(st => st.text === subtaskText ? { ...st, completed: !st.completed } : st);
                return { ...task, subtasks: newSubtasks };
            }
            return task;
        }));
    };
    
    const checkAchievements = () => {
        for (const achievement of achievementsList) {
            if (!unlockedAchievements.includes(achievement.id) && achievement.check(tasks, stats, grove)) {
                setUnlockedAchievements(prev => [...prev, achievement.id]);
                setAchievementToast(achievement);
                playSoundEffect('achievement');
                setTimeout(() => setAchievementToast(null), 4000);
            }
        }
    };
    
    const updateStreakAndArchive = () => {
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
    };

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
    }, [tasksCompletedToday, isLoading]);

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

    const handleFocusComplete = (taskId) => {
        toggleTask(taskId);
        setStats(s => ({...s, focusedTasksCompleted: s.focusedTasksCompleted + 1}));
        setTasks(prevTasks => prevTasks.map(t => 
            t.id === taskId ? {...t, focusSessions: (t.focusSessions || 0) + 1} : t
        ));
        showNotification("Focus session complete!", {
            body: `Great work on: ${tasks.find(t => t.id === taskId)?.text}`,
        });
    };

    const handleExport = () => {
        const data = { tasks, templates, stats, unlockedAchievements, theme, grove, customCategories, hasLaunched, journalEntries, customThemes, shutdownTime, soundEffectsEnabled, autoArchiveEnabled, notificationsEnabled };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `aura-backup-${getTodayDateString()}.json`;
        link.click();
        setToastMessage({ type: 'success', text: 'Data exported successfully!' });
    };

    const handleImport = (e) => {
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
    };

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

    const commands = [
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
    ];

    return (
        <div className={`theme-wrapper theme-${theme} min-h-screen font-sans antialiased bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col`}>
            <ThemeBackground theme={theme} />
            <AnimatePresence>
                {isLoading && <LoadingScreen key="loading" />}
            </AnimatePresence>

            {!isLoading && (
                 <motion.div
                    key="main-app"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col flex-grow main-container"
                >
                    <main className="flex-grow pt-8 pb-48 px-4 sm:px-6 lg:px-8 relative z-10">
                        <Header momentumProgress={momentumProgress} onSettingsClick={() => setIsSettingsOpen(true)} onSearchClick={() => setIsSearchOpen(true)} onMindfulClick={() => setIsMindfulMinuteOpen(true)} dailyQuote={dailyQuote} onShare={() => setIsShareSummaryOpen(true)} />
                        <AnimatePresence>
                        {assistantMessage && <AssistantPrompt 
                            message={assistantMessage.message} 
                            action={assistantMessage.action} 
                            onAction={() => {}} 
                            onClose={() => setAssistantMessage(null)} 
                            showNext={shutdownRitual.active && shutdownRitual.step < shutdownRitualMessages.length -1}
                            onNext={() => {
                                setShutdownRitual(s => ({...s, step: s.step + 1}));
                                if (shutdownRitual.step >= shutdownRitualMessages.length -2) {
                                    setShutdownRitual({active: false, step: 0});
                                }
                            }}
                        />}
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                            {currentView === 'flow' && <FlowView key="flow" tasks={filteredTasks} toggleTask={toggleTask} deleteTask={deleteTask} onFocus={setFocusTaskId} activeFilter={activeFilter} setActiveFilter={setActiveFilter} onReorder={reorderTask} onToggleSubtask={toggleSubtask} allTasks={tasks} allCategories={allCategories} onOpenDetail={(id) => setDetailModal({isOpen: true, taskId: id})} onTogglePin={togglePin} onArchive={archiveTask} />}
                            {currentView === 'constellations' && <ConstellationsView key="constellations" tasks={tasks} toggleTask={toggleTask} onSaveTemplate={saveTemplate} templates={templates} allCategories={allCategories} />}
                            {currentView === 'grove' && <GroveView key="grove" tasks={tasks} grove={grove} goldenSeeds={stats.goldenSeeds} onPlantSeed={handlePlantSeed} allCategories={allCategories} />}
                            {currentView === 'journal' && <JournalView key="journal" journalEntries={journalEntries} setJournalEntries={setJournalEntries} completedTasks={tasks.filter(t => t.completed && !t.isArchived)} />}
                            {currentView === 'review' && <ReviewView key="review" tasks={tasks} achievements={unlockedAchievements} allCategories={allCategories} stats={stats} onDeleteStale={deleteTask} />}
                        </AnimatePresence>
                    </main>
                    <CaptureInput onAddTask={addTask} />
                    <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
                    <AnimatePresence>{isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} setTheme={setTheme} customCategories={customCategories} setCustomCategories={setCustomCategories} allThemes={allThemes} onOpenThemeCreator={() => setIsThemeCreatorOpen(true)} shutdownTime={shutdownTime} onSetShutdownTime={setShutdownTime} soundEffectsEnabled={soundEffectsEnabled} onSetSoundEffectsEnabled={setSoundEffectsEnabled} onOpenArchive={() => setIsArchiveOpen(true)} autoArchiveEnabled={autoArchiveEnabled} onSetAutoArchiveEnabled={setAutoArchiveEnabled} onExport={handleExport} onTriggerImport={() => importInputRef.current?.click()} notificationsEnabled={notificationsEnabled} onSetNotificationsEnabled={handleSetNotifications}/>}</AnimatePresence>
                    <AnimatePresence>{isPlanting && <PlantingAnimation onComplete={finishPlanting} />}</AnimatePresence>
                    <AnimatePresence>{focusTask && <FocusView task={focusTask} onClose={() => setFocusTaskId(null)} onComplete={handleFocusComplete} />}</AnimatePresence>
                    <AnimatePresence>{winModalTaskId && <WinModal task={tasks.find(t => t.id === winModalTaskId)} onSaveWin={saveWin} onClose={() => handleSkipWin(winModalTaskId)} />}</AnimatePresence>
                    <AnimatePresence>{achievementToast && <AchievementToast achievement={achievementToast} onClose={() => setAchievementToast(null)} />}</AnimatePresence>
                    <AnimatePresence>{toastMessage && <GenericToast message={toastMessage} onClose={() => setToastMessage(null)} />}</AnimatePresence>
                    <AnimatePresence><SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} tasks={tasks.filter(t=>!t.isArchived)} toggleTask={toggleTask} deleteTask={deleteTask} onFocus={setFocusTaskId} onReorder={reorderTask} onToggleSubtask={toggleSubtask} allCategories={allCategories} onOpenDetail={(id) => setDetailModal({isOpen: true, taskId: id})} onTogglePin={togglePin} onArchive={archiveTask} /></AnimatePresence>
                    <AnimatePresence><TaskDetailModal isOpen={detailModal.isOpen} onClose={() => setDetailModal({isOpen: false, taskId: null})} task={detailTask} onSave={saveTaskDetail} onSetDependency={setTaskDependency} allTasks={tasks.filter(t=>!t.isArchived)} onAddAttachment={addAttachmentToTask} onDeleteAttachment={deleteAttachmentFromTask} /></AnimatePresence>
                    <AnimatePresence><MindfulMinuteModal isOpen={isMindfulMinuteOpen} onClose={() => setIsMindfulMinuteOpen(false)} /></AnimatePresence>
                    <AnimatePresence><ThemeCreatorModal isOpen={isThemeCreatorOpen} onClose={() => setIsThemeCreatorOpen(false)} onSave={(newTheme) => setCustomThemes(ct => [...ct, newTheme])} /></AnimatePresence>
                    <AnimatePresence><ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} archivedTasks={tasks.filter(t=>t.isArchived)} onRestore={restoreTask} onDelete={deleteTask} /></AnimatePresence>
                    <AnimatePresence><ShareSummaryModal isOpen={isShareSummaryOpen} onClose={() => setIsShareSummaryOpen(false)} dailyStats={dailyStats} /></AnimatePresence>
                    <AnimatePresence><CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} /></AnimatePresence>
                    <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".json" />
                </motion.div>
            )}
            <style>{`
                :root { --color-accent: #34d399; }
                .theme-wrapper { position: relative; min-height: 100vh; overflow: hidden; }
                .theme-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 0; transition: background 0.5s ease-in-out; }
                
                @keyframes pulse-aura { 0%, 100% { box-shadow: inset 0 0 120px 20px #000, inset 0 0 40px -10px var(--color-accent); } 50% { box-shadow: inset 0 0 120px 20px #000, inset 0 0 40px 10px var(--color-accent); } }
                @keyframes scanline { 0% { background-position: 0 0; } 100% { background-position: 0 100%; } }
                @keyframes wave-move { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
                @keyframes falling-petals { 0% { transform: translateY(-10%) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
                @keyframes particle-drift { 0% { transform: translateY(0) translateX(0); opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { transform: translateY(-100px) translateX(20px); opacity: 0; } }
                @keyframes soft-light { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes wind-blow { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                @keyframes ember-glow { 0% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.1); } 100% { opacity: 0.2; transform: scale(1); } }

                .theme-dark { --color-bg: #000000; --color-bg-secondary: #111827; --color-bg-secondary-hover: #1f2937; --color-bg-input: #11182780; --color-text-primary: #f9fafb; --color-text-secondary: #9ca3af; --color-border: #374151; --color-accent: #2dd4bf; }
                .theme-light { --color-bg: #f9fafb; --color-bg-secondary: #ffffff; --color-bg-secondary-hover: #f3f4f6; --color-bg-input: #ffffff80; --color-text-primary: #1f2937; --color-text-secondary: #6b7280; --color-border: #d1d5db; --color-accent: #10b981; }
                .theme-cyberpunk { --color-bg: #0d0221; --color-bg-secondary: #1a021d99; --color-bg-secondary-hover: #2e043399; --color-bg-input: #1a021d80; --color-text-primary: #f0fdf4; --color-text-secondary: #a78bfa; --color-border: #ec4899; --color-accent: #06b6d4; }
                .theme-crimson { --color-bg: #120000; --color-bg-secondary: #2c0b0e; --color-bg-secondary-hover: #401014; --color-bg-input: #2c0b0e80; --color-text-primary: #fef2f2; --color-text-secondary: #fca5a5; --color-border: #7f1d1d; --color-accent: #ef4444; }
                .theme-forest { --color-bg: #0b2e13; --color-bg-secondary: #11421c; --color-bg-secondary-hover: #165329; --color-bg-input: #0b2e1380; --color-text-primary: #f0fff4; --color-text-secondary: #a3b899; --color-border: #2f603a; --color-accent: #34d399; }
                .theme-ocean { --color-bg: #021027; --color-bg-secondary: #002b4d; --color-bg-secondary-hover: #003366; --color-bg-input: #001f3f80; --color-text-primary: #e0f7fa; --color-text-secondary: #81d4fa; --color-border: #0288d1; --color-accent: #29b6f6; }
                .theme-dune { --color-bg: #422d1c; --color-bg-secondary: #5a3d2b; --color-bg-secondary-hover: #734d3a; --color-bg-input: #422d1c80; --color-text-primary: #fdf6e3; --color-text-secondary: #e3d5b8; --color-border: #7a5c35; --color-accent: #f59e0b; }
                .theme-sakura { --color-bg: #fff0f3; --color-bg-secondary: #ffffff; --color-bg-secondary-hover: #fdf2f2; --color-bg-input: #ffffff80; --color-text-primary: #5e2d2d; --color-text-secondary: #c08497; --color-border: #f2d7d9; --color-accent: #ef4444; }
                .theme-solarized { --color-bg: #002b36; --color-bg-secondary: #073642; --color-bg-secondary-hover: #0a4657; --color-bg-input: #07364280; --color-text-primary: #eee8d5; --color-text-secondary: #93a1a1; --color-border: #268bd2; --color-accent: #2aa198; }
                .theme-dracula { --color-bg: #282a36; --color-bg-secondary: #44475a; --color-bg-secondary-hover: #5a5e78; --color-bg-input: #44475a80; --color-text-primary: #f8f8f2; --color-text-secondary: #bd93f9; --color-border: #6272a4; --color-accent: #50fa7b; }
                .theme-nord { --color-bg: #2E3440; --color-bg-secondary: #3B4252; --color-bg-secondary-hover: #434C5E; --color-bg-input: #3B425280; --color-text-primary: #E5E9F0; --color-text-secondary: #81A1C1; --color-border: #4C566A; --color-accent: #88C0D0; }
                .theme-gruvbox { --color-bg: #282828; --color-bg-secondary: #3c3836; --color-bg-secondary-hover: #504945; --color-bg-input: #3c383680; --color-text-primary: #ebdbb2; --color-text-secondary: #b8bb26; --color-border: #665c54; --color-accent: #fe8019; }
                .theme-monokai { --color-bg: #272822; --color-bg-secondary: #3E3D32; --color-bg-secondary-hover: #49483E; --color-bg-input: #3E3D3280; --color-text-primary: #F8F8F2; --color-text-secondary: #E6DB74; --color-border: #75715E; --color-accent: #A6E22E; }
                .theme-rose_pine { --color-bg: #191724; --color-bg-secondary: #1f1d2e; --color-bg-secondary-hover: #26233a; --color-bg-input: #1f1d2e80; --color-text-primary: #e0def4; --color-text-secondary: #c4a7e7; --color-border: #eb6f92; --color-accent: #31748f; }
                .theme-matcha { --color-bg: #243029; --color-bg-secondary: #354a3d; --color-bg-secondary-hover: #425c4d; --color-bg-input: #354a3d80; --color-text-primary: #d8d8d8; --color-text-secondary: #88b495; --color-border: #557e62; --color-accent: #73c088; }
                .theme-latte { --color-bg: #eff1f5; --color-bg-secondary: #e6e9ef; --color-bg-secondary-hover: #dce0e8; --color-bg-input: #e6e9ef80; --color-text-primary: #4c4f69; --color-text-secondary: #fe640b; --color-border: #bcc0cc; --color-accent: #1e66f5; }

                .theme-bg-dark { animation: pulse-aura 8s infinite ease-in-out; }
                .theme-bg-light { background: radial-gradient(circle, #ffffff 0%, #e5e7eb 100%); background-size: 200% 200%; animation: soft-light 25s infinite alternate; }
                .theme-bg-cyberpunk { background-image: linear-gradient(rgba(13, 2, 33, 0.8), rgba(13, 2, 33, 0.8)), linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px); background-size: 100% 100%, 50px 50px, 50px 50px; }
                .theme-bg-cyberpunk::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%); background-size: 100% 4px; animation: scanline 2s linear infinite; opacity: 0.1; }
                .theme-bg-crimson::before { content:''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at center, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 70%); animation: ember-glow 10s infinite alternate; }
                .theme-bg-forest { background-color: var(--color-bg); }
                .forest-particles .particle { position: absolute; background: var(--color-accent); border-radius: 50%; width: 4px; height: 4px; opacity: 0; animation: particle-drift 10s infinite ease-in-out; }
                .forest-particles .particle:nth-child(1) { bottom: 0; left: 10%; animation-delay: 1s; } .forest-particles .particle:nth-child(2) { bottom: 0; left: 80%; animation-delay: 3s; } .forest-particles .particle:nth-child(3) { bottom: 0; left: 50%; animation-delay: 5s; width: 2px; height: 2px; } .forest-particles .particle:nth-child(4) { bottom: 0; left: 25%; animation-delay: 2s; } .forest-particles .particle:nth-child(5) { bottom: 0; left: 90%; animation-delay: 4s; }
                .theme-bg-ocean { overflow: hidden; }
                .theme-bg-ocean::before, .theme-bg-ocean::after { content: ''; position: absolute; left: -50%; right: -50%; height: 500px; background: rgba(41, 182, 246, 0.1); border-radius: 45%; }
                .theme-bg-ocean::before { bottom: -400px; animation: wave-move 10s linear infinite; }
                .theme-bg-ocean::after { bottom: -420px; animation: wave-move 15s linear -5s infinite; opacity: 0.7; }
                .theme-bg-dune { background-color: #422d1c; background-image: url('https://www.transparenttextures.com/patterns/sand.png'); overflow: hidden; }
                .theme-bg-dune::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%); width: 200%; animation: wind-blow 20s infinite ease-in-out; opacity: 0.5;}
                .theme-bg-sakura { background-color: var(--color-bg); overflow: hidden; }
                .sakura-petals .petal { position: absolute; top: -10%; animation: falling-petals 20s linear infinite; opacity: 0.8; font-size: 1.5rem; }
                .sakura-petals .petal:nth-child(1) { left: 10%; animation-delay: 0s; } .sakura-petals .petal:nth-child(2) { left: 20%; animation-delay: -5s; animation-duration: 15s; } .sakura-petals .petal:nth-child(3) { left: 30%; animation-delay: -3s; } .sakura-petals .petal:nth-child(4) { left: 40%; animation-delay: -8s; animation-duration: 18s; } .sakura-petals .petal:nth-child(5) { left: 50%; animation-delay: -1s; } .sakura-petals .petal:nth-child(6) { left: 60%; animation-delay: -6s; animation-duration: 16s; } .sakura-petals .petal:nth-child(7) { left: 70%; animation-delay: -2s; } .sakura-petals .petal:nth-child(8) { left: 80%; animation-delay: -9s; animation-duration: 14s; } .sakura-petals .petal:nth-child(9) { left: 90%; animation-delay: -4s; }

                @keyframes sun-ray-rotate { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                .light-bg .sun-rays { position: absolute; top: 0; left: 0; width: 200vw; height: 200vh; background: conic-gradient(from 0deg at 50% 50%, rgba(253, 224, 71, 0.15) 0deg 5deg, transparent 5deg 30deg); animation: sun-ray-rotate 120s linear infinite; }

                @keyframes firefly-blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; box-shadow: 0 0 5px #fde047, 0 0 10px #fde047; } }
                @keyframes firefly-move { 0% { transform: translate(var(--x-start), var(--y-start)); } 100% { transform: translate(var(--x-end), var(--y-end)); } }
                .forest-bg { position: absolute; inset: 0; overflow: hidden; }
                .fireflies .firefly { position: absolute; top: 50%; left: 50%; width: 4px; height: 4px; background: #fde047; border-radius: 50%; animation: firefly-blink 3s infinite, firefly-move 10s infinite alternate; }
                .fireflies .firefly:nth-child(1) { --x-start: -40vw; --y-start: -30vh; --x-end: 40vw; --y-end: 30vh; animation-duration: 10s, 15s; animation-delay: -1s; }
                .fireflies .firefly:nth-child(2) { --x-start: 30vw; --y-start: 20vh; --x-end: -30vw; --y-end: -20vh; animation-duration: 2s, 12s; animation-delay: -3s; }
                .fireflies .firefly:nth-child(3) { --x-start: 0vw; --y-start: 40vh; --x-end: 10vw; --y-end: -40vh; animation-duration: 4s, 18s; animation-delay: -5s; }
                .forest-trees { position: absolute; bottom: 0; left: 0; right: 0; height: 40%; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 120"><path d="M0 120 L 50 40 L 100 120 L 80 120 L 130 20 L 180 120 L 160 120 L 210 50 L 260 120 L 240 120 L 290 30 L 340 120 L 320 120 L 370 60 L 420 120 L 400 120 L 450 10 L 500 120 L 480 120 L 530 40 L 580 120 L 560 120 L 610 50 L 660 120 L 640 120 L 690 20 L 740 120 L 720 120 L 770 60 L 800 120 Z" fill="rgba(0,0,0,0.5)"/></svg>') bottom/cover repeat-x; }

                @keyframes fly-bat {
                    0% { transform: translateX(-10vw) scale(0.8) translateY(var(--y-start)) rotate(-15deg); opacity: 0; }
                    10% { opacity: 0.7; }
                    50% { transform: translateX(50vw) scale(1.2) translateY(calc(var(--y-start) - 5vh)) rotate(0deg); }
                    90% { opacity: 0.7; }
                    100% { transform: translateX(110vw) scale(0.8) translateY(var(--y-end)) rotate(15deg); opacity: 0; }
                }
                .dracula-bg { position: absolute; inset: 0; overflow: hidden; }
                .dracula-moon { position: absolute; top: 10%; right: 15%; width: 80px; height: 80px; border-radius: 50%; background-color: #f1fa8c; box-shadow: 0 0 20px #f1fa8c, 0 0 40px #f1fa8c, 0 0 60px #f1fa8c33; }
                .dracula-graveyard { position: absolute; bottom: 0; left: 0; right: 0; height: 30%; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 120"><path d="M0,120 L0,80 Q20,60 40,80 T80,80 T120,80 Q140,40 160,80 T200,80 L200,60 L210,60 L210,40 L220,40 L220,60 L230,60 L230,80 T280,80 Q300,20 320,80 T360,80 T400,80 Q420,50 440,80 T480,80 T520,80 Q540,60 560,80 T600,80 L600,50 L610,50 L610,30 L620,30 L620,50 L630,50 L630,80 T680,80 Q700,40 720,80 T760,80 T800,80 L800,120 Z" fill="rgba(0,0,0,0.8)"/></svg>') bottom/cover repeat-x; z-index: 2; }
                @keyframes fog-move { 0% { transform: translateX(-10%); } 100% { transform: translateX(10%); } }
                .dracula-fog { position: absolute; bottom: 0; left: -20%; width: 140%; height: 40%; background: linear-gradient(transparent, rgba(40, 42, 54, 0.8)); animation: fog-move 20s infinite alternate ease-in-out; z-index: 3; }
                .dracula-bats .bat { position: absolute; top: 0; left: 0; font-size: 1.5rem; animation: fly-bat linear infinite; color: #000; }
                .dracula-bats .bat:nth-child(1) { --y-start: 10vh; --y-end: 15vh; animation-duration: 15s; animation-delay: 0s; }
                .dracula-bats .bat:nth-child(2) { --y-start: 20vh; --y-end: 18vh; animation-duration: 12s; animation-delay: -2s; font-size: 1rem; }
                .dracula-bats .bat:nth-child(3) { --y-start: 30vh; --y-end: 40vh; animation-duration: 18s; animation-delay: -5s; }
                .dracula-bats .bat:nth-child(4) { --y-start: 50vh; --y-end: 45vh; animation-duration: 10s; animation-delay: -1s; font-size: 1.2rem; }
                .dracula-bats .bat:nth-child(5) { --y-start: 60vh; --y-end: 65vh; animation-duration: 20s; animation-delay: -8s; }
                .dracula-bats .bat:nth-child(6) { --y-start: 80vh; --y-end: 70vh; animation-duration: 16s; animation-delay: -3s; font-size: 1.1rem; }
                .dracula-bats .bat:nth-child(7) { --y-start: 90vh; --y-end: 85vh; animation-duration: 13s; animation-delay: -6s; }

                @keyframes code-drift-up { 0% { transform: translateY(110vh); } 100% { transform: translateY(-10vh); } }
                .cyber-code { position: absolute; inset: 0; overflow: hidden; }
                .cyber-code .code-char { content: var(--char); position: absolute; bottom: 0; color: var(--color-accent); font-family: monospace; font-size: 1rem; animation: code-drift-up linear infinite; text-shadow: 0 0 5px var(--color-accent); }
                .cyber-code .code-char::before { content: var(--char); }
                .cyber-code .code-char:nth-child(1){ left: 2%; animation-duration: 10s; animation-delay: -2s; } .cyber-code .code-char:nth-child(2){ left: 4%; animation-duration: 15s; animation-delay: -5s; } .cyber-code .code-char:nth-child(3){ left: 6%; animation-duration: 9s; animation-delay: -7s; } .cyber-code .code-char:nth-child(4){ left: 8%; animation-duration: 11s; animation-delay: -3s; } .cyber-code .code-char:nth-child(5){ left: 10%; animation-duration: 18s; animation-delay: -10s; } .cyber-code .code-char:nth-child(6){ left: 12%; animation-duration: 8s; animation-delay: -1s; } .cyber-code .code-char:nth-child(7){ left: 14%; animation-duration: 14s; animation-delay: -4s; } .cyber-code .code-char:nth-child(8){ left: 16%; animation-duration: 12s; animation-delay: -6s; } .cyber-code .code-char:nth-child(9){ left: 18%; animation-duration: 16s; animation-delay: -8s; } .cyber-code .code-char:nth-child(10){ left: 20%; animation-duration: 7s; animation-delay: -9s; }
                .cyber-code .code-char:nth-child(11){ left: 22%; animation-duration: 13s; animation-delay: 0s; } .cyber-code .code-char:nth-child(12){ left: 24%; animation-duration: 10s; animation-delay: -12s; } .cyber-code .code-char:nth-child(13){ left: 26%; animation-duration: 17s; animation-delay: -11s; } .cyber-code .code-char:nth-child(14){ left: 28%; animation-duration: 9s; animation-delay: -1s; } .cyber-code .code-char:nth-child(15){ left: 30%; animation-duration: 12s; animation-delay: -3.5s; } .cyber-code .code-char:nth-child(16){ left: 32%; animation-duration: 15s; animation-delay: -14s; } .cyber-code .code-char:nth-child(17){ left: 34%; animation-duration: 8s; animation-delay: -2.5s; } .cyber-code .code-char:nth-child(18){ left: 36%; animation-duration: 11s; animation-delay: -5.5s; } .cyber-code .code-char:nth-child(19){ left: 38%; animation-duration: 14s; animation-delay: -8.5s; } .cyber-code .code-char:nth-child(20){ left: 40%; animation-duration: 13s; animation-delay: -6.5s; }
                .cyber-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px); background-size: 50px 50px; opacity: 0.2; }

                @keyframes mist-rise { 0% { transform: translateY(10vh) scale(1) rotate(0deg); opacity: 0; } 50% { opacity: 0.2; } 100% { transform: translateY(-10vh) scale(2.5) rotate(30deg); opacity: 0; } }
                @keyframes ember-float { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-100vh) scale(0); opacity: 0; } }
                .crimson-bg { position: absolute; inset: 0; overflow: hidden; }
                .crimson-mist .mist-particle { position: absolute; bottom: 0; width: 150%; height: 80px; background: radial-gradient(circle, var(--color-accent) 0%, transparent 60%); border-radius: 50%; animation: mist-rise 20s infinite ease-in-out; }
                .crimson-mist .mist-particle:nth-child(1) { left: -50%; animation-delay: 0s; } .crimson-mist .mist-particle:nth-child(2) { left: -30%; animation-delay: -5s; animation-duration: 25s; } .crimson-mist .mist-particle:nth-child(3) { left: 0%; animation-delay: -10s; }
                .crimson-embers .ember { position: absolute; bottom: -10px; width: 3px; height: 3px; background: #ffca28; border-radius: 50%; box-shadow: 0 0 5px #ffca28, 0 0 10px #ff8f00; animation: ember-float linear infinite; }
                .crimson-embers .ember:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: -1s; } .crimson-embers .ember:nth-child(2) { left: 80%; animation-duration: 12s; animation-delay: -3s; } .crimson-embers .ember:nth-child(3) { left: 50%; animation-duration: 6s; animation-delay: -2s; } .crimson-embers .ember:nth-child(4) { left: 95%; animation-duration: 10s; animation-delay: -5s; } .crimson-embers .ember:nth-child(5) { left: 25%; animation-duration: 15s; animation-delay: -4s; }

                @keyframes caustics-shimmer { 0%, 100% { transform: scale(1.5) translate(-10%, -10%); opacity: 0.1; } 50% { transform: scale(1.5) translate(10%, 10%); opacity: 0.2; } }
                @keyframes fish-swim { 0% { transform: translateX(-20vw); } 100% { transform: translateX(120vw); } }
                .ocean-bg { position: absolute; inset: 0; overflow: hidden; }
                .ocean-caustics { position: absolute; inset: -50%; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><filter id="f"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.005" numOctaves="3" seed="2"/></filter><rect width="100%" height="100%" filter="url(%23f)"/></svg>'); animation: caustics-shimmer 20s infinite alternate; }
                .ocean-bubbles .bubble { position: absolute; bottom: -20px; width: var(--size); height: var(--size); background: var(--color-text-secondary); border-radius: 50%; opacity: 0; animation: bubble-rise linear infinite; box-shadow: inset 0 0 5px rgba(255,255,255,0.5); }
                .ocean-bubbles .bubble:nth-child(1) { left: 10%; --size: 10px; animation-duration: 15s; animation-delay: -2s;} .ocean-bubbles .bubble:nth-child(2) { left: 20%; --size: 5px; animation-duration: 10s; animation-delay: -18s;} .ocean-bubbles .bubble:nth-child(3) { left: 80%; --size: 12px; animation-duration: 18s; animation-delay: -5s;}
                .ocean-fauna .fish-group { position: absolute; top: 30%; color: var(--color-text-secondary); opacity: 0.3; font-size: 1.5rem; animation: fish-swim 30s linear infinite; animation-delay: -5s; }
                .ocean-fauna .fish-group-2 { top: 70%; animation-duration: 45s; animation-delay: -20s; font-size: 1rem; opacity: 0.2; }

                @keyframes sand-sweep { 0% { transform: translateX(-10vw) translateY(0) rotate(var(--r-start)); opacity: 0; } 10% { opacity: var(--opacity); } 90% { opacity: var(--opacity); } 100% { transform: translateX(110vw) translateY(20px) rotate(var(--r-end)); opacity: 0; } }
                @keyframes heat-haze { 0%, 100% { transform: skewX(0); } 50% { transform: skewX(0.5deg); } }
                .dune-sand { position: absolute; inset: 0; overflow: hidden; }
                .dune-haze { position: absolute; inset: 0; animation: heat-haze 5s infinite alternate; }
                .dune-sand .sand-particle { position: absolute; width: 3px; height: 1px; background: var(--color-text-secondary); border-radius: 50%; animation: sand-sweep linear infinite; --opacity: 0.2; }
                .dune-sand .sand-particle:nth-child(3n) { --opacity: 0.4; transform-origin: left; }
                .dune-sand .sand-particle:nth-child(1) { top: 20%; --r-start:-10deg; --r-end: 10deg; animation-duration: 5s; animation-delay: -0.5s; } .dune-sand .sand-particle:nth-child(2) { top: 50%; --r-start:5deg; --r-end: -5deg; animation-duration: 4s; animation-delay: -1s; } .dune-sand .sand-particle:nth-child(3) { top: 80%; --r-start:-5deg; --r-end: 5deg; animation-duration: 6s; animation-delay: -0.5s; }
                
                @keyframes blueprint-scroll { from { background-position: 0 0; } to { background-position: 0 -100px; } }
                @keyframes draw-trace { to { stroke-dashoffset: 0; } }
                .solarized-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px), linear-gradient(rgba(0,0,0,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.1) 2px, transparent 2px); background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px; opacity: 0.3; animation: blueprint-scroll 5s linear infinite; }
                .solarized-traces { position: absolute; inset: 0; opacity: 0.5; }
                .solarized-traces path { stroke: var(--color-accent); stroke-width: 1; fill: none; stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw-trace 10s infinite alternate; }
                .solarized-traces path:nth-child(2) { animation-delay: -5s; }
                
                @keyframes aurora-sweep { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                .nord-bg { position: absolute; inset: 0; overflow: hidden; }
                .aurora { position: absolute; inset: 0; }
                .aurora-band { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, var(--color-accent), transparent); opacity: 0.15; filter: blur(20px); mix-blend-mode: screen; transform-origin: top; animation: aurora-sweep 20s infinite linear; }
                .aurora-band:nth-child(2) { animation-duration: 25s; animation-delay: -5s; background: linear-gradient(90deg, transparent, var(--color-text-secondary), transparent); }
                .aurora-band:nth-child(3) { animation-duration: 30s; animation-delay: -10s; background: linear-gradient(90deg, transparent, #5E81AC, transparent); }
                .nord-snow .snow-flake { position: absolute; top: -10px; background: var(--color-text-secondary); border-radius: 50%; opacity: 0.8; animation: snow-fall linear infinite; }
                .nord-snow .snow-flake:nth-child(1) { left: 10%; width: 5px; height: 5px; animation-duration: 10s; animation-delay: -2s; } .nord-snow .snow-flake:nth-child(2) { left: 25%; width: 2px; height: 2px; animation-duration: 15s; animation-delay: -5s; } .nord-snow .snow-flake:nth-child(3) { left: 40%; width: 4px; height: 4px; animation-duration: 8s; animation-delay: -1s; } .nord-snow .snow-flake:nth-child(4) { left: 70%; width: 3px; height: 3px; animation-duration: 12s; animation-delay: -7s; } .nord-snow .snow-flake:nth-child(5) { left: 85%; width: 5px; height: 5px; animation-duration: 9s; animation-delay: -4s; }

                @keyframes scanlines-anim { from { background-position: 0 0; } to { background-position: 0 100%; } }
                .scanlines { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 51%); background-size: 100% 4px; animation: scanlines-anim 4s linear infinite; opacity: 0.2; }
                .monokai-glitch::after, .monokai-glitch::before { content:'AURA'; position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 8rem; font-weight: 900; letter-spacing: 0.2em; color: var(--color-text-primary); width: 100%; text-align: center; }
                .monokai-glitch::before { color: var(--color-accent); animation: glitch-anim 2s infinite linear alternate-reverse; z-index: -2;}
                .monokai-glitch::after { color: var(--color-text-secondary); animation: glitch-anim 1.5s infinite linear alternate-reverse; z-index: -1; }

                @keyframes steam-rise { 0% { transform: translateY(0) scaleX(1); opacity: 0; } 20% { opacity: 0.1; } 80% { opacity: 0.05; } 100% { transform: translateY(-80vh) scaleX(0.2); opacity: 0; } }
                .latte-steam .steam-wisp { position: absolute; bottom: 0; width: 100%; height: 50px; background: linear-gradient(transparent, var(--color-border)); border-radius: 50%; filter: blur(10px); animation: steam-rise ease-in-out infinite; }
                .latte-steam .steam-wisp:nth-child(1) { animation-duration: 10s; animation-delay: 0s; transform-origin: 50% 100%; } .latte-steam .steam-wisp:nth-child(2) { animation-duration: 12s; animation-delay: -2s; } .latte-steam .steam-wisp:nth-child(3) { animation-duration: 8s; animation-delay: -5s; }

                .gruvbox-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px); background-size: 80px 80px; opacity: 0.1; }
                .gruvbox-gears .gear { position: absolute; color: var(--color-border); opacity: 0.2; animation: gear-spin linear infinite; }
                .gruvbox-gears .gear:nth-child(1) { top: 10%; left: 15%; font-size: 5rem; animation-duration: 20s; }
                .gruvbox-gears .gear:nth-child(2) { top: 30%; right: 10%; font-size: 8rem; animation-duration: 15s; animation-direction: reverse; }
                .gruvbox-gears .gear:nth-child(3) { bottom: 20%; left: 40%; font-size: 3rem; animation-duration: 10s; }
                
                @keyframes stars-fade { from { background-position: 0 0; } to { background-position: -10000px 5000px; } }
                @keyframes twinkling { 0% { opacity: 0.2; } 50% { opacity: 0.8; } 100% { opacity: 0.2; } }
                @keyframes nebula-swirl { 0% { transform: scale(1.2) rotate(0deg); opacity: 0.1; } 100% { transform: scale(1.5) rotate(5deg); opacity: 0.2; } }
                .rose_pine-sky { position: absolute; inset: 0; overflow: hidden; }
                .rose_pine-stars, .rose_pine-twinkling { position: absolute; inset: 0; background-image: radial-gradient(2px 2px at 20px 30px, var(--color-text-secondary), transparent), radial-gradient(2px 2px at 40px 70px, var(--color-text-secondary), transparent), radial-gradient(3px 3px at 50px 160px, var(--color-text-secondary), transparent), radial-gradient(2px 2px at 90px 40px, var(--color-text-secondary), transparent), radial-gradient(2px 2px at 130px 80px, var(--color-text-secondary), transparent), radial-gradient(2px 2px at 160px 120px, var(--color-text-secondary), transparent); background-repeat: repeat; background-size: 200px 200px; animation: stars-fade 200s linear infinite; }
                .rose_pine-twinkling { animation-name: twinkling; animation-duration: 3s; animation-iteration-count: infinite; animation-timing-function: ease-in-out; }
                .rose_pine-nebula { position: absolute; inset: -50%; background: radial-gradient(circle, var(--color-accent) 10%, var(--color-border) 40%, transparent 70%); animation: nebula-swirl 50s alternate infinite ease-in-out; }

                @keyframes ripple-anim { 0% { transform: scale(0); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
                .matcha-pond .ripple { position: absolute; border: 2px solid var(--color-border); border-radius: 50%; animation: ripple-anim 4s infinite; }
                .matcha-pond .ripple:nth-child(1) { top: 40%; left: 50%; width: 200px; height: 200px; }
                .matcha-pond .ripple:nth-child(2) { top: 60%; left: 30%; width: 300px; height: 300px; animation-delay: 2s; }
                .matcha-pond .ripple:nth-child(3) { top: 20%; left: 70%; width: 150px; height: 150px; animation-delay: 3s; }

                .main-container { padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }
                input[type="datetime-local"]::-webkit-calendar-picker-indicator, input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(var(--webkit-calendar-picker-indicator-invert, 0)); }
                input[type="color"]::-webkit-color-swatch-wrapper { padding: 0; }
                input[type="color"]::-webkit-color-swatch { border: none; border-radius: 4px; }

                .theme-dark, .theme-cyberpunk, .theme-crimson, .theme-forest, .theme-ocean, .theme-dune, .theme-rose_pine, .theme-solarized, .theme-dracula, .theme-nord, .theme-gruvbox, .theme-monokai, .theme-matcha { --webkit-calendar-picker-indicator-invert: 1; }
            `}</style>
        </div>
    );
}
