import { useState } from 'react';
import { ttsService } from '../services';
import { useErrorHandler } from './useErrorHandler';

export interface UseTTSOptions {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
  model?: 'tts-1' | 'tts-1-hd';
  addPauseBetweenSentences?: boolean;
  answerText?: string; // Text to add extra pause after
}

/**
 * Add pauses between dialogue turns (between different speakers)
 * OpenAI TTS pauses naturally at: periods, commas, line breaks
 */
const addPausesToText = (text: string, answerText?: string): string => {
  // Strategy: Add pauses between dialogue turns, not between sentences from same speaker

  // Common dialogue patterns:
  // - Lines starting with "- " or "• " (bullet points)
  // - Lines separated by line breaks
  // - Pattern: "Speaker: text" or just separate paragraphs

  // 1. Split by double line breaks or dialogue markers
  let dialogueTurns: string[] = [];

  // Try to detect dialogue structure
  if (text.includes('\n- ') || text.includes('\n• ')) {
    // Bullet point style dialogue
    dialogueTurns = text.split(/\n(?=[-•]\s)/).filter(t => t.trim());
  } else if (text.includes('\n\n')) {
    // Paragraph style dialogue
    dialogueTurns = text.split(/\n\n+/).filter(t => t.trim());
  } else if (text.match(/\n[A-Z][a-z]+:/)) {
    // "Speaker: text" style
    dialogueTurns = text.split(/\n(?=[A-Z][a-z]+:)/).filter(t => t.trim());
  } else {
    // Fallback: split by single line breaks
    dialogueTurns = text.split(/\n+/).filter(t => t.trim());
  }

  // If no clear dialogue structure, treat each sentence as a turn
  if (dialogueTurns.length === 1) {
    // Split by sentence endings
    const sentences = text.split(/([.!?]+\s+)/).filter(s => s.trim());
    const grouped: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      grouped.push((sentences[i] || '') + (sentences[i + 1] || ''));
    }
    dialogueTurns = grouped.filter(t => t.trim());
  }

  // 2. Process each dialogue turn
  const processedTurns = dialogueTurns.map((turn) => {
    let processed = turn.trim();

    // If this turn contains the answer text, add EXTRA long pause after it (6s)
    if (answerText && turn.includes(answerText)) {
      // Add MANY periods after the answer for 6 second pause
      const escapedAns = answerText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      processed = processed.replace(
        new RegExp(`(${escapedAns})`, 'gi'),
        '$1. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . '
      );
    }

    return processed;
  });

  // 3. Join dialogue turns with periods for 4 second pauses between speakers
  return processedTurns.join('. . . . . . . . . . . . . . . . . . . . ');
};

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
      // Add pauses between sentences if requested
      const processedText = options.addPauseBetweenSentences
        ? addPausesToText(text, options.answerText)
        : text;

      const audioResponse = await ttsService.generateAudioWithOpenAI(processedText, openAIKey, {
        voice: options.voice || 'alloy',
        speed: options.speed || 0.85, // Slower for better clarity and natural pauses
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