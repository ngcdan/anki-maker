import { useToast } from '../components/ToastProvider';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

export interface UseErrorHandlerReturn {
  handleError: (error: unknown, context?: string) => void;
  handleSuccess: (message?: string, context?: string) => void;
  handleWarning: (message: string, context?: string) => void;
  handleInfo: (message: string, context?: string) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const handleError = (error: unknown, context?: string) => {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);

    let errorMessage: string = ERROR_MESSAGES.UNKNOWN;

    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message.includes('AnkiConnect')) {
        errorMessage = ERROR_MESSAGES.ANKI_CONNECTION;
      } else if (error.message.includes('OpenAI') || error.message.includes('API key')) {
        errorMessage = ERROR_MESSAGES.OPENAI_API;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = ERROR_MESSAGES.NETWORK;
      } else if (error.message.includes('TTS')) {
        errorMessage = ERROR_MESSAGES.TTS_SERVICE;
      } else if (error.message.includes('audio')) {
        errorMessage = ERROR_MESSAGES.AUDIO_GENERATION;
      } else if (error.message.includes('parsing') || error.message.includes('JSON')) {
        errorMessage = ERROR_MESSAGES.PARSING_ERROR;
      } else {
        // Use the error message if it's user-friendly
        errorMessage = error.message.length < 100 ? error.message : ERROR_MESSAGES.UNKNOWN;
      }
    }

    showError(errorMessage);
  };

  const handleSuccess = (message?: string, context?: string) => {
    const successMessage = message || SUCCESS_MESSAGES.NOTE_CREATED;
    console.log(`Success${context ? ` in ${context}` : ''}:`, successMessage);
    showSuccess(successMessage);
  };

  const handleWarning = (message: string, context?: string) => {
    console.warn(`Warning${context ? ` in ${context}` : ''}:`, message);
    showWarning(message);
  };

  const handleInfo = (message: string, context?: string) => {
    console.info(`Info${context ? ` in ${context}` : ''}:`, message);
    showInfo(message);
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
};

// Helper function to extract meaningful error messages
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }

  return ERROR_MESSAGES.UNKNOWN;
};

// Helper function to check if an error is a network error
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  if (error instanceof Error && error.message.toLowerCase().includes('network')) {
    return true;
  }

  return false;
};

// Helper function to check if an error is an API error
export const isAPIError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('api') || message.includes('http') || message.includes('status');
  }

  return false;
};