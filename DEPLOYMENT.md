# Anki Maker - Production Deployment Guide

## Về AnkiConnect

**Quan trọng:** AnkiConnect chỉ chạy trên máy local của người dùng tại `localhost:8765`.

Khi deploy production trên Vercel:
- ✅ OpenAI API calls: Đã được xử lý qua serverless functions `/api/openai` và `/api/openai-tts`
- ⚠️ AnkiConnect: Người dùng phải cài đặt và chạy Anki Desktop với AnkiConnect plugin trên máy của họ

### Hướng dẫn người dùng

Người dùng cần:

1. **Cài đặt Anki Desktop**: https://apps.ankiweb.net/
2. **Cài đặt AnkiConnect addon**:
   - Mở Anki Desktop
   - Tools → Add-ons → Get Add-ons
   - Nhập code: `2055492159`
   - Restart Anki
3. **Mở Anki Desktop** khi sử dụng web app
4. **Cấu hình CORS** (nếu cần):
   - Edit AnkiConnect config: Tools → Add-ons → AnkiConnect → Config
   - Thêm domain production vào `webCorsOriginList`:
   ```json
   {
     "webCorsOriginList": [
       "http://localhost:5173",
       "https://anki-maker.vercel.app"
     ]
   }
   ```

### Error Handling

App đã xử lý connection errors với AnkiConnect một cách graceful:
- Hiển thị thông báo rõ ràng khi không kết nối được
- Hướng dẫn người dùng cài đặt và chạy Anki Desktop
- Không crash khi AnkiConnect unavailable

## Deploy lên Vercel

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Deploy
vercel
```

### Environment Variables

Không cần set environment variables. API keys được người dùng nhập trực tiếp trong UI và không bao giờ lưu trên server.

## Architecture

```
Browser → Vercel Serverless Functions → OpenAI API
   ↓
Local AnkiConnect (localhost:8765) → Anki Desktop
```

- **Security**: API keys chỉ đi qua serverless functions, không expose trong browser
- **Privacy**: Không lưu trữ API keys trên server
- **Local-first**: Anki cards được tạo trực tiếp trên máy người dùng
