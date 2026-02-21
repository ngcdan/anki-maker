import { useState } from 'react';
import { ttsService } from '../services/ttsService';

export interface UseTTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  model?: 'tts-1' | 'tts-1-hd';
}

export const useTTS = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAudio = async (
    text: string,
    openAIKey: string,
    options: UseTTSOptions = {}
  ): Promise<{ audioBuffer: ArrayBuffer; fileName: string } | null> => {
    if (!text || !openAIKey) {
      console.error('Text và OpenAI key là bắt buộc');
      return null;
    }

    setIsGenerating(true);
    try {
      const audioResponse = await ttsService.generateAudioWithOpenAI(text, openAIKey, {
        voice: options.voice || 'alloy',
        speed: options.speed || 1.0,
        model: options.model || 'tts-1',
      });

      return audioResponse;
    } catch (error) {
      console.error('TTS generation error:', error);
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
      return await ttsService.testConnection(openAIKey);
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