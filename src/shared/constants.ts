// ===============================================================================
// API ENDPOINTS & NETWORK CONFIGURATION
// ===============================================================================

export const ENDPOINTS = {
  ANKI_CONNECT: 'http://127.0.0.1:8765',
  OPENAI_API: 'https://api.openai.com/v1/chat/completions',
} as const;

export const ANKI_CONNECT_VERSION = 6;

// ===============================================================================
// APPLICATION CONFIGURATION
// ===============================================================================

export const DEFAULT_SETTINGS = {
  deckName: 'CS',
  modelName: 'Basic',
  tags: [] as string[],
} as const;

// ===============================================================================
// STORAGE & CACHING KEYS
// ===============================================================================

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
  AI_GENERATION_FAILED: 'Lỗi tạo ghi chú với AI. Vui lòng thử lại.',

  // Network & Data Processing Errors
  NETWORK: 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.',
  INVALID_RESPONSE: 'Phản hồi không hợp lệ từ server.',
  PARSING_ERROR: 'Lỗi phân tích dữ liệu.',

  // Generic Errors
  UNKNOWN: 'Đã xảy ra lỗi không xác định.',
} as const;
