import { useMemo, useCallback, useRef, useEffect } from 'react';
import { debounce } from 'lodash-es';

/**
 * Hook to optimize rendering of large lists with virtualization
 */
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const { visibleItems, startIndex, endIndex } = useMemo(() => {
    const itemsPerPage = Math.ceil(containerHeight / itemHeight);
    const buffer = Math.ceil(itemsPerPage * 0.5); // 50% buffer for future virtualization

    // For now, show all items (can be enhanced with virtual scrolling)
    // In future: implement actual virtualization using buffer
    return {
      visibleItems: items,
      startIndex: 0,
      endIndex: items.length - 1,
      buffer, // Keep buffer for future use
    };
  }, [items, itemHeight, containerHeight]);

  return {
    visibleItems,
    startIndex,
    endIndex,
    scrollElementRef,
  };
};

/**
 * Hook to debounce search/filter operations
 */
export const useDebouncedSearch = <T>(
  items: T[],
  searchTerm: string,
  filterFn: (item: T, term: string) => boolean,
  delay: number = 300
) => {
  const debouncedFilterFn = useCallback(
    debounce((term: string) => {
      return items.filter(item => filterFn(item, term));
    }, delay),
    [items, filterFn, delay]
  );

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    return debouncedFilterFn(searchTerm);
  }, [items, searchTerm, debouncedFilterFn]);

  return filteredItems;
};

/**
 * Hook to optimize re-renders with shallow comparison
 */
export const useShallowMemo = <T>(value: T): T => {
  const ref = useRef<T>(value);

  const isEqual = useMemo(() => {
    if (Array.isArray(value) && Array.isArray(ref.current)) {
      if (value.length !== ref.current.length) return false;
      return value.every((item, index) => item === ref.current[index]);
    }

    if (value && typeof value === 'object' && ref.current && typeof ref.current === 'object') {
      const keys1 = Object.keys(value);
      const keys2 = Object.keys(ref.current);

      if (keys1.length !== keys2.length) return false;

      return keys1.every(key =>
        (value as any)[key] === (ref.current as any)[key]
      );
    }

    return value === ref.current;
  }, [value]);

  if (!isEqual) {
    ref.current = value;
  }

  return ref.current;
};

/**
 * Hook to measure component performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderCount: renderCountRef.current,
        timeSinceLastRender,
        timestamp: now,
      });
    }

    lastRenderTimeRef.current = now;
  });

  return {
    renderCount: renderCountRef.current,
  };
};

/**
 * Hook to optimize expensive calculations
 */
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList,
  shouldRecalculate?: (prev: T, current: T) => boolean
) => {
  const result = useMemo(calculation, dependencies);
  const prevResultRef = useRef<T>(result);

  const shouldUpdate = useMemo(() => {
    if (shouldRecalculate) {
      return shouldRecalculate(prevResultRef.current, result);
    }
    return true;
  }, [result, shouldRecalculate]);

  if (shouldUpdate) {
    prevResultRef.current = result;
  }

  return prevResultRef.current;
};

/**
 * Hook to manage form state with optimized updates
 */
export const useOptimizedForm = <T extends Record<string, any>>(
  initialValues: T
) => {
  const valuesRef = useRef<T>(initialValues);
  const updatersRef = useRef<Record<keyof T, (value: any) => void>>({} as any);

  // Create stable updater functions
  const getUpdater = useCallback((field: keyof T) => {
    if (!updatersRef.current[field]) {
      updatersRef.current[field] = (value: any) => {
        valuesRef.current = {
          ...valuesRef.current,
          [field]: value,
        };
      };
    }
    return updatersRef.current[field];
  }, []);

  const setValue = useCallback((field: keyof T, value: any) => {
    const updater = getUpdater(field);
    updater(value);
  }, [getUpdater]);

  const reset = useCallback(() => {
    valuesRef.current = initialValues;
  }, [initialValues]);

  return {
    values: valuesRef.current,
    setValue,
    reset,
    getUpdater,
  };
};

/**
 * Utility function to check if component should re-render
 */
export const shouldComponentUpdate = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  ignoredKeys: (keyof T)[] = []
): boolean => {
  const keys = Object.keys(nextProps) as (keyof T)[];

  for (const key of keys) {
    if (ignoredKeys.includes(key)) continue;

    if (prevProps[key] !== nextProps[key]) {
      return true;
    }
  }

  return false;
};