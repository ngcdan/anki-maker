export const ENDPOINTS = {
  ANKI_CONNECT: 'http://localhost:8765',
  TTS_SERVICE: 'http://localhost:3000/dev/chatbot/tts/api',
  // Direct OpenAI API for both dev and production (API key sent from client)
  OPENAI_API: 'https://api.openai.com/v1/chat/completions',
  OPENAI_TTS: 'https://api.openai.com/v1/audio/speech',
} as const;

export const ANKI_CONNECT_VERSION = 6;

export const DEFAULT_ANKI_CONNECT_PORT = 8765;
export const DEFAULT_TTS_PORT = 3000;