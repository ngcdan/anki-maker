import { QueryClient } from '@tanstack/react-query';

// Performance-optimized React Query configuration
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 10 minutes
        staleTime: 10 * 60 * 1000,
        // Keep cache for 15 minutes
        cacheTime: 15 * 60 * 1000,
        // Retry failed requests 3 times with exponential backoff
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus for better UX
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect unless data is stale
        refetchOnReconnect: 'always',
        // Refetch on mount only if data is stale
        refetchOnMount: true,
        // Background refetch interval (optional)
        refetchInterval: false,
        // Use error boundary for unhandled errors
        useErrorBoundary: (error: any) => {
          // Use error boundary for 5xx server errors
          return error?.status >= 500;
        },
      },
      mutations: {
        // Retry mutations once on network errors
        retry: (failureCount, error: any) => {
          if (error?.name === 'NetworkError' && failureCount < 1) {
            return true;
          }
          return false;
        },
        retryDelay: 1000,
        // Use error boundary for critical mutation errors
        useErrorBoundary: (error: any) => {
          // Critical errors that should crash the app
          return error?.status === 500 || error?.name === 'ChunkLoadError';
        },
      },
    },
  });
};

// Query key factory for consistent cache management
export const queryKeys = {
  // Anki-related queries
  anki: {
    all: ['anki'] as const,
    decks: () => [...queryKeys.anki.all, 'decks'] as const,
    tags: () => [...queryKeys.anki.all, 'tags'] as const,
    models: () => [...queryKeys.anki.all, 'models'] as const,
    modelFields: (modelName: string) => [...queryKeys.anki.all, 'model-fields', modelName] as const,
    recentNotes: (modelName: string, tags: string[]) =>
      [...queryKeys.anki.all, 'recent-notes', modelName, tags] as const,
  },
  // OpenAI-related queries
  openai: {
    all: ['openai'] as const,
    suggestions: (prompt: string, options: any) =>
      [...queryKeys.openai.all, 'suggestions', prompt, options] as const,
  },
  // TTS-related queries
  tts: {
    all: ['tts'] as const,
    audio: (text: string, voice: string) =>
      [...queryKeys.tts.all, 'audio', text, voice] as const,
  },
} as const;

// Performance monitoring utilities
export const queryClientUtils = {
  // Clear all caches
  clearAllCaches: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  // Prefetch critical data
  prefetchCriticalData: async (queryClient: QueryClient) => {
    // Prefetch decks and tags on app startup
    try {
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: queryKeys.anki.decks(),
          staleTime: 5 * 60 * 1000, // 5 minutes
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.anki.tags(),
          staleTime: 5 * 60 * 1000,
        }),
      ]);
    } catch (error) {
      console.warn('Failed to prefetch critical data:', error);
    }
  },

  // Invalidate related caches
  invalidateAnkiData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.anki.all });
  },

  // Remove stale data
  removeStaleData: (queryClient: QueryClient) => {
    queryClient.removeQueries({
      predicate: (query) => query.isStale()
    });
  },

  // Get cache stats for debugging
  getCacheStats: (queryClient: QueryClient) => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: queries.reduce((size, query) => {
        const dataSize = JSON.stringify(query.state.data || {}).length;
        return size + dataSize;
      }, 0),
    };
  },
};