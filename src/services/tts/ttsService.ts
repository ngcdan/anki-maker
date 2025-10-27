import { ENDPOINTS, ERROR_MESSAGES } from '../../constants';
import { TTSRequest, TTSResponse, OpenAITTSRequest, OpenAITTSResponse } from '../../types';

class TTSService {
  // Legacy method for backward compatibility
  async generateAudio(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await fetch(ENDPOINTS.TTS_SERVICE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TTSResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.TTS_SERVICE);
      }
      throw error;
    }
  }

  // New OpenAI TTS method
  async generateAudioWithOpenAI(
    text: string,
    openAIKey: string,
    options: Partial<OpenAITTSRequest> = {}
  ): Promise<OpenAITTSResponse> {
    if (!openAIKey) {
      throw new Error(ERROR_MESSAGES.OPENAI_KEY_MISSING);
    }

    try {
      const request: OpenAITTSRequest = {
        model: 'tts-1',
        input: text,
        voice: 'alloy',
        response_format: 'mp3',
        speed: 1.0,
        ...options,
      };

      const response = await fetch(ENDPOINTS.OPENAI_TTS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(ERROR_MESSAGES.OPENAI_API);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();

      // Generate a unique filename
      const timestamp = Date.now();
      const fileName = `tts_audio_${timestamp}.mp3`;

      return {
        audioBuffer,
        fileName,
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      if (error instanceof Error && error.message.includes('OpenAI')) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.OPENAI_TTS);
    }
  }

  // Convert audio buffer to base64 for Anki
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Create audio file object for Anki
  createAnkiAudioFile(audioBuffer: ArrayBuffer, fileName: string) {
    const base64Audio = this.arrayBufferToBase64(audioBuffer);

    return {
      filename: fileName,
      data: base64Audio,
      fields: ['Front'],
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple request
      await this.generateAudio({
        text: 'test',
        download: false,
        dir: '/tmp',
      });
      return true;
    } catch {
      return false;
    }
  }

  async testOpenAIConnection(openAIKey: string): Promise<boolean> {
    try {
      await this.generateAudioWithOpenAI('test', openAIKey);
      return true;
    } catch {
      return false;
    }
  }
}

export const ttsService = new TTSService();