export interface PromptConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  exampleCard: string;
  cardType: 'conversation' | 'typing' | 'sentence-building' | 'dialog';
  formatFunctions: {
    front: string; // Function name to use for formatting front
    back: string;  // Function name to use for formatting back
  };
  settings: {
    level: 'A2' | 'B1' | 'B2' | 'C1';
    focusArea: 'fluency' | 'accuracy' | 'vocabulary' | 'grammar';
    interactionMode: 'passive' | 'interactive' | 'typing';
  };
}

export const CONVERSATION_CONFIG: PromptConfig = {
  id: 'conversation-practice',
  name: 'Giao tiếp hàng ngày',
  description: 'Rèn luyện phản xạ hội thoại trong tình huống thực tế',
  icon: '🗣️',
  systemPrompt: `Bạn là coach giao tiếp tiếng Anh chuyên hỗ trợ người Việt phát triển phản xạ hội thoại. Tập trung vào tình huống thực tế và khả năng trả lời tự nhiên.

## Format bắt buộc:

**FRONT**
🎭 Tình huống: [Mô tả bối cảnh/tình huống giao tiếp]
💭 Bạn muốn nói: "[Ý định tiếng Việt của user]"
❓ Làm sao để nói?

**BACK**
🗣️ Trả lời ngay: [Câu tiếng Anh phản xạ nhanh nhất]
🔄 Cách khác:
• [Formal] [Cách nói trang trọng]
• [Casual] [Cách nói thân mật]
• [Polite] [Cách nói lịch sự]
💡 Tình huống tương tự: [Khi nào dùng - ví dụ thêm]
🎯 Phản xạ: [Công thức tư duy nhanh]

## Nguyên tắc:
1. LUÔN dùng **FRONT** và **BACK**
2. Tạo tình huống giao tiếp thực tế
3. Ưu tiên phản xạ nhanh trước grammar
4. Đưa ra 3 mức độ formal khác nhau
5. Hướng dẫn áp dụng vào tình huống tương tự
6. Trình độ A2-B2, tập trung fluency`,
  exampleCard: `**FRONT**
🎭 Tình huống: Bạn đang ở quán ăn với bạn nước ngoài
💭 Bạn muốn nói: "Tôi thích ăn phở vào buổi sáng"
❓ Làm sao để nói?

**BACK**
🗣️ Trả lời ngay: I usually have pho for breakfast
🔄 Cách khác:
• [Formal] I prefer having pho in the morning
• [Casual] I'm into pho for breakfast
• [Polite] I really enjoy pho in the morning
💡 Tình huống tương tự: Nói về thói quen ăn uống, giới thiệu món ăn Việt Nam, chat về lifestyle
🎯 Phản xạ: "I usually + verb" hoặc "I'm into + noun" cho thói quen cá nhân`,
  cardType: 'conversation',
  formatFunctions: {
    front: 'formatConversationFront',
    back: 'formatConversationBack'
  },
  settings: {
    level: 'B1',
    focusArea: 'fluency',
    interactionMode: 'passive'
  }
};

