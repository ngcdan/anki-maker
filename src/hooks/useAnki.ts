import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, ERROR_MESSAGES } from '../constants';
import { Note } from '../types';

// Import services (sẽ tạo sau)
import { ankiService } from '../services/anki';

export const useDecks = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DECKS],
    queryFn: () => ankiService.fetchDecks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error fetching decks:', error);
    },
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TAGS],
    queryFn: () => ankiService.fetchTags(),
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching tags:', error);
    },
  });
};

export const useModels = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.MODELS],
    queryFn: () => ankiService.fetchModels(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      console.error('Error fetching models:', error);
    },
  });
};

export const useModelFields = (modelName: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MODEL_FIELDS, modelName],
    queryFn: () => ankiService.fetchModelFieldNames(modelName),
    enabled: !!modelName,
    staleTime: 10 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching model fields:', error);
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: Note) => ankiService.addNote(note),
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries([QUERY_KEYS.TAGS]);
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      throw new Error(ERROR_MESSAGES.ANKI_CONNECTION);
    },
  });
};

export const useAnkiConnection = () => {
  const { data: decks, error: decksError, isLoading: decksLoading } = useDecks();
  const { data: tags, error: tagsError, isLoading: tagsLoading } = useTags();

  const isConnected = !decksError && !tagsError;
  const isLoading = decksLoading || tagsLoading;
  const hasError = !!decksError || !!tagsError;

  return {
    isConnected,
    isLoading,
    hasError,
    decks: decks || [],
    tags: tags || [],
    error: decksError || tagsError,
  };
};