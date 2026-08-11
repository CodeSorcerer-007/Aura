import { useState, useEffect } from 'react';
import { getDBItem, setDBItem } from '../utils/db';

export const usePreferences = <T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, boolean] => {
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loadValue = async () => {
            try {
                const dbValue = await getDBItem<T>(key);
                if (dbValue !== null && dbValue !== undefined) {
                    if (isMounted) setStoredValue(dbValue);
                } else if (typeof window !== 'undefined' && window.localStorage) {
                    const item = window.localStorage.getItem(key);
                    if (item !== null) {
                        const parsed = JSON.parse(item);
                        if (isMounted) setStoredValue(parsed);
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

    const setValue = (value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            setDBItem(key, valueToStore);
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (e) {
            console.error(`Error setting preference ${key}`, e);
        }
    };

    return [storedValue, setValue, isLoaded];
};
