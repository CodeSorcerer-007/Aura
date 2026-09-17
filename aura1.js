import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- IndexedDB Helper for Local File Storage ---
const dbName = 'AuraDB';
const storeName = 'attachments';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject("Error opening IndexedDB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
};

const setFile = async (key, value) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
};

const getFile = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteFile = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
};


// --- Web-based Preferences Hook ---
const usePreferences = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadValue = () => {
            try {
                const item = window.localStorage.getItem(key);
                if (item !== null) {
                    setStoredValue(JSON.parse(item));
                }
            } catch (e) {
                console.error(`Error reading preference ${key}`, e);
                setStoredValue(initialValue);
            } finally {
                setIsLoaded(true);
            }
        };
        loadValue();
    }, [key]);

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (e) {
            console.error(`Error setting preference ${key}`, e);
        }
    };

    return [storedValue, setValue, isLoaded];
};


// --- SVG Icons (to keep everything in one file) ---
const SunIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>);
const MoonIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>);
const SunsetIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 10V2"></path><path d="m4.93 10.93 1.41 1.41"></path><path d="M2 18h2"></path><path d="M20 18h2"></path><path d="m19.07 10.93-1.41 1.41"></path><path d="M22 22H2"></path><path d="m16 6-4 4-4-4"></path><path d="M16 18a4 4 0 0 0-8 0"></path></svg>);
const PlusIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>);
const CheckIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"></path></svg>);
const SparklesIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9Z"/></svg>);
const LeafIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 20A7 7 0 0 1 4 13V8a5 5 0 0 1 10 0v5a7 7 0 0 1-7 7Z" /><path d="M20 8a5 5 0 0 0-10 0v5" /></svg>);
const CalendarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>);
const PlayIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>);
const QuoteIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v6h3v1c0 3.5-2.5 4.5-5 5z"/><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 2v6h3v1c0 3.5-2.5 4.5-5 5z"/></svg>);
const BookmarkIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>);
const ZapIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"></polygon></svg>);
const StarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></polygon></svg>);
const BarChartIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg>);
const XIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>);
const ChevronUpIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m18 15-6-6-6 6" /></svg>);
const ChevronDownIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>);
const TrophyIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>);
const SettingsIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>);
const DownloadIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>);
const UploadIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>);
const SearchIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const LinkIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>);
const Volume2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>);
const VolumeXIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>);
const BellIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>);
const FileTextIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>);
const BookOpenIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const WindIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>);
const PaintbrushIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>);
const PinIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21.28 2.22a2.5 2.5 0 0 0-3.54 0L12 8" /><path d="M11 9l-1.58 1.58a2.5 2.5 0 0 0 0 3.54l7.16 7.16a2.5 2.5 0 0 0 3.54 0L22 19.8" /><path d="m15 5-3 3" /><path d="M9 11l-3 3" /><path d="M22 12l-2 2" /></svg>);
const ClockIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const ArchiveIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="5" width="20" height="5" rx="1" /><path d="M4 10v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10" /><path d="M10 15h4" /></svg>);
const Share2Icon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>);
const PaperclipIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>);


// --- App Configuration & Utilities ---
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const demoTasks = [
  { id: 1, text: "Welcome to Aura! Try capturing a thought below. Add tags like @home", completed: false, priority: 2, category: 'General', timeOfDay: 'morning', deadline: null, subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: null, notes: '', attachments: [], tags: ['home'], isPinned: false, focusSessions: 0, isArchived: false },
  { id: 2, text: "Mark a task as complete by clicking the circle", completed: true, priority: 2, category: 'General', timeOfDay: 'morning', deadline: null, subtasks: [], win: null, completionDate: getTodayDateString(), recurring: null, dependsOn: null, notes: 'You can un-complete it too!', attachments: [], tags: [], isPinned: false, focusSessions: 1, isArchived: false },
  { id: 3, text: "Create a high-priority task by adding '!' #Urgent", completed: false, priority: 3, category: 'Urgent', timeOfDay: 'afternoon', deadline: getTodayDateString(), subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: null, notes: '', attachments: [], tags: [], isPinned: true, focusSessions: 0, isArchived: false },
  { id: 4, text: "This task repeats every day @routine", completed: false, priority: 2, category: 'Personal', timeOfDay: 'evening', deadline: getTodayDateString(), subtasks: [], win: null, completionDate: null, recurring: { type: 'daily' }, dependsOn: null, notes: '', attachments: [], tags: ['routine'], isPinned: false, focusSessions: 0, isArchived: false },
  { id: 5, text: "Organize project with subtasks", completed: false, priority: 2, category: 'Work', timeOfDay: 'afternoon', deadline: null, subtasks: [ { text: "Outline proposal", completed: true }, { text: "Draft initial designs", completed: false }, { text: "Get feedback", completed: false } ], win: null, completionDate: null, recurring: null, dependsOn: null, notes: 'Subtasks help break down complex goals.', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false },
  { id: 6, text: "Explore different views using the bottom navigation", completed: false, priority: 1, category: 'Ideas', timeOfDay: 'evening', deadline: null, subtasks: [], win: null, completionDate: null, recurring: null, dependsOn: null, notes: 'Each view gives a different perspective on your tasks.', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false }
];

const defaultCategories = {
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

const motivationalQuotes = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "It’s not the load that breaks you down, it’s the way you carry it.", author: "Lou Holtz" },
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "Believe you can and you’re halfway there.", author: "Theodore Roosevelt" },
  { quote: "Well done is better than well said.", author: "Benjamin Franklin" },
  { quote: "A year from now you may wish you had started today.", author: "Karen Lamb" }
];

const formatDate = (dateString) => { if (!dateString) return null; const date = new Date(dateString + 'T00:00:00'); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
const isOverdue = (dateString) => { if (!dateString) return false; const today = new Date(); today.setHours(0, 0, 0, 0); const deadline = new Date(dateString + 'T00:00:00'); return deadline < today; };
const parseIntelligentDeadline = (text) => {
    let cleanedText = text; let deadline = null; let recurring = null;
    const now = new Date();

    const recurringPatterns = [
        { regex: /every day/i, type: 'daily' },
        { regex: /every week/i, type: 'weekly' },
        { regex: /every month/i, type: 'monthly' }
    ];

    for (const pattern of recurringPatterns) {
        if (pattern.regex.test(cleanedText)) {
            recurring = { type: pattern.type };
            cleanedText = cleanedText.replace(pattern.regex, '').trim();
            break;
        }
    }

    const patterns = [ { regex: /in (\d+) (day|week|month)s?/i, handler: (matches) => { const num = parseInt(matches[1], 10); const unit = matches[2].toLowerCase(); const d = new Date(now); if (unit === 'day') d.setDate(now.getDate() + num); if (unit === 'week') d.setDate(now.getDate() + num * 7); if (unit === 'month') d.setMonth(now.getMonth() + num); return d; }}, { regex: /today|tomorrow/i, handler: (matches) => { const d = new Date(now); if (matches[0].toLowerCase() === 'tomorrow') d.setDate(now.getDate() + 1); return d; }}, { regex: /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday|week)/i, handler: (matches) => { const d = new Date(now); if (matches[1].toLowerCase() === 'week') { d.setDate(now.getDate() + 7); return d; } const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']; const targetDay = weekdays.indexOf(matches[1].toLowerCase()); const currentDay = now.getDay(); let dayDiff = targetDay - currentDay; if (dayDiff <= 0) dayDiff += 7; d.setDate(now.getDate() + dayDiff); return d; }}, { regex: /(?:by|on) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, handler: (matches) => { const d = new Date(now); const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']; const targetDay = weekdays.indexOf(matches[1].toLowerCase()); let dayDiff = targetDay - now.getDay(); if (dayDiff < 0) dayDiff += 7; d.setDate(now.getDate() + dayDiff); return d; }}, { regex: /(?:on)?\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s(\d{1,2})/i, handler: (matches) => { const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']; const month = months.indexOf(matches[1].toLowerCase().substring(0, 3)); const day = parseInt(matches[2], 10); if (month === -1 || isNaN(day)) return null; const year = now.getFullYear(); const d = new Date(year, month, day); if (d < now) d.setFullYear(year + 1); return d; }} ];
    for (const pattern of patterns) { const match = cleanedText.match(pattern.regex); if (match) { const dateResult = pattern.handler(match); if (dateResult) { deadline = dateResult.toISOString().split('T')[0]; cleanedText = cleanedText.replace(match[0], '').replace(/  +/g, ' ').trim(); break; } } }
    
    if (recurring && !deadline) {
      deadline = getTodayDateString();
    }
    
    return { deadline, cleanedText, recurring };
};
const achievementsList = [
    { id: 'first_task', title: 'First Step', description: 'Complete your first task.', check: (tasks) => tasks.some(t => t.completed) },
    { id: 'high_priority', title: 'Task Master', description: 'Complete a high-priority task.', check: (tasks) => tasks.some(t => t.completed && t.priority === 3) },
    { id: 'first_win', title: 'Big Win!', description: 'Record your first win in the Grove.', check: (tasks) => tasks.some(t => t.win) },
    { id: 'golden_seed', title: 'Golden Touch', description: 'Earn your first Golden Seed.', check: (tasks, stats) => stats.goldenSeeds > 0 },
    { id: 'streak_3', title: 'On a Roll', description: 'Complete a task 3 days in a row.', check: (tasks, stats) => stats.streak >= 3 },
    { id: 'focused_finish', title: 'Deep Focus', description: 'Complete a task using the Focus Timer.', check: (tasks, stats) => stats.focusedTasksCompleted > 0 },
    { id: 'tree_grower', title: 'Tree Grower', description: 'Fully grow your first tree.', check: (tasks, stats, grove) => grove.some(t => t.growthPoints >= t.maxGrowth) },
];


// --- Child Components First ---

const DayDatePanel = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-center mb-8 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] max-w-xs mx-auto shadow-lg"
        >
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{day}</p>
            <p className="text-md text-[var(--color-text-secondary)]">{date}</p>
        </motion.div>
    );
};

