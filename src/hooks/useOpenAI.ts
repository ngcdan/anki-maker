import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { OpenAIKeyContext } from '../OpenAIKeyContext';
import { useAIConfig } from '../contexts/AIConfigContext';
import { SuggestOptions, Note } from '../types';
import { ERROR_MESSAGES } from '../constants';

// Import enhanced service
import { enhancedOpenAIService } from '../services/enhanced/enhancedOpenAIService';

export const useOpenAI = () => {
  const { openAIKey } = useContext(OpenAIKeyContext);
  const aiConfig = useAIConfig();

  const suggestNotesMutation = useMutation({
    mutationFn: ({ options, existingNotes }: {
      options: SuggestOptions;
      existingNotes: Note[]
    }) => {
      if (!openAIKey) {
        throw new Error(ERROR_MESSAGES.OPENAI_KEY_MISSING);
      }

      // Merge user config with options
      const enhancedOptions = {
        ...options,
        ...aiConfig,
      };

      return enhancedOpenAIService.suggestAnkiNotes(openAIKey, enhancedOptions, existingNotes);
    },
    onError: (error) => {
      console.error('Error suggesting notes:', error);
    },
  });

  return {
    suggestNotes: suggestNotesMutation.mutate,
    isLoading: suggestNotesMutation.isLoading,
    error: suggestNotesMutation.error,
    isSuccess: suggestNotesMutation.isSuccess,
    data: suggestNotesMutation.data,
    reset: suggestNotesMutation.reset,
  };
};

export const useOpenAIKey = () => {
  const { openAIKey, setOpenAIKey } = useContext(OpenAIKeyContext);

  const isValidKey = (key: string): boolean => {
    return key.startsWith('sk-') && key.length > 20;
  };

  return {
    openAIKey,
    setOpenAIKey,
    hasValidKey: isValidKey(openAIKey),
    isValidKey,
  };
};