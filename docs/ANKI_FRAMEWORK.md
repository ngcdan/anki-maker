# 🎯 Anki Card Styling Framework - Minimal Theme

Framework đơn giản cho việc tạo và styling Anki cards với cấu trúc cố định Front/Back/Audio/Ans.

## 📋 Kiến trúc đơn giản

```
AI Response → HTML Content → Apply Minimal Styling → Anki Card
     ↓              ↓                    ↓              ↓
  Raw HTML    → CSS Framework →    Styled HTML   → AnkiConnect
```

## 🏗️ Cấu trúc framework

```
src/
├── types/
│   └── anki.ts                    # Simplified types (Front/Back/Audio/Ans)
├── services/
│   ├── ankiCardService.ts         # Main service with AnkiUtils namespace
│   ├── extraction/
│   │   └── extractorFactory.ts    # Extract sections from AI HTML
│   └── styling/
│       └── ankiStyler.ts          # Single minimal theme CSS framework
└── components/ui/
    └── AnkiPreview.tsx            # Simple tabbed preview component
```

## 🎨 Minimal Theme Framework

### Đặc điểm
- **Single Theme**: Chỉ có minimal theme duy nhất
- **Fixed Layout**: Cấu trúc Front/Back/Audio/Ans cố định
- **Base Classes**: CSS classes được định nghĩa sẵn
- **Extensible**: Có thể thêm custom CSS cho từng prompt

