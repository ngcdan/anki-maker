# DEVLOG

## [2026-02-21] Fix CORS Error & Add OpenAI Tests
**Tác giả:** Antigravity

- **Fix:** Thêm kiểm tra API key trống trong `openaiService` để ngăn chặn lỗi CORS khó hiểu khi người dùng chưa cung cấp key.
- **Test:** Thêm test unit `src/__tests__/openaiService.test.ts` cho `OpenAIService` để dễ dàng kiểm thử (cover missing key, invalid key, JSON parsing validation).

## [2026-02-20] Dọn dẹp Codebase và Chuẩn bị Cloudflare Deployment
**Tác giả:** Antigravity

- **Refactor:** Xóa bỏ code comment liên quan tới Anki Connect ở `App.tsx` để làm sạch codebase.
- **Tối ưu Prompt & Phân tích (OpenAI Service):** Nâng cấp hàm `suggestAnkiNotes()` từ Regex Text sang **OpenAI JSON Schema (Structured Outputs)**. Cấu trúc lại toàn bộ `vocab_prompt.ts` thành format JSON, triệt tiêu nguy cơ parse sai chuỗi do AI phản hồi lỗi định dạng.
- **Cloudflare Migration:**
  - Thay thế hệ thống config Vercel bằng cách tạo `wrangler.toml` file cấu hình native Cloudflare Pages.
  - Thêm `_redirects` cấu hình rewrite về `index.html` (SPA fallback).
  - Bổ sung `wrangler` CLI vào `package.json` và thêm lệnh script `deploy: "wrangler pages deploy dist"`.
- **Kiểm thử:** Chạy thử npm run build (Vite), xác minh lỗi linter, build bundle `dist` thành công không có lỗi compile tsc.

## [2026-02-21] Reorganize Codebase Structure & Refactor Generator
**Tác giả:** Antigravity

- **Tái cấu trúc (Refactor):** Phân tách component khổng lồ `App.tsx` (được đổi tên thành `Generator.tsx`) thành nhiều thành phần chuyên biệt (đáp ứng nguyên tắc separation of concerns).
- **Tạo cấu trúc thư mục mới:** Di chuyển và nhóm các UI component vào `src/components/ui/`, chức năng hiển thị ghi chú vào `src/components/notes/`, và logic sinh thẻ Anki (GeneratorConfig, NotesList, StatsCard, StatusIndicator) vào `src/components/generator/`.
- **Cập nhật Router & Lazy Loading:** Sửa đổi `main.tsx` và `LazyLoader` để trỏ vào `Generator.tsx`, qua đó dọn dẹp import thừa và lỗi linter trong toàn bộ repo. Xóa bỏ import các file không tồn tại.
- **Kiểm tra trạng thái hệ thống:** Tất cả các component mới được tích hợp liền mạch. TypeScript compile (`tsc`) và build module (`Vite`) đều vượt qua không lỗi.

## [2026-02-21] Fix Tests and Linter (Codebase Cleanup)
**Tác giả:** Antigravity

- **Fix:** Giải quyết tận gốc lỗi `TypeError: fetch failed` của MSW trong Vitest bằng cách thêm `server.resetHandlers()` và đảm bảo handler đọc hết `req.json()` stream.
- **Fix:** Điều chỉnh endpoint MSW mock từ `localhost` sang `127.0.0.1` để đồng bộ với Node 18 fetch behavior và đảm bảo test chạy ổn định.
- **Refactor:** Khôi phục cấu hình ESLint chuẩn Vite (`.eslintrc.cjs`), sửa lỗi linter do di chuyển file (khắc phục `no-empty-function`, `no-useless-escape`, `no-non-null-assertion`, và gỡ parameter không dùng tới `_notes`).
- **Update:** Cập nhật lại logic gọi `openaiService.suggestAnkiNotes` ở các màn hình `Generator`/`hooks` để loại bỏ parameter dư thừa `existingNotes` giúp tsc compile thành công.
## [2026-02-21] Core App Simplification
**Tác giả:** Antigravity

- **Refactor:** Loại bỏ hoàn toàn các thành phần UI mở rộng không quan trọng (`LazyLoader`, `LoadingSkeleton`, `StatsCard`, `StatusIndicator`, `FeedbackSystem`) theo yêu cầu thu gọn ứng dụng.
- **Update:** Đơn giản hóa cấu hình Router tại `src/main.tsx` bằng cách chuyển về Import tĩnh (static import) thay vì chia nhỏ bundle bằng Suspense.
- **Update:** Đơn giản hóa UI phản hồi của `Generator.tsx` về mức nguyên thủy (Vanilla `alert`/`console.log`) để giữ cho core app hoạt động mà không cồng kềnh.

