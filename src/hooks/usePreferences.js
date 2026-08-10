import { useState, useEffect } from 'react';
import { getDBItem, setDBItem } from '../utils/db';

// --- Hybrid IndexedDB + LocalStorage Preferences Hook ---
export const usePreferences = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadValue = async () => {
            try {
                // 1. Try reading from IndexedDB
                const dbValue = await getDBItem(key);
                if (dbValue !== null && dbValue !== undefined) {
                    if (isMounted) setStoredValue(dbValue);
                } else if (typeof window !== 'undefined' && window.localStorage) {
                    // 2. Fallback / Migration from localStorage
                    const item = window.localStorage.getItem(key);
                    if (item !== null) {
                        const parsed = JSON.parse(item);
                        if (isMounted) setStoredValue(parsed);
                        // Save migrated data to IndexedDB
                        await setDBItem(key, parsed);
                    }
                }
            } catch (e) {
                console.error(`Error reading preference ${key}`, e);
                if (isMounted) setStoredValue(initialValue);
            } finally {
                if (isMounted) setIsLoaded(true);
            }
        };
        loadValue();
        return () => { isMounted = false; };
    }, [key]);

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            
            // Write to IndexedDB async
            setDBItem(key, valueToStore);

            // Backup copy to localStorage for legacy sync
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (e) {
            console.error(`Error setting preference ${key}`, e);
        }
    };

    return [storedValue, setValue, isLoaded];
};