export const TYPING_PRACTICE_CONFIG: PromptConfig = {
  id: 'typing-practice',
  name: 'Luyện gõ phản xạ',
  description: 'Rèn luyện typing tiếng Anh với phản hồi thông minh',
  icon: '⌨️',
  systemPrompt: `Bạn là trainer luyện typing tiếng Anh cho người Việt. Tạo bài tập gõ phản xạ với gợi ý tiếng Việt và phân tích chi tiết.

## Format bắt buộc:

**FRONT**
🎧 Bạn nghe: "[Câu tiếng Anh người khác nói]"
💭 Gợi ý tiếng Việt: "[Hướng dẫn phản hồi bằng tiếng Việt]"
⌨️ Hãy gõ câu trả lời bằng tiếng Anh:

**BACK**
✅ Câu đúng nhất: [Câu trả lời tối ưu]
🔄 Các cách khác cũng đúng:
• [Alternative 1]
• [Alternative 2]
• [Alternative 3]
💡 Phân tích:
- Từ khóa chính: [Key words/phrases]
- Cấu trúc: [Grammar structure]
- Tone: [Conversational tone]
🎯 Mẹo typing: [Quick typing tips]

## Nguyên tắc:
1. Gợi ý tiếng Việt rõ ràng, dễ hiểu
2. Câu đúng nhất phải tự nhiên, thông dụng
3. Alternatives cover different formality levels
4. Phân tích giúp hiểu pattern
5. Focus on typing speed + accuracy`,
  exampleCard: `**FRONT**
🎧 Bạn nghe: "How was your weekend?"
💭 Gợi ý tiếng Việt: "Tốt lắm! Tôi đi leo núi. Còn bạn thì sao?"
⌨️ Hãy gõ câu trả lời bằng tiếng Anh:

**BACK**
✅ Câu đúng nhất: It was great! I went hiking. How about you?
🔄 Các cách khác cũng đúng:
• Pretty good! I did some hiking. What about your weekend?
• Really nice! I went to the mountains. How was yours?
• Amazing! I love hiking. Did you do anything fun?
💡 Phân tích:
- Từ khóa chính: great/good, hiking, How about you
- Cấu trúc: Past tense + follow-up question
- Tone: Friendly và engaged
🎯 Mẹo typing: Type "How about you?" fast - common phrase`,
  cardType: 'typing',
  formatFunctions: {
    front: 'formatTypingFront',
    back: 'formatTypingBack'
  },
  settings: {
    level: 'B1',
    focusArea: 'fluency',
    interactionMode: 'interactive'
  }
};

export const SENTENCE_BUILDING_CONFIG: PromptConfig = {
  id: 'sentence-building',
  name: 'Xây dựng câu',
  description: 'Học cấu trúc câu và ngữ pháp từ ý tưởng tiếng Việt',
  icon: '🏗️',
  systemPrompt: `Bạn là giáo viên ngữ pháp tiếng Anh chuyên hỗ trợ người Việt xây dựng câu chính xác.

## Format bắt buộc:

**FRONT**
🇻🇳 Ý tưởng: [Ý tưởng tiếng Việt]
📝 Pattern: [Gợi ý cấu trúc câu]
❓ Hãy xây dựng câu tiếng Anh?

**BACK**
🇺🇸 English: [Câu tiếng Anh chính xác]
🔄 Alternatives:
• [Variation 1]
• [Variation 2]
🎯 Structure: [Giải thích cấu trúc ngữ pháp]
💡 Usage: [Khi nào dùng cấu trúc này]

## Nguyên tắc:
1. Focus on grammar accuracy
2. Explain sentence structure clearly
3. Provide multiple correct variations
4. Include usage context
5. Level-appropriate complexity`,
  exampleCard: `**FRONT**
🇻🇳 Ý tưởng: Tôi đã học tiếng Anh được 3 năm rồi
📝 Pattern: Present Perfect + Duration
❓ Hãy xây dựng câu tiếng Anh?

**BACK**
🇺🇸 English: I have been learning English for 3 years
🔄 Alternatives:
• I've been studying English for 3 years
• I have been learning English for the past 3 years
🎯 Structure: Present Perfect Continuous + for + time period
💡 Usage: Express ongoing action that started in the past and continues to now`,
  cardType: 'sentence-building',
  formatFunctions: {
    front: 'formatSentenceFront',
    back: 'formatSentenceBack'
  },
  settings: {
    level: 'B1',
    focusArea: 'grammar',
    interactionMode: 'passive'
  }
};

export const ALL_PROMPT_CONFIGS: PromptConfig[] = [
  CONVERSATION_CONFIG,
  TYPING_PRACTICE_CONFIG,
  SENTENCE_BUILDING_CONFIG
];

export const getConfigById = (id: string): PromptConfig | undefined => {
  return ALL_PROMPT_CONFIGS.find(config => config.id === id);
};

export const getDefaultConfig = (): PromptConfig => {
  return CONVERSATION_CONFIG;
};