const LoadingScreen = () => (
    <motion.div
        key="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center z-[100]"
    >
        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            <SparklesIcon className="w-16 h-16 text-[var(--color-accent)]" />
        </motion.div>
        <h1 className="text-2xl font-bold mt-4 text-[var(--color-text-primary)]">Aura</h1>
    </motion.div>
);

const AchievementToast = ({ achievement, onClose }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
    >
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 rounded-xl shadow-2xl text-black flex items-center gap-4">
            <TrophyIcon className="w-10 h-10 flex-shrink-0" />
            <div>
                <p className="font-bold">Achievement Unlocked!</p>
                <p className="text-sm">{achievement.title}</p>
            </div>
            <button onClick={onClose} className="ml-auto text-black/50 hover:text-black"><XIcon className="w-5 h-5"/></button>
        </div>
    </motion.div>
);

// --- Generic Toast for Feedback ---
const GenericToast = ({ message, onClose }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm p-4"
    >
        <div className={`p-4 rounded-xl shadow-2xl text-white flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <p className="font-semibold text-sm">{message.text}</p>
            <button onClick={onClose} className="ml-auto text-white/70 hover:text-white flex-shrink-0"><XIcon className="w-5 h-5"/></button>
        </div>
    </motion.div>
);


const TaskBubble = ({ task, onToggle, onDelete, onFocus, onReorder, onToggleSubtask, allCategories, isDependencyMet, onOpenDetail, onTogglePin, onArchive }) => {
    const color = allCategories[task.category] || defaultCategories['General'];
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;
    const isLocked = !isDependencyMet;

    const glowStyle = useMemo(() => {
        if (task.completed) return {};
        const glowColor = color.glowColor || '#9ca3af'; // default gray-400
        const blurAmount = task.priority * 4; // e.g., 4px, 8px, 12px
        const spreadAmount = task.priority * 1.5; // e.g., 1.5px, 3px, 4.5px
        return {
             boxShadow: `0 0 ${blurAmount}px ${spreadAmount}px ${glowColor}`
        };
    }, [task.completed, task.priority, color.glowColor]);


    return ( 
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }} 
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={glowStyle}
            className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${color.bg} ${color.border} ${task.completed ? 'opacity-50 brightness-75' : ''} ${isLocked ? 'opacity-60 brightness-90' : ''} ${task.isPinned ? 'border-amber-400/80' : ''}`}
        >
            <div className="flex items-start gap-2">
                 <div className="flex flex-col items-center mt-1">
                    <button onClick={() => onReorder(task.id, 'up')} className="bg-transparent text-[var(--color-text-primary)]/30 hover:text-[var(--color-text-primary)]/70"><ChevronUpIcon className="w-4 h-4" /></button>
                    <button onClick={() => onReorder(task.id, 'down')} className="bg-transparent text-[var(--color-text-primary)]/30 hover:text-[var(--color-text-primary)]/70"><ChevronDownIcon className="w-4 h-4" /></button>
                </div>
                <motion.button onClick={() => !isLocked && onToggle(task.id)} className={`w-7 h-7 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${task.completed ? 'bg-teal-400 border-teal-400' : 'border-[var(--color-text-primary)]/50'} ${isLocked ? 'cursor-not-allowed' : 'hover:border-[var(--color-text-primary)]'}`} whileTap={isLocked ? {} : { scale: 0.9 }}>{task.completed && <motion.div initial={{scale:0}} animate={{scale:1}}><CheckIcon className="w-5 h-5 text-black" /></motion.div>}</motion.button>
                <div className="flex-grow cursor-pointer" onClick={() => onOpenDetail(task.id)}>
                    <span className={`${task.completed ? 'line-through text-[var(--color-text-primary)]/60' : 'text-[var(--color-text-primary)]/90'}`}>{task.text}</span>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {task.tags && task.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-500/50 text-gray-200 px-2 py-0.5 rounded-full">@{tag}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {task.deadline && (<div className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${isOverdue(task.deadline) && !task.completed ? 'text-rose-400' : 'text-[var(--color-text-primary)]/50'}`}><CalendarIcon className="w-3.5 h-3.5" /><span>{formatDate(task.deadline)}{task.recurring && ` (${task.recurring.type})`}</span></div>)}
                        {task.focusSessions > 0 && <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-text-primary)]/50"><ClockIcon className="w-3.5 h-3.5" /><span>{task.focusSessions}</span></div>}
                        {task.attachments && task.attachments.length > 0 && <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--color-text-primary)]/50"><PaperclipIcon className="w-3.5 h-3.5" /><span>{task.attachments.length}</span></div>}
                    </div>
                    {task.dependsOn && <div className="mt-1 flex items-center gap-1 text-xs text-amber-400/80"><LinkIcon className="w-3 h-3"/><span>Depends on another task</span></div>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className={`text-xs px-2 py-1 rounded-full font-semibold ${color.bg} ${color.text}`}>{task.category}</div>
                    <div className="flex items-center gap-1">
                        {!task.completed && <motion.button onClick={() => onTogglePin(task.id)} className={`bg-transparent transition-colors mt-0.5 ${task.isPinned ? 'text-amber-400' : 'text-[var(--color-text-primary)]/40 hover:text-amber-400'}`} whileTap={{ scale: 0.9 }} title="Pin Task"><PinIcon className="w-5 h-5" /></motion.button>}
                        
                        {task.completed && <motion.button onClick={() => onArchive(task.id)} className="bg-transparent text-[var(--color-text-primary)]/40 hover:text-[var(--color-accent)] transition-colors mt-0.5" whileTap={{ scale: 0.9 }} title="Archive Task"><ArchiveIcon className="w-5 h-5" /></motion.button>}
                        {!task.completed && <motion.button onClick={() => onFocus(task.id)} disabled={isLocked} className="bg-transparent text-[var(--color-text-primary)]/40 hover:text-teal-400 transition-colors mt-0.5 disabled:opacity-50" whileTap={{ scale: 0.9 }} title="Focus on Task"><PlayIcon className="w-5 h-5" /></motion.button>}
                        <motion.button onClick={() => onDelete(task.id)} className="bg-transparent text-[var(--color-text-primary)]/40 hover:text-rose-400 transition-colors mt-0.5" whileTap={{ scale: 0.9 }} title="Delete Task"><XIcon className="w-5 h-5"/></motion.button>
                    </div>
                </div>
            </div>
            {totalSubtasks > 0 && (
                <div className="mt-4 pl-12">
                    <div className="w-full bg-[var(--color-text-primary)]/10 rounded-full h-1 mb-2">
                        <motion.div className="bg-teal-400 h-1 rounded-full" initial={{width:0}} animate={{width: `${progress * 100}%`}} />
                    </div>
                </div>
            )}
        </motion.div> 
    );
};

const FilterBar = ({ activeFilter, setActiveFilter, categories, allTags }) => {
    const filters = [
        { type: 'all', label: 'All' },
        { type: 'priority', label: 'High Priority' },
        { type: 'due_this_week', label: 'Due This Week' },
    ];
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {filters.map(filter => (
                <button
                    key={filter.type}
                    onClick={() => setActiveFilter({ type: filter.type, value: null })}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${activeFilter.type === filter.type && activeFilter.value === null ? 'bg-[var(--color-text-primary)]/90 text-[var(--color-bg)] font-semibold' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary-hover)]'}`}
                >
                    {filter.label}
                </button>
            ))}
            <select
                onChange={(e) => setActiveFilter({ type: 'category', value: e.target.value })}
                value={activeFilter.type === 'category' ? activeFilter.value : ''}
                className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-sm rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
            >
                <option value="" disabled>Category...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {allTags.length > 0 && (
                 <select
                    onChange={(e) => setActiveFilter({ type: 'tag', value: e.target.value })}
                    value={activeFilter.type === 'tag' ? activeFilter.value : ''}
                    className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-sm rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
                >
                    <option value="" disabled>Tag...</option>
                    {allTags.map(tag => <option key={tag} value={tag}>@{tag}</option>)}
                </select>
            )}
        </div>
    );
};

const TimeSection = ({ title, icon, tasks, toggleTask, deleteTask, onFocus, isCompletedSection = false, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }) => {
    if (tasks.length === 0 && !isCompletedSection) return null;
    return ( <motion.section layout><h2 className="flex items-center gap-3 text-2xl font-semibold text-[var(--color-text-primary)]/80 mb-4">{React.cloneElement(icon, { className: "w-7 h-7" })}<span>{title}</span></h2><div className="space-y-3"><AnimatePresence>{tasks.map((task) => {
        const dependency = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;
        const isDependencyMet = !dependency || dependency.completed;
        return <TaskBubble key={task.id} {...{task, allCategories, onToggle: toggleTask, onDelete: deleteTask, onFocus, onReorder, onToggleSubtask, isDependencyMet, onOpenDetail, onTogglePin, onArchive}} />
    })}</AnimatePresence>{tasks.length === 0 && isCompletedSection && <p className="text-[var(--color-text-secondary)]/80 pl-4">No tasks completed yet.</p>}</div></motion.section> );
};

