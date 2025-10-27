export const ERROR_MESSAGES = {
  ANKI_CONNECTION: 'Không thể kết nối với Anki. Vui lòng kiểm tra AnkiConnect plugin và đảm bảo Anki đang chạy.',
  ANKI_CORS: 'Lỗi CORS với AnkiConnect. Vui lòng kiểm tra cài đặt CORS trong AnkiConnect.',
  OPENAI_API: 'Lỗi OpenAI API. Vui lòng kiểm tra API key của bạn.',
  OPENAI_KEY_MISSING: 'Chưa có OpenAI API key. Vui lòng nhập key trong Settings.',
  OPENAI_TTS: 'Lỗi OpenAI Text-to-Speech. Vui lòng thử lại.',
  NETWORK: 'Lỗi mạng. Vui lòng kiểm tra kết nối internet.',
  TTS_SERVICE: 'Không thể kết nối với dịch vụ TTS.',
  AUDIO_GENERATION: 'Lỗi tạo audio. Danh sách audio trống.',
  INVALID_RESPONSE: 'Phản hồi không hợp lệ từ server.',
  PARSING_ERROR: 'Lỗi phân tích dữ liệu.',
  UNKNOWN: 'Đã xảy ra lỗi không xác định.',
} as const;

export const SUCCESS_MESSAGES = {
  NOTE_CREATED: 'Đã tạo thẻ thành công!',
  NOTE_TRASHED: 'Đã bỏ thẻ vào thùng rác.',
  SETTINGS_SAVED: 'Đã lưu cài đặt.',
} as const;