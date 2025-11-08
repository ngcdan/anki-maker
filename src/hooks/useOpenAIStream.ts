// Hook for streaming AI responses
import { useState, useCallback, useContext } from 'react';
import { OpenAIKeyContext } from '../OpenAIKeyContext';
import { useAIConfig } from '../contexts/AIConfigContext';
import { SuggestOptions, Note } from '../types';
import { ERROR_MESSAGES } from '../constants';
import { enhancedOpenAIService } from '../services/enhanced/enhancedOpenAIService';

interface StreamState {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  notes: Note[];
}

export const useOpenAIStream = () => {
  const { openAIKey } = useContext(OpenAIKeyContext);
  const aiConfig = useAIConfig();

  const [streamState, setStreamState] = useState<StreamState>({
    content: '',
    isStreaming: false,
    isComplete: false,
    error: null,
    notes: [],
  });

  const startStreaming = useCallback(async (
    options: SuggestOptions,
    existingNotes: Note[] = []
  ) => {
    if (!openAIKey) {
      setStreamState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.OPENAI_KEY_MISSING,
      }));
      return;
    }

    setStreamState({
      content: '',
      isStreaming: true,
      isComplete: false,
      error: null,
      notes: [],
    });

    try {
      const enhancedOptions = {
        ...options,
        ...aiConfig,
      };

      const stream = enhancedOpenAIService.suggestAnkiNotesStream(
        openAIKey,
        enhancedOptions,
        existingNotes
      );

      for await (const chunk of stream) {
        setStreamState(prev => ({
          ...prev,
          content: chunk.content,
          isComplete: chunk.isComplete,
          notes: chunk.note || prev.notes,
          isStreaming: !chunk.isComplete,
        }));

        if (chunk.isComplete) {
          break;
        }
      }
    } catch (error) {
      setStreamState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isStreaming: false,
      }));
    }
  }, [openAIKey, aiConfig]);

  const resetStream = useCallback(() => {
    setStreamState({
      content: '',
      isStreaming: false,
      isComplete: false,
      error: null,
      notes: [],
    });
  }, []);

  return {
    ...streamState,
    startStreaming,
    resetStream,
  };
};