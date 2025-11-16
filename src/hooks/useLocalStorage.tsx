import { useState, useEffect } from 'react';

function useLocalStorage<T>(
  storageKey: string,
  fallbackState: T
): [T, React.Dispatch<React.SetStateAction<T>>] {

  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(storageKey);
    if (storedValue !== null) {
      try {
        return JSON.parse(storedValue);
      } catch (error) {
        console.error(`Error parsing stored value for key "${storageKey}":`, error);
      }
    }
    return fallbackState;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
}

export default useLocalStorage;
