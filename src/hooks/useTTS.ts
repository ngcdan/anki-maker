import { useState } from 'react';
import { ttsService } from '../services';
import { useErrorHandler } from './useErrorHandler';

export interface UseTTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  model?: 'tts-1' | 'tts-1-hd';
}

export const useTTS = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { handleError, handleSuccess } = useErrorHandler();

  const generateAudio = async (
    text: string,
    openAIKey: string,
    options: UseTTSOptions = {}
  ): Promise<{ audioBuffer: ArrayBuffer; fileName: string } | null> => {
    if (!text || !openAIKey) {
      handleError(new Error('Text và OpenAI key là bắt buộc'));
      return null;
    }

    setIsGenerating(true);
    try {
      const audioResponse = await ttsService.generateAudioWithOpenAI(text, openAIKey, {
        voice: options.voice || 'alloy',
        speed: options.speed || 1.0,
        model: options.model || 'tts-1',
      });

      handleSuccess('Đã tạo audio thành công!');
      return audioResponse;
    } catch (error) {
      handleError(error, 'TTS generation');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const createAnkiAudioFile = (audioBuffer: ArrayBuffer, fileName: string) => {
    return ttsService.createAnkiAudioFile(audioBuffer, fileName);
  };

  const testConnection = async (openAIKey: string): Promise<boolean> => {
    try {
      return await ttsService.testOpenAIConnection(openAIKey);
    } catch {
      return false;
    }
  };

  return {
    generateAudio,
    createAnkiAudioFile,
    testConnection,
    isGenerating,
  };
};