## [2026-02-22] Project Cleanup & Restructure
**Tác giả:** Antigravity

- **Cleanup:** Xóa 9 files/thư mục rác (`fix_imports.cjs`, `docs/useQuery_useMutation.md`, `NoteCardMemo.tsx`, `PromptInput.tsx`, thư mục `ui/`, `react.svg`, v.v.).
- **Fix:** Phục hồi file `vocab_prompt.ts` bị xóa nhầm từ commit trước; sửa lỗi broken imports khiến project không thể build trong `main.tsx`, `useTTS.ts`, `TagSelector.tsx`, `ApiKeyManager.tsx`.
- **Refactor:** Di dời thư mục `src/__tests__/` ra root `tests/` để tổ chức lại cấu trúc sạch hơn; dọn dẹp các hằng số không dùng trong `theme/index.ts`.
- **Verify:** `npm run build` và `vitest run` đều thành công không lỗi.

## [2026-02-22] Remove Theme Module
**Tác giả:** Antigravity

- **Refactor:** Gỡ bỏ hoàn toàn logic `theme` (light/dark mode) khỏi `src/main.tsx`, `Generator.tsx`, `NotesList.tsx`, `GeneratorConfig.tsx`, `NoteCard.tsx` và xóa bỏ toàn bộ thư mục `src/theme/`.
- **Cleanup:** Xóa bỏ các state và components dư thừa phục vụ cho việc đổi màu sắc (gradients, mode toggler).
- **Verify:** `npm run build` (tsc) và `vitest run` vượt qua thành công, đảm bảo không có broken import nào sót lại.

## [2026-02-22] Consolidate App to Single Screen
**Tác giả:** Antigravity

- **Cleanup:** Xóa bỏ hoàn toàn các trang vệ tinh dư thừa `src/pages/Home.tsx` và `src/pages/Settings.tsx` do đã tích hợp hết thiết lập vào sidebar màn hình chính.
- **Refactor:** Tinh giản bộ định tuyến `react-router-dom` trong `src/main.tsx`, gỡ tất cả menu điều hướng và thiết lập root path trỏ thẳng tới ứng dụng sinh thẻ `Generator`.
- **Refactor:** Gỡ bỏ link hướng dẫn chuyển hướng sang `/settings` bị dư thừa bên trong sidebar `ApiKeyManager`.
- **Verify:** `npm run build` xuất thành công không lỗi type checking. All 9 tests passed.

## [2026-02-22] Remove Routing (React Router DOM)
**Tác giả:** Antigravity

- **Cleanup:** Gỡ cài đặt hoàn toàn dependency `react-router-dom` theo yêu cầu làm ứng dụng chỉ có 1 trang tĩnh duy nhất (SPA không routing).
- **Refactor:** Chỉnh sửa `src/main.tsx` để render trực tiếp `<AppModern />` (trang Generator), xóa bỏ toàn bộ Setup Router, ErrorBoundary và Navigation bar cũ.
- **Refactor:** Cập nhật logic thu thập param Search (`?prompt=`) trong `Generator.tsx` sang sử dụng trực tiếp Web API `window.location.search` thay vì hook `useLocation`. Khắc phục triệt để các tàn dư của thẻ Setting cũ.
- **Verify:** Build Typescript `tsc` thành công không lỗi. `vitest run` ổn định. Ứng dụng giờ đạt độ tinh gọn tối đa.

## [2026-02-22] Compact UI Simplification
**Tác giả:** Antigravity

- **Cleanup:** Xóa bỏ hoàn toàn Component NavBar (`Navigation` component) trong App Shell `main.tsx`. Giảm bớt thẻ wrapper dư thừa.
- **Cleanup:** Xóa bỏ nguyên một Block Banner chiếm không gian chứa title `AI Card Generator` và nút bấm setting trên màn hình `Generator.tsx`.
- **Refactor:** Mở rộng Container ở `Generator.tsx` từ `maxWidth="xl"` sang Full-width (`maxWidth={false}`) và giảm Padding xuống mức tối thiểu (`p: 1`). Thanh Tiến trình Loading (Progress Bar) được đưa lên trên.
- **Verify:** Áp dụng thiết kế Minimalist thành công (cực kỳ gọn gàng cho việc chỉ thao tác tạo thẻ Anki). Build pass. Test pass 9/9.
