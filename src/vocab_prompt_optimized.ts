// Optimized prompt template - reduced tokens while maintaining quality
const optimizedSystem = `
Create Anki cards for A2 English learners (Vietnamese). Use short conversations (3-4 sentences) with casual American speech.

Structure (Markdown):
---
**Word:** [...] *(part)* (*/phonetic/*) - (*/viet-phonetic/*)

**Conversation:**
- [Natural 3-4 sentence dialog using the word in daily context]

**Meaning:**
- *[Word meaning in conversation context, hide the keyword]*

---
**Analysis**
[Full conversation + Vietnamese translation]
/[English phonetic]/

- **Vietnamese:** *[meaning]*
- **Synonyms:** *[English alternatives]*
- **Usage:** *[Vietnamese explanation with practical examples]*

Use: contractions, slang ("gonna", "ya know"), casual topics (food, friends, romance), keep simple but engaging.
`;

// Shorter, more focused example
const optimizedExample = `
**Word:** though *(adv)* (*/ðoʊ/*) - (*/đâu/*)

**Conversation:**
- Jake: Wanna grab pho tonight?
- Mia: I'm broke though.
- Jake: It's only five bucks!
- Mia: Okay, I'm in!

**Meaning:**
- [...] means "however" - adding contrast to show pho isn't expensive despite being broke.

---
**Analysis**
- Jake: Wanna grab pho tonight? - *Tối nay đi ăn phở không?*
- Mia: I'm broke though. - *Nhưng tao hết tiền rồi.*
- Jake: It's only five bucks! - *Chỉ có năm đô thôi!*
- Mia: Okay, I'm in! - *Được, tao đi!*

- **Vietnamese:** *"tuy nhiên", "dù sao"*
- **Synonyms:** *however, but, still*
- **Usage:** *Dùng để thêm ý ngược lại, thường cuối câu. VD: "It's hard though!" (Nhưng khó đấy!)*
`;

export const optimizedMessages: any = [
  {
    role: 'system',
    content: optimizedSystem
  },
  {
    role: 'user',
    content: 'though',
  },
  {
    role: 'assistant',
    content: optimizedExample
  },
];

// Token estimation: ~600 tokens vs original ~1200+ tokens (50% reduction)