const Header = ({ momentumProgress, onSettingsClick, onSearchClick, onMindfulClick, dailyQuote, onShare }) => (
    <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8 relative">
        <div className="absolute top-0 left-0 flex items-center gap-4">
             <button onClick={onMindfulClick} className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" title="Mindful Minute">
                <WindIcon className="w-6 h-6"/>
            </button>
            <button onClick={onShare} className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" title="Share Today's Wins">
                <Share2Icon className="w-6 h-6"/>
            </button>
        </div>
        <div className="absolute top-0 right-0 flex items-center gap-4">
          <button onClick={onSearchClick} className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"><SearchIcon className="w-6 h-6"/></button>
          <button onClick={onSettingsClick} className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"><SettingsIcon className="w-6 h-6"/></button>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">Aura</h1>
        <p className="text-[var(--color-text-secondary)] mb-4 italic">"{dailyQuote.quote}" - {dailyQuote.author}</p>
        <div className="max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-xs text-amber-300">
                <ZapIcon className="w-4 h-4" />
                <span>Daily Momentum</span>
            </div>
            <div className="w-full bg-[var(--color-text-primary)]/10 rounded-full h-1.5 mt-1">
                <motion.div className="bg-amber-400 h-1.5 rounded-full" initial={{width: 0}} animate={{width: `${momentumProgress * 100}%`}} transition={{ type: 'spring' }} />
            </div>
        </div>
    </motion.header>
);

const AssistantPrompt = ({ message, action, onAction, onClose, showNext, onNext }) => (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto mb-6 p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-center text-sm">
        <p className="text-[var(--color-text-primary)]/80">{message}</p>
        <div className="flex justify-center items-center gap-4 mt-2">
            {action && <button onClick={onAction} className="text-sm bg-indigo-500/80 px-3 py-1 rounded-full hover:bg-indigo-500">{action}</button>}
            {showNext && <button onClick={onNext} className="text-sm bg-teal-500/80 px-3 py-1 rounded-full hover:bg-teal-500">Next →</button>}
        </div>
    </motion.div>
);

const TemplateSuggestionModal = ({ suggestion, onApply, onContinue, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Template Found</h2>
            <p className="text-[var(--color-text-secondary)] mb-4">Your new task matches the "{suggestion.templateName}" template. How would you like to proceed?</p>
            <div className="flex flex-col gap-3 mt-6">
                <button onClick={onApply} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg">Apply Template</button>
                <button onClick={onContinue} className="w-full bg-[var(--color-text-primary)]/10 py-2 rounded-lg">Add Task as Written</button>
            </div>
        </motion.div>
    </motion.div>
);

const WinModal = ({ task, onSave, onClose }) => {
    const [winText, setWinText] = useState('');
    return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 text-center"><h2 className="text-2xl font-bold mb-2">Great Work!</h2><p className="text-[var(--color-text-secondary)] mb-4">You completed: <span className="font-semibold text-[var(--color-text-primary)]">{task.text}</span></p><p className="text-sm text-[var(--color-text-primary)]/60 mb-4">Optionally, add a note about this accomplishment to your Grove.</p><textarea value={winText} onChange={(e) => setWinText(e.target.value)} placeholder="e.g., 'Finally cracked the issue...'" className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-primary)]/50 p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all h-24"></textarea><div className="flex gap-4 mt-6"><button onClick={onClose} className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg">Skip</button><button onClick={() => onSave(task.id, winText)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg">Save Win</button></div></motion.div></motion.div>);
};

