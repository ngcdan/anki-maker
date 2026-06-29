# Anki Maker

Một web app frontend-only giúp tạo thẻ Anki nhanh chóng — soạn thủ công hoặc sinh tự động bằng OpenAI GPT — rồi đẩy thẳng vào Anki desktop qua [AnkiConnect](https://ankiweb.net/shared/info/2055492159).

### Demo

[![Demo Video](https://img.youtube.com/vi/qz1la5ZFIRM/0.jpg)](https://youtu.be/qz1la5ZFIRM)

## Tính năng

- ✍️ **Manual mode** (mặc định) — tự nhập nội dung từng field cho thẻ.
- ✨ **AI mode** — sinh thẻ tự động từ prompt bằng OpenAI GPT (`gpt-4o-mini`, JSON mode).
- 🃏 **Hỗ trợ nhiều loại note**: `Basic`, `Basic (and reversed card)`, `Cloze` (cú pháp `{{c1::...}}`).
- 🖼️ **Media**: paste (Ctrl+V) hoặc kéo-thả ảnh/video trực tiếp vào field — tự nhúng vào Anki qua `picture`/`video` của AnkiConnect.
- 📺 **Auto-embed**: paste link YouTube (kể cả Shorts) hoặc TikTok sẽ tự chuyển thành iframe responsive co giãn theo cửa sổ Anki.
- 🎯 **Tích hợp AnkiConnect**: tự lấy danh sách deck, đẩy thẻ vào deck đã chọn.
- 🔗 **Prefill bằng URL**: truyền `?prompt=...` để điền sẵn nội dung khi mở app.
- 🎨 **Giao diện Material-UI** gọn nhẹ, một màn hình duy nhất.

## Công nghệ

| Lớp | Thư viện |
|-----|----------|
| UI | React 18, Material-UI (MUI) 5 |
| Data fetching | TanStack Query v4 |
| Build / Dev | Vite 4, TypeScript 5 |
| Test | Vitest, Testing Library, MSW |
| Deploy | Cloudflare Pages (Wrangler) |

## Cài đặt & chạy

```bash
npm install     # cài dependencies
npm run dev     # chạy dev server (Vite)
npm run build   # build production (tsc + vite build)
npm run preview # xem thử bản build
npm test        # chạy test (vitest)
npm run lint    # kiểm tra ESLint
```

## Setup để dùng

1. Cài **Anki desktop** + plugin **AnkiConnect**.
2. Đảm bảo AnkiConnect lắng nghe ở `http://127.0.0.1:8765` và cho phép CORS từ origin của web app (cấu hình `webCorsOriginList` trong AnkiConnect).
3. (Chỉ cần cho AI mode) Nhập **OpenAI API key** trong app — key được lưu trong `localStorage`, gọi API trực tiếp từ trình duyệt.
4. Chọn deck + loại note, soạn thẻ thủ công hoặc bằng AI, rồi đẩy vào Anki.

## Deploy

Triển khai lên Cloudflare Pages:

```bash
npm run deploy   # wrangler pages deploy dist
```

## Cấu trúc thư mục

```
src/
├── components/     # GeneratorConfig, ManualEditor, MediaField, NotesList, NoteCard, ApiKeyManager
├── contexts/       # OpenAIKeyContext (lưu API key)
├── hooks/          # useAnki, useOpenAI, useLocalStorage
├── pages/          # Generator.tsx (màn hình chính)
├── services/       # ankiService (AnkiConnect), openaiService (GPT)
└── shared/         # types, constants, noteTypes
```

## Ghi chú

- App **không có backend** — mọi request (OpenAI, AnkiConnect) đều gọi trực tiếp từ trình duyệt.
- AnkiConnect từ chối note có field rỗng, nên app chèn zero-width space (`​`) làm placeholder cho field chỉ chứa media.
- Xem thêm [DEVLOG.md](DEVLOG.md) để biết lịch sử phát triển.
