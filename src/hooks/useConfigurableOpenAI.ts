import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { openaiService } from '../services/openai/openaiService';
import { usePromptConfig } from '../contexts/PromptConfigContext';
import { SuggestOptions, Note } from '../types';

interface UseConfigurableOpenAIOptions {
  onSuccess?: (notes: Note[]) => void;
  onError?: (error: Error) => void;
}

export const useConfigurableOpenAI = (options?: UseConfigurableOpenAIOptions): UseMutationResult<Note[], Error, Omit<SuggestOptions, 'config'>> => {
  const { currentConfig } = usePromptConfig();

  return useMutation({
    mutationFn: async (suggestOptions: Omit<SuggestOptions, 'config'>) => {
      return openaiService.generateCardsWithConfig(suggestOptions, currentConfig);
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    }
  });
};