### Cách sử dụng
```typescript
import { applyAnkiStyling, generateAnkiCSS } from '@/services/styling/ankiStyler';

// Sử dụng framework cơ bản
const styledHTML = applyAnkiStyling(htmlContent, { theme: 'minimal' });

// Thêm custom CSS cho prompt cụ thể
const styledHTML = applyAnkiStyling(htmlContent, {
  theme: 'minimal',
  customCSS: `
    .anki-word { color: #007acc; }
    .anki-example { background: #f0f8ff; }
```

// Tạo CSS riêng
const css = generateAnkiCSS({ theme: 'minimal' });
```

## 🏗️ Base CSS Classes được định nghĩa sẵn

### Front Side Layout
```css
.anki-front         # Container cho mặt trước
.anki-word          # Từ vựng chính (36px, bold)
.anki-pronunciation # Phát âm (italic, 16px)
.anki-context      # Ngữ cảnh với border trái xanh
```

### Back Side Layout
```css
.anki-back          # Container cho mặt sau
.anki-section       # Section chung (meaning, examples, grammar)
.anki-section-title # Tiêu đề section (uppercase, 14px)
.anki-meaning       # Nghĩa (background xanh nhạt)
.anki-examples      # Ví dụ (background xanh lá nhạt)
.anki-grammar       # Ngữ pháp (background vàng nhạt)
.anki-example       # Item ví dụ riêng lẻ
```

### Special Elements
```css
.anki-audio         # Text cho TTS (monospace font)
.anki-answer        # Highlight đáp án (gradient vàng)
.anki-hidden        # Ẩn từ cho cloze deletion
```

## 🔧 Hệ thống Extraction

### AnkiExtractor Class
Trích xuất các sections từ AI HTML response:

```typescript
import { AnkiExtractor } from '@/services/extraction/extractorFactory';

const extractor = new AnkiExtractor();
const sections = extractor.extractSections(htmlContent);

// Kết quả:
// {
//   front: string,   # HTML cho Front field
//   back: string,    # HTML cho Back field
//   audio: string,   # Text cho Audio field
//   ans: string      # Text cho Ans field
// }
```

## 🖼️ Preview Component

### AnkiPreview
Component đơn giản với 4 tabs: Front/Back/Audio/Answer

```typescript
import { AnkiPreview } from '@/components/ui/AnkiPreview';

<AnkiPreview
  sections={extractedSections}
  styleConfig={{ theme: 'minimal' }}
  mode="light"
/>
```

## 🎯 Main Service Usage

### AnkiCardService - Main orchestrator
```typescript
import { AnkiCardService } from '@/services/ankiCardService';

// Process AI response thành Anki card
const result = await AnkiCardService.processAIResponse(
  {
    htmlContent: aiResponse,
    prompt: userInput,
    cardType: 'vocab'
  },
  {
    deckName: 'English Vocabulary',
    modelName: 'Basic',
    prompt: userInput,
    tags: ['vocab-enhanced'],
    cardType: 'vocab',
    styleConfig: defaultStyleConfigs.vocab // optional
  }
);

// Result bao gồm:
// - note: Anki note object (ready for AnkiConnect)
// - sections: Raw extracted sections
// - styledSections: CSS-styled HTML content
```

## 🔄 Migration từ code cũ

## 🔗 Main Service Integration

### AnkiCardService
Service chính orchestrating toàn bộ quy trình:

```typescript
import { AnkiCardService } from '@/services/ankiCardService';

// Sử dụng service chính
const result = AnkiCardService.processAIResponse(aiHTML, {
  theme: 'minimal',
  customCSS: '.anki-word { color: red; }'
});

// Kết quả có styling và extraction
const { front, back, audio, ans } = result;
```

### Backward Compatibility
Framework giữ tương thích với code cũ qua `AnkiUtils` namespace:

```typescript
import { AnkiUtils } from '@/services/ankiCardService';

// Code cũ vẫn hoạt động
const sections = AnkiUtils.extractSections(htmlContent, prompt);
const styledContent = AnkiUtils.hideTargetWord(content, word);
```

## 🎯 Cách thêm style cho prompt cụ thể

### 1. Trong prompt file (vocab_prompt.ts)
```typescript
// Thêm CSS cho vocabulary cards
const vocabCSS = `
  .anki-word {
    color: #007acc;
    font-size: 40px;
  }
  .anki-example {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    border-left: 4px solid #2196f3;
  }
`;

// Sử dụng khi tạo card
const styledHTML = applyAnkiStyling(htmlContent, {
  theme: 'minimal',
  customCSS: vocabCSS
});
```

### 2. Tạo theme variations
```typescript
// Tạo config cho từng loại prompt
const promptConfigs = {
  vocab: { theme: 'minimal', customCSS: vocabCSS },
  grammar: { theme: 'minimal', customCSS: grammarCSS },
  cloze: { theme: 'minimal', customCSS: clozeCSS }
};
```typescript
case 'custom':
  return new CustomExtractor(finalConfig);
```

### 4. Tạo Preview component
```typescript
export const CustomPreview: React.FC<PreviewProps> = ({ sections, styleConfig }) => {
  // Custom preview implementation
};
```

### 5. Update AnkiCardService
```typescript
case 'custom':
  const customFields: CustomAnkiFields = {
    Front: styledSections.front,
    Back: styledSections.back,
    CustomField: sections.additional.customField || '',
    // ...
  };
  return { ...baseNote, fields: customFields };
```

## 🎨 CSS Classes chuẩn

### Container classes
- `.anki-card`: Main container
- `.anki-section`: Content sections
- `.anki-word-header`: Word/title header

### Content classes
- `.anki-word`: Main vocabulary word
- `.anki-pos`: Part of speech
- `.anki-phonetic`: Phonetic transcriptions
- `.anki-dialogue`: Conversation content
- `.anki-analysis`: Analysis section
- `.anki-highlight`: Highlighted text

### Utility classes
## 📱 Mobile Responsive

Framework tự động responsive cho mobile:

```css
@media (max-width: 768px) {
  .anki-front { padding: 20px 16px; min-height: 140px; }
  .anki-word { font-size: 28px; }
  .anki-back { padding: 16px; }
  .anki-section { padding: 12px; margin-bottom: 12px; }
}
```

## 🛠️ Utility Functions

### hideTargetWord()
Ẩn từ cụ thể cho cloze deletion:

```typescript
import { hideTargetWord } from '@/services/styling/ankiStyler';

const hiddenContent = hideTargetWord(content, 'target_word');
// Kết quả: "This is a <span class="anki-hidden">______</span> sentence"
```

### generateAnkiCSS()
Tạo CSS riêng biệt:

```typescript
const css = generateAnkiCSS({
  theme: 'minimal',
  customCSS: '.custom-class { color: red; }'
});
// Sử dụng để inject vào <style> tag
```

## 🎯 Best Practices

### 1. Cấu trúc HTML từ AI
AI response nên follow cấu trúc:
```html
<div class="anki-front">
  <div class="anki-word">Word</div>
  <div class="anki-pronunciation">/pronunciation/</div>
  <div class="anki-context">Context sentence</div>
</div>

<div class="anki-back">
  <div class="anki-section anki-meaning">
    <div class="anki-section-title">Meaning</div>
    <div class="anki-meaning-text">Definition here</div>
  </div>
</div>
```

### 2. Consistency
- Luôn sử dụng `{ theme: 'minimal' }` làm config cơ bản
- Custom CSS chỉ để điều chỉnh chi tiết cho từng prompt
- Giữ cấu trúc Front/Back/Audio/Ans cố định

### 3. Performance
- CSS được generate một lần và cache
- Sử dụng `applyAnkiStyling()` thay vì tự tạo HTML
- Component preview sử dụng `dangerouslySetInnerHTML` cho performance

## 🚀 Migration từ code cũ

### Cập nhật imports
```typescript
// Cũ
import { extractSections, addAnkiStyling } from './old-files';

// Mới
import { applyAnkiStyling, AnkiCardService } from '@/services/ankiCardService';
```

### Sử dụng service mới
```typescript
// Thay thế logic cũ bằng service đơn giản
const result = AnkiCardService.processAIResponse(htmlContent, {
  theme: 'minimal'
});
```

---

**Framework này tập trung vào đơn giản, hiệu quả và dễ maintain. Minimal theme cung cấp foundation tốt để build các style chi tiết cho từng loại prompt.**
  responsiveBreakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024
  }
};
```

Hệ thống này cung cấp framework hoàn chỉnh và có thể mở rộng để tạo các loại Anki cards khác nhau từ AI responses, với styling professional và preview trực quan.