const FocusView = ({ task, onClose, onComplete }) => {
    const [duration, setDuration] = useState(25); // Default 25 minutes
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);
    const [soundType, setSoundType] = useState('off'); // 'off', 'pink', 'brown', 'white'
    const soundPlayer = useRef(null);
    const soundOptions = [
        { id: 'off', label: 'Off' },
        { id: 'pink', label: 'Pink' },
        { id: 'brown', label: 'Brown' },
        { id: 'white', label: 'White' },
    ];

    // Effect to manage the Tone.js sound object's lifecycle
    useEffect(() => {
        // Ensure Tone.js is loaded before trying to use it
        if (!window.Tone) return;

        // Clean up any existing sound player when the sound type changes
        if (soundPlayer.current) {
            soundPlayer.current.stop();
            soundPlayer.current.dispose();
        }

        // If a sound type is selected, create a new player
        if (soundType !== 'off') {
            soundPlayer.current = new window.Tone.Noise(soundType).toDestination();
            soundPlayer.current.volume.value = -20; // Set a quiet volume
        } else {
            soundPlayer.current = null;
        }

        // Cleanup function to run when the component unmounts or dependency changes
        return () => {
            if (soundPlayer.current) {
                soundPlayer.current.stop();
                soundPlayer.current.dispose();
                soundPlayer.current = null;
            }
        };
    }, [soundType]);

    // Effect to handle starting and stopping the sound based on timer activity
    useEffect(() => {
        if (isActive && soundPlayer.current) {
            window.Tone.start().then(() => {
                soundPlayer.current.start();
            });
        } else if (soundPlayer.current) {
            soundPlayer.current.stop();
        }
    }, [isActive, soundType]);


    useEffect(() => {
        if (!isActive) { setTimeLeft(duration * 60); }
    }, [duration, isActive]);

    useEffect(() => { 
        let interval = null; 
        if (isActive && timeLeft > 0) { 
            interval = setInterval(() => { setTimeLeft(t => t - 1); }, 1000); 
        } else if (timeLeft === 0) { 
            onComplete(task.id); 
            onClose(); 
        } 
        return () => clearInterval(interval); 
    }, [isActive, timeLeft]);
    
    const minutes = Math.floor(timeLeft / 60); 
    const seconds = timeLeft % 60; 
    const progress = ((duration * 60) - timeLeft) / (duration * 60);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md text-center">
                <h2 className="text-xl text-white/70 mb-4">Focusing on:</h2>
                <p className="text-3xl font-bold text-white mb-6">{task.text}</p>
                 <div className="flex items-center justify-center gap-6 mb-6 text-white">
                     <button onClick={() => setDuration(d => Math.max(5, d - 5))} disabled={isActive} className="text-4xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">-</button>
                     <span className="text-lg w-32 text-center text-white/80">Set Timer: {duration} min</span>
                     <button onClick={() => setDuration(d => d + 5)} disabled={isActive} className="text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">+</button>
                </div>
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <svg className="w-full h-full" viewBox="0 0 100 100"><circle className="text-white/10" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent"></circle><motion.circle className="text-teal-400" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent" strokeDasharray={2 * Math.PI * 45} initial={{ strokeDashoffset: 2 * Math.PI * 45 }} animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1-progress) }} transition={{ duration: 1, ease: 'linear' }} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}></motion.circle></svg>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-mono">{`${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`}</div>
                </div>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={() => setIsActive(!isActive)} className="bg-white/10 px-6 py-3 rounded-full text-lg font-semibold w-32">{isActive ? 'Pause' : 'Start'}</button>
                    <button onClick={onClose} className="bg-white/5 px-6 py-3 rounded-full">End Session</button>
                </div>
                <div className="flex items-center justify-center gap-2">
                    {soundOptions.map(opt => (
                        <button key={opt.id} onClick={() => setSoundType(opt.id)} className={`px-4 py-1.5 text-sm rounded-full transition-colors ${soundType === opt.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

const CaptureInput = ({ onAddTask }) => {
    const [text, setText] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); if (text.trim()) { onAddTask(text.trim()); setText(''); } };
    return (<motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }} className="fixed bottom-0 left-0 right-0 pt-4 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent z-20"><div className="max-w-2xl mx-auto"><form onSubmit={handleSubmit} className="flex gap-2"><input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Capture a thought... (N)" className="w-full bg-[var(--color-bg-input)] backdrop-blur-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] px-5 py-3 rounded-full border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"/><button type="submit" className="bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-primary)] p-4 rounded-full transition-colors flex-shrink-0"><PlusIcon className="w-5 h-5" /></button></form></div></motion.div>);
};

const BottomNav = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id: 'flow', label: 'Flow', icon: <SunIcon /> },
        { id: 'constellations', label: 'Projects', icon: <SparklesIcon /> },
        { id: 'grove', label: 'Grove', icon: <LeafIcon /> },
        { id: 'journal', label: 'Journal', icon: <BookOpenIcon /> },
        { id: 'review', label: 'Review', icon: <BarChartIcon /> }
    ];
    return (
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
            <div className="flex items-center gap-1 sm:gap-2 bg-[var(--color-bg-secondary)]/80 backdrop-blur-lg border border-[var(--color-border)] rounded-full p-2 pointer-events-auto">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`relative px-2 sm:px-4 py-2 rounded-full text-sm transition-colors ${currentView === item.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        {currentView === item.id && (
                            <motion.div
                                layoutId="nav-bubble"
                                className="absolute inset-0 bg-[var(--color-bg-secondary-hover)] rounded-full"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                            <span className="hidden sm:inline">{item.label}</span>
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Settings Modal ---
const SettingsModal = ({ isOpen, onClose, theme, setTheme, customCategories, onUpdateCustomCategories, onOpenThemeCreator, allThemes, shutdownTime, onSetShutdownTime, soundEffectsEnabled, onSetSoundEffectsEnabled, onOpenArchive, autoArchiveEnabled, onSetAutoArchiveEnabled, onExport, onTriggerImport, notificationsEnabled, onSetNotificationsEnabled }) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    if (!isOpen) return null;
    
    const addCategory = () => {
      if(newCategoryName && !customCategories[newCategoryName] && !defaultCategories[newCategoryName]){
        const newCat = {
          bg: 'bg-gray-500/30', border: 'border-gray-400/50', text: 'text-gray-200', solid: 'bg-gray-500', glowColor: '#9ca3af'
        };
        onUpdateCustomCategories({...customCategories, [newCategoryName]: newCat});
        setNewCategoryName('');
      }
    }
    
    const removeCategory = (name) => {
       const {[name]: _, ...remaining} = customCategories;
       onUpdateCustomCategories(remaining);
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Settings</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><XIcon className="w-6 h-6"/></button>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Theme</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {allThemes.map(t => (
                            <button key={t.id} onClick={() => setTheme(t.id)} className={`w-full p-1 rounded-lg border-2 ${theme === t.id ? 'border-[var(--color-accent)]' : 'border-transparent'}`}>
                                <div className={`w-full h-12 ${t.bg} rounded-md flex items-center justify-center ${t.text} text-xs font-semibold text-center`}>{t.name}</div>
                            </button>
                        ))}
                        <button onClick={onOpenThemeCreator} className="w-full p-1 rounded-lg border-2 border-transparent">
                             <div className={`w-full h-12 bg-[var(--color-bg)] rounded-md flex items-center justify-center text-[var(--color-text-secondary)] text-xs font-semibold border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)]`}>
                                <PaintbrushIcon className="w-5 h-5"/>
                             </div>
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                     <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">General</h3>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <span>Enable Sound Effects</span>
                            <button onClick={() => onSetSoundEffectsEnabled(!soundEffectsEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${soundEffectsEnabled ? 'bg-[var(--color-accent)]' : 'bg-gray-500'}`}>
                                <motion.div layout className={`w-4 h-4 bg-white rounded-full ${soundEffectsEnabled ? 'ml-auto' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <span>Auto-archive yesterday's tasks</span>
                            <button onClick={() => onSetAutoArchiveEnabled(!autoArchiveEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${autoArchiveEnabled ? 'bg-[var(--color-accent)]' : 'bg-gray-500'}`}>
                                <motion.div layout className={`w-4 h-4 bg-white rounded-full ${autoArchiveEnabled ? 'ml-auto' : ''}`} />
                            </button>
                        </div>
                         <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <span>Enable Desktop Notifications</span>
                            <button onClick={() => onSetNotificationsEnabled(!notificationsEnabled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-[var(--color-accent)]' : 'bg-gray-500'}`}>
                                <motion.div layout className={`w-4 h-4 bg-white rounded-full ${notificationsEnabled ? 'ml-auto' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Custom Categories</h3>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name..."
                        className="w-full bg-[var(--color-bg)] text-sm p-2 rounded-md border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent)]"
                      />
                      <button onClick={addCategory} className="bg-[var(--color-accent)] text-black font-semibold px-4 rounded-md">Add</button>
                    </div>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {Object.keys(customCategories).map(catName => (
                         <div key={catName} className="flex justify-between items-center bg-[var(--color-bg)] p-2 rounded-md">
                           <span>{catName}</span>
                           <button onClick={() => removeCategory(catName)} className="text-rose-400 hover:text-rose-600"><XIcon className="w-4 h-4"/></button>
                         </div>
                      ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Productivity</h3>
                     <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                        <label htmlFor="shutdownTime">End of Day Time</label>
                        <input 
                            type="time"
                            id="shutdownTime"
                            value={shutdownTime}
                            onChange={e => onSetShutdownTime(e.target.value)}
                            className="bg-transparent border-none text-[var(--color-text-primary)] focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Data Management</h3>
                    <div className="flex gap-2">
                        <button onClick={onExport} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg hover:bg-[var(--color-bg-secondary-hover)]"><DownloadIcon className="w-5 h-5"/> Export</button>
                        <button onClick={onTriggerImport} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg hover:bg-[var(--color-bg-secondary-hover)]"><UploadIcon className="w-5 h-5"/> Import</button>
                    </div>
                    <button onClick={onOpenArchive} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg mt-3 hover:bg-[var(--color-bg-secondary-hover)]"><ArchiveIcon className="w-5 h-5"/> View Archive</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Confirmation Modal ---
const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 text-center">
                <h2 className="text-lg font-bold mb-4">Are you sure?</h2>
                <p className="text-[var(--color-text-secondary)] mb-6">{message}</p>
                <div className="flex gap-4">
                    <button onClick={onCancel} className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg">Cancel</button>
                    <button onClick={onConfirm} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-lg">Confirm</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Tree Components ---
const OakTree = ({ growth }) => {
    const trunkHeight = 5 + growth * 45;
    const branches = [ { start: 0.3, len: 15, angle: -30 }, { start: 0.4, len: 15, angle: 30 }, { start: 0.6, len: 12, angle: -45 }, { start: 0.7, len: 12, angle: 45 }, { start: 0.85, len: 8, angle: -25 }, ];
    return (<svg viewBox="0 0 100 100" className="w-full h-full"><motion.line x1="50" y1="95" x2="50" y2={95-trunkHeight} stroke="var(--color-text-primary)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}/>{branches.map((b, i) => growth > b.start && (<motion.line key={i} x1="50" y1={95 - (trunkHeight * (b.start + 0.1))} x2={50 + Math.sin(b.angle*Math.PI/180) * b.len * ((growth - b.start)/(1-b.start))} y2={(95 - (trunkHeight * (b.start + 0.1))) - Math.cos(b.angle*Math.PI/180) * b.len * ((growth - b.start)/(1-b.start))} stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.2 }}/>))}</svg>);
};
const PineTree = ({ growth }) => {
    const trunkHeight = 10 + growth * 50;
    const layers = [ { y: 0.3, w: 25 }, { y: 0.6, w: 20 }, { y: 0.85, w: 15 } ];
    return (<svg viewBox="0 0 100 100" className="w-full h-full"><motion.line x1="50" y1="95" x2="50" y2={95-trunkHeight} stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}/>{layers.map((l, i) => growth > l.y && (<motion.path key={i} d={`M 50 ${95-trunkHeight*l.y} l ${l.w * growth} 0 l ${-l.w*growth} 10 l ${-l.w*growth} -10 Z`} fill="var(--color-text-primary)" opacity={(growth - l.y)/(1-l.y)} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: (growth - l.y)/(1-l.y) }} transition={{ delay: 0.5 + i * 0.3 }} style={{transformOrigin: `50px ${95-trunkHeight*l.y}px`}}/>))}</svg>);
};
const CherryBlossom = ({ growth }) => {
    const trunkHeight = 15 + growth * 35;
    const branches = [ { start: 0.3, len: 18, angle: -35 }, { start: 0.4, len: 18, angle: 35 }, { start: 0.6, len: 12, angle: -55 }, { start: 0.65, len: 12, angle: 55 }, { start: 0.2, len: 10, angle: 10 }];
    return (<svg viewBox="0 0 100 100" className="w-full h-full">{branches.map((b, i) => growth > b.start && (<motion.g key={i}><motion.line x1="50" y1="95" x2={50 + Math.sin(b.angle*Math.PI/180) * b.len * ((growth - b.start)/(1-b.start))} y2={95 - Math.cos(b.angle*Math.PI/180) * b.len * ((growth - b.start)/(1-b.start))} stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.2 }}/><motion.circle cx={50 + Math.sin(b.angle*Math.PI/180) * b.len * ((growth - b.start)/(1-b.start))} cy={95 - Math.cos(b.angle*Math.PI/180) * b.len * ((growth - b.start)/(1-b.start))} r={growth > b.start + 0.1 ? 4 : 0} fill="#fecdd3" initial={{scale:0}} animate={{scale:1}} transition={{delay: 1 + i*0.2}}/></motion.g>))}</svg>);
};

const Tree = ({ type, growth }) => {
    switch(type){
        case 'pine': return <PineTree growth={growth}/>;
        case 'cherry': return <CherryBlossom growth={growth}/>;
        default: return <OakTree growth={growth}/>;
    }
};

// --- Planting Animation ---
const PlantingAnimation = ({ onComplete }) => (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[70] flex items-center justify-center"
    >
        <svg viewBox="0 0 100 100" className="w-48 h-48">
            <motion.circle 
                cx="50" cy="95" r="2" fill="#fde68a"
                animate={{ r: [2, 5, 2], transition: { duration: 1, repeat: 1 } }}
            />
            <motion.path 
                d="M 50 95 Q 45 75 50 55"
                stroke="#a3e635"
                strokeWidth="3"
                fill="transparent"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, transition: { delay: 2, duration: 1.5 } }}
                onAnimationComplete={onComplete}
            />
        </svg>
    </motion.div>
);


// --- Main View Components ---
const FlowView = ({ tasks, toggleTask, deleteTask, onFocus, activeFilter, setActiveFilter, onReorder, onToggleSubtask, allTasks, allCategories, onOpenDetail, onTogglePin, onArchive }) => {
    const nonArchivedTasks = tasks.filter(t => !t.isArchived);
    const pinnedTasks = nonArchivedTasks.filter(t => t.isPinned && !t.completed);
    const uncompletedTasks = nonArchivedTasks.filter(t => !t.isPinned && !t.completed);
    const morningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'morning'); 
    const afternoonTasks = uncompletedTasks.filter(t => t.timeOfDay === 'afternoon'); 
    const eveningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'evening'); 
    const completedTasks = nonArchivedTasks.filter(t => t.completed);
    const categories = useMemo(() => [...Object.keys(defaultCategories), ...Object.keys(allCategories).filter(c => !defaultCategories[c])], [allCategories]);
    const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags || []))], [tasks]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto">
            <DayDatePanel />
            <FilterBar activeFilter={activeFilter} setActiveFilter={setActiveFilter} categories={categories} allTags={allTags}/>
            <div className="space-y-12 mt-6">
                {pinnedTasks.length > 0 && <TimeSection title="Pinned" icon={<PinIcon />} tasks={pinnedTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />}
                <TimeSection title="Morning" icon={<SunIcon />} tasks={morningTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />
                <TimeSection title="Afternoon" icon={<SunsetIcon />} tasks={afternoonTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />
                <TimeSection title="Evening" icon={<MoonIcon />} tasks={eveningTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} />
                {completedTasks.length > 0 && <TimeSection title="Completed" icon={<CheckIcon />} tasks={completedTasks} {...{toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive}} isCompletedSection />}
            </div>
        </motion.div>
    );
};

const ReviewView = ({ tasks, achievements, allCategories, stats, onDeleteStale }) => {
    const completedTasks = tasks.filter(t => t.completed && t.completionDate);

    const heatmapData = useMemo(() => {
        const data = new Map();
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.set(date.toISOString().split('T')[0], { level: 0 });
        }
        completedTasks.forEach(task => {
            const date = task.completionDate;
            if (data.has(date)) {
                data.get(date).level++;
            }
        });
        return Array.from(data.entries()).reverse();
    }, [completedTasks]);
    
    const categoryData = useMemo(() => {
        const data = completedTasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(data).sort((a,b) => b[1] - a[1]);
    }, [completedTasks]);

    const tagData = useMemo(() => {
        const data = completedTasks.reduce((acc, task) => {
            (task.tags || []).forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});
        return Object.entries(data).sort((a,b) => b[1] - a[1]);
    }, [completedTasks]);

    const staleTasks = useMemo(() => {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return tasks.filter(task => !task.completed && new Date(task.id) < twoWeeksAgo);
    }, [tasks]);

    const timeOfDayData = useMemo(() => {
        const data = completedTasks.reduce((acc, task) => {
            const time = task.timeOfDay || 'afternoon';
            acc[time] = (acc[time] || 0) + 1;
            return acc;
        }, { morning: 0, afternoon: 0, evening: 0 });
        return Object.entries(data);
    }, [completedTasks]);
    
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
                            <div key={date} className={`w-3 h-3 rounded-sm ${data.level > 0 ? `opacity-${Math.min(data.level*25, 100)}` : 'bg-[var(--color-bg)]'} bg-[var(--color-accent)]`} title={`${data.level} tasks on ${formatDate(date)}`}></div>
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
                                        style={{ width: `${(count / totalCompleted) * 100}%`}}
                                    />
                                </div>
                            </div>
                        )) : <p className="text-[var(--color-text-secondary)] text-sm">No completed tasks with categories yet.</p>}
                    </div>
                </div>
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Tag Breakdown</h3>
                    <div className="space-y-2">
                        {tagData.length > 0 ? tagData.slice(0, 5).map(([tag, count]) => ( // Show top 5 tags
                            <div key={tag}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">@{tag}</span>
                                    <span className="text-[var(--color-text-secondary)]">{count} tasks</span>
                                </div>
                                <div className="w-full bg-[var(--color-bg)] rounded-full h-2">
                                    <div 
                                        className="bg-purple-400 h-2 rounded-full"
                                        style={{ width: `${(count / completedTasks.flatMap(t => t.tags || []).length) * 100}%`}}
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

const ConstellationsView = ({ tasks, toggleTask, onSaveTemplate, templates, allCategories }) => {
    const [hoveredTask, setHoveredTask] = useState(null);
    const nonArchivedTasks = tasks.filter(t => !t.isArchived);
    const projects = useMemo(() => { const grouped = nonArchivedTasks.reduce((acc, task) => { (acc[task.category] = acc[task.category] || []).push(task); return acc; }, {}); return Object.entries(grouped); }, [nonArchivedTasks]);
    return (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className="text-center max-w-5xl mx-auto"><h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Your Constellations</h2><p className="text-[var(--color-text-secondary)] mb-16">An overview of your projects and goals.</p><div className="flex flex-wrap justify-center gap-x-16 gap-y-24 items-center">{projects.map(([category, cTasks], index) => { const isTemplated = templates.some(t => t.name === category); const centerX = 128; const centerY = 128; const color = allCategories[category] || defaultCategories['General']; return (<div key={category} className="relative w-64 h-64 flex items-center justify-center"><button onClick={() => !isTemplated && onSaveTemplate(category, cTasks)} disabled={isTemplated} className="absolute -top-10 text-xs bg-[var(--color-bg-secondary)] backdrop-blur-sm text-[var(--color-text-secondary)] px-3 py-1 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary-hover)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" title={isTemplated ? "Template already saved" : "Save as Template"}><BookmarkIcon className="w-3 h-3" />{isTemplated ? 'Saved' : 'Save Template'}</button><svg className="absolute w-full h-full overflow-visible" viewBox="0 0 256 256">{cTasks.map((task, taskIndex) => { const angle = (taskIndex / cTasks.length) * 2 * Math.PI; const radius = 110 + (taskIndex % 3) * 12; const x = centerX + Math.cos(angle) * radius; const y = centerY + Math.sin(angle) * radius; return <motion.line key={`line-${task.id}`} x1={centerX} y1={centerY} x2={x} y2={y} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: index * 0.1 + taskIndex * 0.05 }} />; })}</svg><motion.div className={`relative rounded-full w-24 h-24 flex items-center justify-center text-center p-2 shadow-2xl shadow-black/30 ${color.solid}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 }} ><motion.div className={`absolute inset-0 rounded-full ${color.solid} opacity-50 blur-lg`} animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} /><span className="font-bold text-lg relative z-10">{category}</span></motion.div>{cTasks.map((task, taskIndex) => { const angle = (taskIndex / cTasks.length) * 2 * Math.PI; const radius = 110 + (taskIndex % 3) * 12; const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius; const prioritySize = { 1: 'w-3 h-3', 2: 'w-4 h-4', 3: 'w-5 h-5' }[task.priority] || 'w-4 h-4'; return (<motion.div key={task.id} className={`absolute`} initial={{ x: 0, y: 0, opacity: 0, scale: 0 }} animate={{ x, y, opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 100, delay: index * 0.1 + taskIndex * 0.05 }} style={{ top: '50%', left: '50%', marginTop: '-10px', marginLeft: '-10px' }} onMouseEnter={() => setHoveredTask(task.id)} onMouseLeave={() => setHoveredTask(null)}><motion.div onClick={() => toggleTask(task.id)} className={`rounded-full cursor-pointer ${task.completed ? 'bg-teal-400' : 'bg-white/80'} shadow-lg transition-colors ${prioritySize}`} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: taskIndex * 0.3 }} /><AnimatePresence>{hoveredTask === task.id && (<motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: -20, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[var(--color-bg-secondary)] backdrop-blur-sm text-xs text-[var(--color-text-primary)] rounded-md shadow-lg pointer-events-none whitespace-nowrap">{task.text}</motion.div>)}</AnimatePresence></motion.div>)})}</div >)})}</div></motion.div >);
};

const GroveView = ({ tasks, grove, goldenSeeds, onPlantSeed, allCategories }) => {
    const wins = tasks.filter(t => t.win);
    const getSeason = () => {
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'autumn';
      return 'winter';
    }
    const season = getSeason();
    const seasonGradients = {
        spring: 'from-pink-300/20 to-green-300/20',
        summer: 'from-sky-400/20 to-yellow-300/20',
        autumn: 'from-orange-400/20 to-red-500/20',
        winter: 'from-blue-300/20 to-indigo-400/20',
    }
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Your Grove</h2>
            <p className="text-[var(--color-text-secondary)] mb-8">A garden that grows with your efforts.</p>
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"><div className="flex items-center justify-center gap-4"><StarIcon className="w-8 h-8 text-amber-400" /><div className="text-left"><p className="font-bold text-lg text-amber-300">Golden Seeds</p><p className="text-sm text-amber-300/80">You have {goldenSeeds} seed{goldenSeeds !== 1 && 's'}. Plant one to grow something special.</p></div><button onClick={onPlantSeed} disabled={goldenSeeds === 0} className="ml-auto bg-amber-400 text-black px-4 py-2 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">Plant</button></div></div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12 min-h-[150px] p-4 rounded-xl bg-gradient-to-br ${seasonGradients[season]}`}>
                {grove.map(tree => (
                    <div key={tree.id} className="p-2 bg-[var(--color-bg-secondary)]/50 rounded-lg border border-[var(--color-border)]">
                        <Tree type={tree.type} growth={tree.growthPoints / tree.maxGrowth} />
                        <p className="text-xs mt-1 text-[var(--color-text-secondary)]">{tree.type.charAt(0).toUpperCase() + tree.type.slice(1)} Tree</p>
                    </div>
                ))}
                {grove.length === 0 && <p className="text-[var(--color-text-secondary)] col-span-full self-center">Your grove is empty. Plant a golden seed to begin.</p>}
            </div>

            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Accomplishment Journal</h3>
            <div className="space-y-4">{wins.length > 0 ? wins.map((winTask, i) => (<motion.div key={winTask.id} initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y: 0 }} transition={{delay: i * 0.1}} className={`p-4 rounded-lg border text-left ${winTask.isGolden ? 'border-amber-400 bg-amber-500/20' : allCategories[winTask.category]?.border || defaultCategories['General'].border} ${!winTask.isGolden && (allCategories[winTask.category]?.bg || defaultCategories['General'].bg)}`}><p className="font-bold text-[var(--color-text-primary)]">{winTask.text}</p><div className="flex items-start gap-3 mt-2 text-[var(--color-text-primary)]/80"><QuoteIcon className="w-5 h-5 flex-shrink-0 mt-1 opacity-50" /> <p className="italic">{winTask.win}</p></div></motion.div>)) : <p className="text-[var(--color-text-secondary)]">Complete high-priority tasks to record your wins here.</p>}</div>
        </motion.div>
    );
};

const JournalView = ({ journalEntries, setJournalEntries, completedTasks }) => {
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [entryContent, setEntryContent] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const journalPrompts = [
      "What went well today?",
      "What am I grateful for?",
      "What was the biggest challenge?",
      "One thing I learned today is...",
      "How can I make tomorrow better?"
    ];

    useEffect(() => {
        const content = journalEntries.find(entry => entry.date === selectedDate)?.content || '';
        setEntryContent(content);
    }, [journalEntries, selectedDate]);

    const handleSave = () => {
        const existingIndex = journalEntries.findIndex(entry => entry.date === selectedDate);
        if (existingIndex > -1) {
            const newEntries = [...journalEntries];
            newEntries[existingIndex] = { date: selectedDate, content: entryContent };
            setJournalEntries(newEntries);
        } else {
            setJournalEntries([...journalEntries, { date: selectedDate, content: entryContent }]);
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const addPrompt = (prompt) => {
        setEntryContent(prev => prev + `\n\n**${prompt}**\n`);
    }

    const tasksForSelectedDate = completedTasks.filter(t => t.completionDate === selectedDate);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Daily Journal</h2>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[var(--color-bg-secondary)] p-2 rounded-lg border border-[var(--color-border)]"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="mb-4">
                      <h3 className="font-bold mb-2">Prompts</h3>
                      <div className="flex flex-wrap gap-2">
                        {journalPrompts.map(prompt => (
                          <button key={prompt} onClick={() => addPrompt(prompt)} className="text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary-hover)] px-3 py-1 rounded-full">
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                        value={entryContent}
                        onChange={(e) => setEntryContent(e.target.value)}
                        placeholder="How was your day? What's on your mind?"
                        className="w-full h-96 bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                     <div className="flex justify-end items-center mt-2">
                        <AnimatePresence>
                         {isSaved && <motion.span initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity:0}} className="text-sm text-emerald-400 mr-4">Saved!</motion.span>}
                        </AnimatePresence>
                        <button onClick={handleSave} className="bg-[var(--color-accent)] text-black font-semibold px-6 py-2 rounded-lg">Save</button>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold mb-3">Completed on {formatDate(selectedDate)}</h3>
                    <div className="space-y-2">
                        {tasksForSelectedDate.length > 0 ? tasksForSelectedDate.map(task => (
                            <div key={task.id} className="p-2 bg-[var(--color-bg)] rounded-md text-sm text-[var(--color-text-secondary)]">
                                {task.text}
                            </div>
                        )) : (
                            <p className="text-sm text-[var(--color-text-secondary)]">No tasks completed on this day.</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- New Modals ---

const SearchModal = ({ isOpen, onClose, tasks, onTaskClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredTasks = useMemo(() => {
        if (!searchTerm) return [];
        return tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [searchTerm, tasks]);
    
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 p-4 pt-20">
            <div className="w-full max-w-xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                     <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tasks, categories, or @tags..."
                        className="w-full bg-[var(--color-bg-input)] text-lg p-3 rounded-full border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        autoFocus
                    />
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><XIcon className="w-8 h-8"/></button>
                </div>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {filteredTasks.map(task => (
                        <div key={task.id} onClick={() => onTaskClick(task.id)} className="p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary-hover)]">
                            <p>{task.text}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{task.category}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const TaskDetailModal = ({ isOpen, onClose, task, onSave, onSetDependency, allTasks, onAddAttachment, onDeleteAttachment }) => {
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
    const [attachmentURLs, setAttachmentURLs] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        if(task) {
            setText(task.text);
            setNotes(task.notes || '');
            setTags((task.tags || []).join(', '));
            
            // Create Object URLs for attachments
            const urls = {};
            const attachmentPromises = (task.attachments || []).map(async (att) => {
                const fileBlob = await getFile(att.id);
                if (fileBlob) {
                    urls[att.id] = URL.createObjectURL(fileBlob);
                }
            });
            Promise.all(attachmentPromises).then(() => setAttachmentURLs(urls));

            return () => {
                Object.values(urls).forEach(URL.revokeObjectURL);
            }
        }
    }, [task]);
    
    if (!isOpen || !task) return null;

    const handleSave = () => {
        const newTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave(task.id, text, notes, newTags);
        onClose();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onAddAttachment(task.id, file);
        }
    };

    const dependencyTask = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;

    return (
        <>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6">
                <input 
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold mb-4 focus:outline-none"
                />
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes..."
                    className="w-full h-24 bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                />
                <input 
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Tags, comma separated"
                    className="w-full bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                />
                
                <div className="mb-4">
                    <h3 className="font-semibold text-sm mb-2">Attachments</h3>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                        {(task.attachments || []).map(att => (
                            <div key={att.id} className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg text-sm">
                                <a href={attachmentURLs[att.id]} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{att.name}</a>
                                <button onClick={() => onDeleteAttachment(task.id, att)} className="text-rose-400 hover:text-rose-500 ml-4 flex-shrink-0"><XIcon className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} className="w-full mt-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 text-sm font-semibold py-2 rounded-lg">
                        Add Attachment
                    </button>
                </div>


                <div className="mb-4">
                    <button onClick={() => setIsDependencyModalOpen(true)} className="text-sm text-amber-400/80 hover:text-amber-400 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4"/> Set Dependency
                    </button>
                    {dependencyTask && (
                        <div className="text-xs mt-2 p-2 bg-[var(--color-bg)] rounded-md flex justify-between items-center">
                            <span>Depends on: {dependencyTask.text}</span>
                            <button onClick={() => onSetDependency(task.id, null)} className="text-rose-400"><XIcon className="w-4 h-4"/></button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-[var(--color-bg-secondary-hover)] py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg">Save</button>
                </div>
            </motion.div>
        </motion.div>
        <AnimatePresence>
            {isDependencyModalOpen && (
                <DependencySelectorModal 
                    isOpen={isDependencyModalOpen}
                    onClose={() => setIsDependencyModalOpen(false)}
                    currentTaskId={task.id}
                    tasks={allTasks}
                    onSelect={(dependencyId) => {
                        onSetDependency(task.id, dependencyId);
                        setIsDependencyModalOpen(false);
                    }}
                />
            )}
        </AnimatePresence>
        </>
    );
}

// --- NEW Mindful Minute Modal ---
const MindfulMinuteModal = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('Prepare to begin...');
    const prompts = ['Breathe in...', 'Hold...', 'Breathe out...'];
    const durations = [4000, 2000, 6000];

    useEffect(() => {
        if (!isOpen) return;

        let index = -1;
        let timer;

        const cycle = () => {
            index = (index + 1) % prompts.length;
            setPrompt(prompts[index]);
            timer = setTimeout(cycle, durations[index]);
        };
        
        const startTimeout = setTimeout(cycle, 1000); // Initial delay

        return () => {
            clearTimeout(startTimeout);
            clearTimeout(timer);
        };
    }, [isOpen]);

    if(!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[80] flex flex-col items-center justify-center p-4">
             <motion.div 
                className="w-48 h-48 rounded-full border-2 border-[var(--color-accent)]"
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
             />
             <p className="text-2xl font-semibold text-white/80 mt-12">{prompt}</p>
             <button onClick={onClose} className="absolute bottom-12 bg-white/10 px-6 py-3 rounded-full">End Session</button>
        </motion.div>
    );
};

// --- NEW Theme Creator Modal ---
const ThemeCreatorModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [colors, setColors] = useState({
        bg: '#000000',
        bgSecondary: '#1f2937',
        textPrimary: '#f9fafb',
        textSecondary: '#9ca3af',
        accent: '#2dd4bf',
    });

    if(!isOpen) return null;

    const handleSave = () => {
        if(!name.trim()) return; // Needs a name
        onSave({ id: name.toLowerCase().replace(/\s+/g, '_'), name, ...colors});
        onClose();
    };

    const colorVars = [
        { key: 'bg', label: 'Background' },
        { key: 'bgSecondary', label: 'Secondary BG' },
        { key: 'textPrimary', label: 'Primary Text' },
        { key: 'textSecondary', label: 'Secondary Text' },
        { key: 'accent', label: 'Accent' },
    ];

    return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Create a Theme</h2>
                 <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Theme Name"
                    className="w-full bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                />
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {colorVars.map(({key, label}) => (
                        <div key={key} className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg">
                            <label htmlFor={key}>{label}</label>
                            <input
                                id={key}
                                type="color"
                                value={colors[key]}
                                onChange={(e) => setColors(c => ({...c, [key]: e.target.value}))}
                                className="w-8 h-8 rounded-md border-none bg-transparent"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg">Save</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- NEW Dependency Selector Modal ---
const DependencySelectorModal = ({ isOpen, onClose, currentTaskId, tasks, onSelect }) => {
     if(!isOpen) return null;

    const potentialDependencies = tasks.filter(task => 
        !task.completed && 
        task.id !== currentTaskId &&
        task.dependsOn !== currentTaskId // Avoid circular dependencies
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Select Prerequisite Task</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                    {potentialDependencies.length > 0 ? potentialDependencies.map(task => (
                        <div key={task.id} onClick={() => onSelect(task.id)} className="p-3 bg-[var(--color-bg)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary-hover)]">
                            <p>{task.text}</p>
                        </div>
                    )) : <p className="text-sm text-[var(--color-text-secondary)]">No available tasks to depend on.</p>}
                </div>
                 <button onClick={onClose} className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg">Cancel</button>
            </motion.div>
        </motion.div>
    );
};

// --- NEW Archive Modal ---
const ArchiveModal = ({ isOpen, onClose, archivedTasks, onRestore, onDelete }) => {
    if(!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Archived Tasks</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {archivedTasks.length > 0 ? archivedTasks.map(task => (
                        <div key={task.id} className="p-3 bg-[var(--color-bg)] rounded-lg flex justify-between items-center">
                            <div>
                                <p className="line-through">{task.text}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">Completed: {formatDate(task.completionDate)}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onRestore(task.id)} className="text-emerald-400 hover:text-emerald-600">Restore</button>
                                <button onClick={() => onDelete(task.id)} className="text-rose-400 hover:text-rose-600">Delete</button>
                            </div>
                        </div>
                    )) : <p className="text-sm text-[var(--color-text-secondary)]">Your archive is empty.</p>}
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- NEW Share Summary Modal ---
const ShareSummaryModal = ({ isOpen, onClose, dailyStats }) => {
    if(!isOpen) return null;
    const [copied, setCopied] = useState(false);
    
    const summaryText = `Aura Daily Summary ✨\n\n✅ Tasks Completed: ${dailyStats.completed}\n⏰ Focus Sessions: ${dailyStats.focusSessions}\n🏆 Achievements: ${dailyStats.achievements}`;

    const handleCopy = () => {
        // For web, use the Clipboard API. It may not work in all iframe contexts.
        if (navigator.clipboard) {
            navigator.clipboard.writeText(summaryText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => console.error('Failed to copy!', err));
        } else {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = summaryText;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    }
    
    return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Today's Wins</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="bg-[var(--color-bg)] p-4 rounded-lg mb-4 whitespace-pre-wrap text-left">
                    {summaryText}
                </div>
                <button onClick={handleCopy} className="w-full bg-[var(--color-accent)] text-black font-semibold py-2 rounded-lg">
                    {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
                </button>
            </motion.div>
        </motion.div>
    );
};

// --- NEW Command Palette ---
const CommandPalette = ({ isOpen, onClose, commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if(isOpen) {
            setSearchTerm('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredCommands = useMemo(() => {
        if (!searchTerm) return commands;
        return commands.filter(cmd => cmd.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, commands]);
    
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredCommands]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const command = filteredCommands[selectedIndex];
            if (command) {
                command.action();
                onClose();
            }
        }
    };

    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[70] p-4 pt-20" onClick={onClose}>
            <motion.div initial={{ y: -50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: -50, scale: 0.95 }} className="w-full max-w-xl mx-auto bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <input 
                    ref={inputRef}
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or search..."
                    className="w-full bg-transparent text-lg p-4 focus:outline-none"
                />
                <div className="border-t border-[var(--color-border)] max-h-[50vh] overflow-y-auto">
                    {filteredCommands.length > 0 ? filteredCommands.map((cmd, index) => (
                        <div 
                            key={cmd.label} 
                            onClick={() => { cmd.action(); onClose(); }}
                            className={`p-3 text-sm cursor-pointer flex justify-between items-center ${selectedIndex === index ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-secondary-hover)]'}`}>
                            <span>{cmd.label}</span>
                            <span className="text-xs text-[var(--color-text-secondary)]">{cmd.shortcut}</span>
                        </div>
                    )) : <p className="p-3 text-sm text-[var(--color-text-secondary)]">No commands found.</p>}
                </div>
            </motion.div>
        </motion.div>
    );
};


// --- Main App Component ---
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
    
    // --- New States for Modals & Advanced Features ---
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
    
    // --- Notification Helpers ---
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
    }

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
    
    // --- Core Logic & Handlers ---
    useEffect(() => {
        const allDataLoaded = tasksLoaded && templatesLoaded && statsLoaded && achievementsLoaded && themeLoaded && groveLoaded && categoriesLoaded && launchedLoaded && journalLoaded && customThemesLoaded && shutdownTimeLoaded && soundEffectsLoaded && autoArchiveLoaded && notificationsLoaded;
        if (allDataLoaded) {
             if (!hasLaunched) {
                setTasks(demoTasks);
                setHasLaunched(true);
            }
            setTimeout(() => setIsLoading(false), 1500);
            
            // Load Tone.js
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

        // Shutdown Ritual Check
        const now = new Date();
        const [shutdownHour, shutdownMinute] = shutdownTime.split(':').map(Number);
        if (now.getHours() === shutdownHour && now.getMinutes() >= shutdownMinute && !shutdownRitual.active) {
            setShutdownRitual({ active: true, step: 0 });
            localStorage.setItem(lastPromptKey, getTodayDateString());
            return; // Prioritize shutdown ritual
        }
        
        const dayOfWeek = now.getDay();
        if (dayOfWeek === 1) { // Monday
            setAssistantMessage({ message: "It's a new week! Let's get organized. What are your main goals?" });
            localStorage.setItem(lastPromptKey, getTodayDateString());
        } else if (dayOfWeek === 5) { // Friday
             setAssistantMessage({ message: "It's Friday! A great time to look back at your wins this week in the Grove." });
             localStorage.setItem(lastPromptKey, getTodayDateString());
        }
    };

    const addTask = (text, applyTemplate = null) => {
        playSoundEffect('add');
        if (applyTemplate) { const template = templates.find(t => t.name === applyTemplate); if (!template) return; const newTasks = template.tasks.map(t => ({...t, id: Date.now() + Math.random(), subtasks: [], win: null, completionDate: null, notes: '', attachments: [], tags: [], isPinned: false, focusSessions: 0, isArchived: false })); setTasks(prev => [...prev, ...newTasks]); setTemplateSuggestion(null); return; }
        if (templateSuggestion) { setTemplateSuggestion(null); }
        
        const matchingTemplate = templates.find(t => text.toLowerCase().includes(t.name.toLowerCase()));
        if(matchingTemplate) { setTemplateSuggestion({ templateName: matchingTemplate.name, taskText: text }); return; }

        let { deadline, cleanedText, recurring } = parseIntelligentDeadline(text);

        // Parse tags
        const tagRegex = /@(\w+)/g;
        const tags = [...cleanedText.matchAll(tagRegex)].map(match => match[1]);
        cleanedText = cleanedText.replace(tagRegex, '').trim();

        let priority = 2; if (cleanedText.includes('!')) { priority = 3; cleanedText = cleanedText.replace(/!/g, '').trim(); } if (cleanedText.toLowerCase().includes('urgent')) { priority = 3; cleanedText = cleanedText.replace(/urgent/ig, '').trim(); } if (cleanedText.toLowerCase().includes('low priority')) { priority = 1; cleanedText = cleanedText.replace(/low priority/ig, '').trim(); }
        let category = 'General'; const categoryMatch = cleanedText.match(/#(\w+)/); if (categoryMatch) { category = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1); cleanedText = cleanedText.replace(/#\w+/, '').trim(); }
        let time = 'afternoon'; if (cleanedText.toLowerCase().includes('morning')) { time = 'morning'; cleanedText = cleanedText.replace(/morning/ig, '').trim(); } if (cleanedText.toLowerCase().includes('evening') || cleanedText.toLowerCase().includes('night')) { time = 'evening'; cleanedText = cleanedText.replace(/evening|night/ig, '').trim(); }
        const newTask = { id: Date.now(), text: cleanedText.replace(/  +/g, ' ').trim(), completed: false, priority, category, timeOfDay: time, deadline, subtasks: [], win: null, completionDate: null, recurring, notes: '', attachments: [], tags, isPinned: false, focusSessions: 0, isArchived: false };
        setTasks(prevTasks => [...prevTasks, newTask]);
    };
    
    const toggleTask = async (id) => {
        let taskToToggle = tasks.find(t=>t.id === id);
        if(!taskToToggle) return;

        const isCompleting = !taskToToggle.completed;
        if (isCompleting) {
            playSoundEffect('complete');
        }

        const newTasks = tasks.map(t => {
            if (t.id === id) {
                if (t.recurring) {
                    const nextDate = new Date(t.deadline || getTodayDateString());
                    if (t.recurring.type === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                    if (t.recurring.type === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                    if (t.recurring.type === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                    return { ...t, deadline: nextDate.toISOString().split('T')[0] };
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
        
        setTasks(newTasks);
    };

    const togglePin = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    };
    
    const handleSkipWin = (id) => {
        setWinModalTaskId(null);
    };

    const saveWin = (id, winText) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, win: winText } : t));
        setWinModalTaskId(null);
    };
    
    const deleteTask = async (id) => {
        const taskToDelete = tasks.find(t => t.id === id);
        if (taskToDelete && taskToDelete.attachments) {
            for (const att of taskToDelete.attachments) {
                await deleteFile(att.id);
            }
        }
        setTasks(tasks.filter(task => task.id !== id));
    };

    const archiveTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isArchived: true } : t));
    };

    const restoreTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isArchived: false } : t));
    };

    const saveTaskDetail = (id, newText, newNotes, newTags) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, text: newText, notes: newNotes, tags: newTags } : t));
    };

    const setTaskDependency = (taskId, dependencyId) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, dependsOn: dependencyId } : t));
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
        const treeTypes = ['oak', 'pine', 'cherry'];
        const unlockedTrees = ['oak'];
        if(unlockedAchievements.includes('streak_3')) unlockedTrees.push('pine');
        if(unlockedAchievements.includes('focused_finish')) unlockedTrees.push('cherry');
        const randomType = unlockedTrees[Math.floor(Math.random() * unlockedTrees.length)];
        
        setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: randomType }]);
        setIsPlanting(false);
    }

    const reorderTask = (taskId, direction) => {
        const tasksToSort = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);
        
        const index = tasksToSort.findIndex(t => t.id === taskId);
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= tasksToSort.length) return;
        
        const [movedTask] = tasksToSort.splice(index, 1);
        tasksToSort.splice(newIndex, 0, movedTask);
        
        setTasks([...tasksToSort, ...completedTasks]);
    };

    const toggleSubtask = (taskId, subtaskText) => {
        setTasks(tasks.map(task => {
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
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                setTasks(currentTasks => currentTasks.map(t => (t.completionDate === yesterdayStr ? {...t, isArchived: true} : t)));
            }

            if (tasksCompletedToday) {
                 const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

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
        const achievementsToday = unlockedAchievements.length; // Simplified; could be tracked more granularly
        return { completed: completedToday, focusSessions: focusToday, achievements: achievementsToday };
    }, [tasks, unlockedAchievements]);


    // Shutdown Ritual Content
    const shutdownRitualMessages = [
        `Let's wind down for the day. You completed ${tasksCompletedToday} tasks today. How do you feel?`,
        "Is there anything left on your mind? Capture any final thoughts for tomorrow.",
        "Your mind is clear. It's time to disconnect. See you tomorrow!"
    ];
    useEffect(() => {
        if (shutdownRitual.active) {
            setAssistantMessage({ message: shutdownRitualMessages[shutdownRitual.step] });
        } else if (!shutdownRitual.active && assistantMessage?.message.startsWith("Let's wind down")) {
            setAssistantMessage(null); // Clear assistant if ritual ends
        }
    }, [shutdownRitual]);

    // Themes
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

    // Data Import / Export
    const handleExport = () => {
        const data = { tasks, templates, stats, unlockedAchievements, theme, grove, customCategories, hasLaunched, journalEntries, customThemes, shutdownTime, soundEffectsEnabled, autoArchiveEnabled, notificationsEnabled };
        const jsonString = `data:text/json;charset=utf-f,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
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

    
    const ThemeBackground = ({ theme }) => {
        return <div className={`theme-bg theme-bg-${theme}`}>
            {theme === 'light' && <div className="light-bg">
                <div className="sun-rays"></div>
            </div>}
            {theme === 'forest' && <div className="forest-bg">
                <div className="forest-particles">
                    {[...Array(20)].map((_, i) => <div key={i} className="particle"></div>)}
                </div>
                <div className="forest-trees"></div>
                <div className="fireflies">
                    {[...Array(15)].map((_, i) => <div key={i} className="firefly"></div>)}
                </div>
            </div>}
            {theme === 'sakura' && <div className="sakura-petals">
                {[...Array(25)].map((_, i) => <div key={i} className="petal">🌸</div>)}
            </div>}
            {theme === 'dracula' && <div className="dracula-bg">
                <div className="dracula-moon"></div>
                <div className="dracula-graveyard"></div>
                <div className="dracula-fog"></div>
                <div className="dracula-bats">
                    {[...Array(7)].map((_, i) => <div key={i} className="bat">🦇</div>)}
                </div>
            </div>}
            {theme === 'cyberpunk' && <div className="cyber-code">
                {[...Array(40)].map((_, i) => <div key={i} className="code-char" style={{'--char': `'${Math.random().toString(36)[2]}'`}} ></div>)}
                <div className="cyber-grid"></div>
            </div>}
            {theme === 'crimson' && <div className="crimson-bg">
                <div className="crimson-mist">
                    {[...Array(5)].map((_, i) => <div key={i} className="mist-particle"></div>)}
                </div>
                 <div className="crimson-embers">
                    {[...Array(20)].map((_, i) => <div key={i} className="ember"></div>)}
                </div>
            </div>}
            {theme === 'ocean' && <div className="ocean-bg">
                <div className="ocean-caustics"></div>
                <div className="ocean-bubbles">
                    {[...Array(20)].map((_, i) => <div key={i} className="bubble"></div>)}
                </div>
                 <div className="ocean-fauna">
                    <div className="fish-group">{`><(((°>`}</div>
                    <div className="fish-group fish-group-2">{`><(((°>`}</div>
                 </div>
            </div>}
            {theme === 'dune' && <div className="dune-sand">
                 {[...Array(50)].map((_, i) => <div key={i} className="sand-particle"></div>)}
                 <div className="dune-haze"></div>
            </div>}
            {theme === 'solarized' && <div className="solarized-code">
                <div className="solarized-grid"></div>
                 <svg className="solarized-traces" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 0 50 L 100 50 L 100 150 L 200 150" />
                    <path d="M 50 0 L 50 100 L 150 100 L 150 200" />
                 </svg>
            </div>}
            {theme === 'nord' && <div className="nord-bg">
                <div className="aurora">
                    <div className="aurora-band"></div>
                    <div className="aurora-band"></div>
                    <div className="aurora-band"></div>
                </div>
                <div className="nord-snow">
                    {[...Array(50)].map((_, i) => <div key={i} className="snow-flake"></div>)}
                </div>
            </div>}
            {theme === 'monokai' && <div className="monokai-glitch">
                <div className="scanlines"></div>
            </div>}
            {theme === 'latte' && <div className="latte-steam">
                 {[...Array(10)].map((_, i) => <div key={i} className="steam-wisp"></div>)}
            </div>}
            {theme === 'gruvbox' && <div className="gruvbox-gears">
                <div className="gruvbox-grid"></div>
                {[...Array(5)].map((_, i) => <div key={i} className="gear">⚙️</div>)}
            </div>}
            {theme === 'rose_pine' && <div className="rose_pine-sky">
                <div className="rose_pine-stars"></div>
                <div className="rose_pine-twinkling"></div>
                <div className="rose_pine-nebula"></div>
            </div>}
            {theme === 'matcha' && <div className="matcha-pond">
                <div className="ripple"></div>
                <div className="ripple"></div>
                <div className="ripple"></div>
            </div>}
        </div>
    };

    // Keyboard Shortcuts & Command Palette
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
                case 'n': e.preventDefault(); document.querySelector('input[placeholder*="Capture a thought"]').focus(); break;
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
        { label: "New Task", action: () => document.querySelector('input[placeholder*="Capture a thought"]').focus(), shortcut: "N" },
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
                    <AnimatePresence>{isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} theme={theme} setTheme={setTheme} customCategories={customCategories} onUpdateCustomCategories={setCustomCategories} allThemes={allThemes} onOpenThemeCreator={() => setIsThemeCreatorOpen(true)} shutdownTime={shutdownTime} onSetShutdownTime={setShutdownTime} soundEffectsEnabled={soundEffectsEnabled} onSetSoundEffectsEnabled={setSoundEffectsEnabled} onOpenArchive={() => setIsArchiveOpen(true)} autoArchiveEnabled={autoArchiveEnabled} onSetAutoArchiveEnabled={setAutoArchiveEnabled} onExport={handleExport} onTriggerImport={() => importInputRef.current.click()} notificationsEnabled={notificationsEnabled} onSetNotificationsEnabled={handleSetNotifications}/>}</AnimatePresence>
                    <AnimatePresence>{isPlanting && <PlantingAnimation onComplete={finishPlanting} />}</AnimatePresence>
                    <AnimatePresence>{focusTask && <FocusView task={focusTask} onClose={() => setFocusTaskId(null)} onComplete={handleFocusComplete} />}</AnimatePresence>
                    <AnimatePresence>{winModalTaskId && <WinModal task={tasks.find(t => t.id === winModalTaskId)} onSave={saveWin} onClose={() => handleSkipWin(winModalTaskId)} />}</AnimatePresence>
                    <AnimatePresence>{templateSuggestion && <TemplateSuggestionModal suggestion={templateSuggestion} onApply={() => addTask(null, templateSuggestion.templateName)} onContinue={() => { addTask(templateSuggestion.taskText); }} onClose={() => setTemplateSuggestion(null)} />}</AnimatePresence>
                    <AnimatePresence>{achievementToast && <AchievementToast achievement={achievementToast} onClose={() => setAchievementToast(null)} />}</AnimatePresence>
                    <AnimatePresence>{toastMessage && <GenericToast message={toastMessage} onClose={() => setToastMessage(null)} />}</AnimatePresence>
                    <AnimatePresence><SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} tasks={tasks.filter(t=>!t.isArchived)} onTaskClick={(id) => { setDetailModal({isOpen: true, taskId: id}); setIsSearchOpen(false); }} /></AnimatePresence>
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

                /* Base Theme Variables */
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

                /* Unique Backgrounds and Effects */
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
                
                /* --- THEME LIVE ANIMATIONS --- */

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

