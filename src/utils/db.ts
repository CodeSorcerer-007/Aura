// --- IndexedDB Helper with Schema Versioning & Migrations ---
import { debounce } from './debounce';
import { Task } from '../types';

const dbName = 'AuraDB';
const DB_VERSION = 2;

const attachmentStoreName = 'attachments';
const prefStoreName = 'preferences';

const pendingWrites = new Map<string, ReturnType<typeof debounce>>();

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject("IndexedDB not available in current environment");
    }
    const request = indexedDB.open(dbName, DB_VERSION);
    request.onerror = () => reject("Error opening IndexedDB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(attachmentStoreName)) {
        db.createObjectStore(attachmentStoreName);
      }
      if (!db.objectStoreNames.contains(prefStoreName)) {
        db.createObjectStore(prefStoreName);
      }
    };
  });
};

/**
 * Migration runner for items loaded from IndexedDB
 */
export const migrateData = (key: string, data: any) => {
  if (!data) return data;

  // Schema version 1 migrations (defaults for task fields, etc.)
  if (key === 'aura-tasks' && Array.isArray(data)) {
    return data.map((task: Partial<Task>): Task => ({
      id: task.id || crypto.randomUUID(),
      createdAt: task.createdAt || Date.now(),
      text: task.text || '',
      completed: !!task.completed,
      priority: task.priority ?? 2,
      category: task.category || 'General',
      timeOfDay: task.timeOfDay || 'morning',
      deadline: task.deadline || null,
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      win: task.win || null,
      completionDate: task.completionDate || null,
      recurring: task.recurring || null,
      notes: task.notes || '',
      attachments: Array.isArray(task.attachments) ? task.attachments : [],
      tags: Array.isArray(task.tags) ? task.tags : [],
      isPinned: !!task.isPinned,
      focusSessions: task.focusSessions || 0,
      isArchived: !!task.isArchived,
      dependsOn: task.dependsOn,
      estimatedMinutes: task.estimatedMinutes
    }));
  }

  return data;
};

export const setFile = async (key: string, value: any): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(attachmentStoreName, 'readwrite');
    const store = transaction.objectStore(attachmentStoreName);
    const request = store.put(value, key);
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getFile = async (key: string): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(attachmentStoreName, 'readonly');
    const store = transaction.objectStore(attachmentStoreName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteFile = async (key: string): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(attachmentStoreName, 'readwrite');
    const store = transaction.objectStore(attachmentStoreName);
    const request = store.delete(key);
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getDBItem = async <T = any>(key: string): Promise<T | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(prefStoreName, 'readonly');
      const store = transaction.objectStore(prefStoreName);
      const request = store.get(key);
      request.onsuccess = () => {
        const raw = request.result !== undefined ? request.result : null;
        resolve(migrateData(key, raw) as T);
      };
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

export const setDBItem = async (key: string, value: any): Promise<any> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(prefStoreName, 'readwrite');
      const store = transaction.objectStore(prefStoreName);
      const request = store.put(value, key);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.error("IndexedDB write failed:", e);
  }
};

/**
 * Debounced DB writer per key to prevent disk I/O thrashing during rapid state mutations
 */
export const setDBItemDebounced = (key: string, value: any, delay = 400): void => {
  if (!pendingWrites.has(key)) {
    const debouncedFn = debounce((val: any) => {
      setDBItem(key, val);
    }, delay);
    pendingWrites.set(key, debouncedFn);
  }
  pendingWrites.get(key)!(value);
};
