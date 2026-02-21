import { AppConfig } from './types';

// ===============================================================================
// API ENDPOINTS & NETWORK CONFIGURATION
// ===============================================================================

export const ENDPOINTS = {
  ANKI_CONNECT: 'http://127.0.0.1:8765',
  OPENAI_API: 'https://api.openai.com/v1/chat/completions',
  OPENAI_TTS: 'https://api.openai.com/v1/audio/speech',
} as const;

export const ANKI_CONNECT_VERSION = 6;
export const DEFAULT_ANKI_CONNECT_PORT = 8765;

// ===============================================================================
// APPLICATION CONFIGURATION
// ===============================================================================

export const DEFAULT_APP_CONFIG: AppConfig = {
  ankiConnect: {
    url: 'http://localhost',
    port: 8765,
  },
  tts: {
    enabled: true,
  },
  openai: {
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7,
  },
};

export const DEFAULT_SETTINGS = {
  deckName: 'CS',
  modelName: 'Basic_cloze',
  tags: [] as string[],
} as const;

// ===============================================================================
// STORAGE & CACHING KEYS
// ===============================================================================

export const STORAGE_KEYS = {
  OPENAI_KEY: 'openAIKey',
  DECK_NAME: 'deckName',
  TAGS: 'tags',
  APP_CONFIG: 'appConfig',
} as const;

export const QUERY_KEYS = {
  DECKS: 'decks',
  TAGS: 'tags',
  MODELS: 'models',
  MODEL_FIELDS: 'modelFields',
} as const;

// ===============================================================================
// ERROR MESSAGES
// ===============================================================================

export const ERROR_MESSAGES = {
  // Anki Integration Errors
  ANKI_CONNECTION: 'Không thể kết nối với Anki. Vui lòng kiểm tra AnkiConnect plugin và đảm bảo Anki đang chạy.',
  ANKI_CORS: 'Lỗi CORS với AnkiConnect. Vui lòng kiểm tra cài đặt CORS trong AnkiConnect.',
  CARD_CREATION_FAILED: 'Lỗi tạo thẻ trong Anki. Vui lòng thử lại.',

  // OpenAI API Errors
  OPENAI_API: 'Lỗi OpenAI API. Vui lòng kiểm tra API key của bạn.',
  OPENAI_KEY_MISSING: 'Chưa có OpenAI API key. Vui lòng nhập key trong Settings.',
  OPENAI_TTS: 'Lỗi OpenAI Text-to-Speech. Vui lòng thử lại.',
  AI_GENERATION_FAILED: 'Lỗi tạo ghi chú với AI. Vui lòng thử lại.',

  // Network & Data Processing Errors
  NETWORK: 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.',
  INVALID_RESPONSE: 'Phản hồi không hợp lệ từ server.',
  PARSING_ERROR: 'Lỗi phân tích dữ liệu.',

  // Audio Processing Errors
  AUDIO_GENERATION: 'Lỗi tạo audio. Danh sách audio trống.',

  // Generic Errors
  UNKNOWN: 'Đã xảy ra lỗi không xác định.',
} as const;

// ===============================================================================
// SUCCESS MESSAGES
// ===============================================================================

export const SUCCESS_MESSAGES = {
  // Note & Card Operations
  NOTE_CREATED: 'Đã tạo thẻ thành công!',
  NOTE_TRASHED: 'Đã bỏ thẻ vào thùng rác.',
  NOTES_GENERATED: 'Đã tạo ghi chú thành công!',
  CARD_CREATED: 'Đã tạo thẻ thành công!',

  // Settings & Configuration
  SETTINGS_SAVED: 'Đã lưu cài đặt.',
} as const;