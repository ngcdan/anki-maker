export const ENDPOINTS = {
  ANKI_CONNECT: 'http://localhost:8765',
  TTS_SERVICE: 'http://localhost:3000/dev/chatbot/tts/api',
  // Use serverless function for both dev and prod to avoid CORS
  OPENAI_API: '/api/openai',
  OPENAI_TTS: '/api/openai-tts',
} as const;

export const ANKI_CONNECT_VERSION = 6;

export const DEFAULT_ANKI_CONNECT_PORT = 8765;
export const DEFAULT_TTS_PORT = 3000;