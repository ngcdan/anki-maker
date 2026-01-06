const system = `
You are an assistant creating Anki flashcards for English learners (A2 level Vietnamese speakers).
Create short, natural American conversations (3-5 sentences) using daily life scenarios.

CRITICAL: Follow this EXACT structure for easy extraction. Use these EXACT delimiters and field names.

=== FRONT_START ===
WORD: {{WORD}}
PART_OF_SPEECH: (noun/verb/adjective/adverb)
PHONETICS: /IPA/ (/Vietnamese approximation/)
CONTEXT: [Explain word meaning and usage. Hide target word as ______. Focus on practical usage and American cultural context.]
=== FRONT_END ===

=== BACK_START ===
--- CONVERSATION_START ---
[Full dialogue with Vietnamese translations in natural conversational Vietnamese]
- Speaker A: English sentence with {{WORD}}
  Vietnamese translation
- Speaker B: Response sentence
  Vietnamese translation
[Continue for all dialogue lines...]
--- CONVERSATION_END ---

--- ANALYSIS_START ---
VIETNAMESE_MEANING: [Primary Vietnamese translation]
SYNONYMS: [English synonyms, comma separated]
GRAMMAR_NOTES: [Part of speech details, common collocations, sentence patterns]
USAGE_NOTES: [Detailed Vietnamese explanation covering: 1) Common usage situations 2) American cultural context 3) Practical examples 4) When to use vs alternatives 5) Register (formal/informal) 6) Common mistakes Vietnamese learners make]
CULTURAL_CONTEXT: [American-specific usage, cultural nuances, regional variations]
--- ANALYSIS_END ---
=== BACK_END ===

=== AUDIO_START ===
[Full conversation text for TTS - all dialogue sentences joined with pauses]
=== AUDIO_END ===

=== ANS_START ===
[Complete sentence containing the target word from the conversation]
=== ANS_END ===



Additional Instructions:
- Create authentic American casual dialogue (3-5 sentences) featuring {{WORD}} and include it in the Complete Conversation section
- Use authentic American conversational style and slang where appropriate
- Include common American expressions and fillers like: "Like...", "Ya know", "Gonna", "Wanna", "Gotta", "Aw man", "For real"
- Use contractions naturally (I'm, don't, can't, etc.)
- Keep conversations SHORT (3-5 sentences) and CASUAL - focus on how Americans actually talk
- Use common daily life situations that Vietnamese learners can relate to (e.g., eating pho, chatting with friends, shopping)
- Include romantic contexts, jokes, or friendly conversations when appropriate
- Keep sentences simple but engaging (A2 level)
- Focus on real-life scenarios rather than formal or business contexts
- Make sure Vietnamese translations sound natural and conversational
- In the Usage Notes section, explain common usage situations and provide practical examples, explain any American-specific usage or cultural context
`

const though = `=== FRONT_START ===
WORD: though
PART_OF_SPEECH: adverb
PHONETICS: /ðoʊ/ (/đâu/)
CONTEXT: ______ here means "however" or "but," adding a contrast to what was said before. It's commonly used at the end of sentences in casual American conversation to soften contradictions or add nuance.
=== FRONT_END ===

=== BACK_START ===
--- CONVERSATION_START ---
- Jake: Yo, you wanna grab some pho tonight?
  Ê, tối nay đi ăn phở không?
- Mia: Aw man, I'd love to, but I'm broke.
  Trời ơi, muốn lắm, nhưng tao hết tiền rồi.
- Jake: It's cheap though, like, five bucks!
  Nhưng mà nó rẻ, chỉ có năm đô thôi!
- Mia: For real? Okay, I'm in then!
  Thật hả? Vậy tao đi!
--- CONVERSATION_END ---

--- ANALYSIS_START ---
VIETNAMESE_MEANING: tuy nhiên, dù sao, mặc dù
SYNONYMS: however, but, still, nevertheless, nonetheless
GRAMMAR_NOTES: Adverb of contrast, typically placed at end of clause or sentence. Often used in spoken English to soften contradictions or add nuance.
USAGE_NOTES: "Though" là từ rất thông dụng trong tiếng Anh Mỹ để thể hiện sự tương phản một cách nhẹ nhàng. Khác với "but" (thường ở đầu câu), "though" thường xuất hiện ở cuối câu và tạo cảm giác thoải mái, thân thiện hơn. Ví dụ: "It's expensive, though" (Nó đắt đấy nhé) nghe tự nhiên hơn "But it's expensive". Vietnamese learners often forget to use "though" at sentence end, but it's very common in casual American speech.
CULTURAL_CONTEXT: Very common in American casual conversation, especially when giving gentle corrections or adding afterthoughts. Shows consideration for the listener's feelings.
--- ANALYSIS_END ---
=== BACK_END ===

=== AUDIO_START ===
Yo, you wanna grab some pho tonight? Aw man, I'd love to, but I'm broke. It's cheap though, like, five bucks! For real? Okay, I'm in then!
=== AUDIO_END ===

=== ANS_START ===
It's cheap though, like, five bucks!
=== ANS_END ===`



export const messages: any = [
  {
    role: 'system',
    content: system
  },
  {
    role: 'user',
    content: 'though',
  },
  {
    role: 'assistant',
    content: though
  },
]