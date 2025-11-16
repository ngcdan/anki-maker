import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { OpenAIKeyContext } from '../contexts/OpenAIKeyContext';
import { SuggestOptions, Note } from '../shared';
import { ERROR_MESSAGES } from '../shared';

// Import service (sẽ tạo sau)
import { openaiService } from '../services/openai';

export const useOpenAI = () => {
  const { openAIKey } = useContext(OpenAIKeyContext);

  const suggestNotesMutation = useMutation({
    mutationFn: ({ options, existingNotes }: {
      options: SuggestOptions;
      existingNotes: Note[]
    }) => {
      if (!openAIKey) {
        throw new Error(ERROR_MESSAGES.OPENAI_KEY_MISSING);
      }
      return openaiService.suggestAnkiNotes(openAIKey, options, existingNotes);
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