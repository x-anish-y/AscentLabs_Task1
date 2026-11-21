import { useState, useEffect } from 'react';

/**
 * Custom hook to manage state synchronized with window.localStorage.
 * Safe against JSON parsing errors and storage quota/permission exceptions.
 *
 * @template T
 * @param {string} key - localStorage key
 * @param {T} initialValue - Fallback value
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(`[useLocalStorage] Error setting key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
