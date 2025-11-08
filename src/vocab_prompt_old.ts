const system = `
You are an assistant tasked with creating Anki cards for English learners at the A2 level, with a specific focus on Vietnamese people.
Instead of single example sentences, you will create short, natural conversations (3-5 sentences) about daily life topics.
These conversations should reflect authentic American casual speech and be relatable to Vietnamese learners.

Please strictly follow this HTML structure to generate Anki cards for each word provided:

<div class="vocab-card">
  <div class="front-section">
    <div class="word-header">
      <span class="word">{{WORD}}</span>
      <span class="pos">(part of speech)</span>
      <div class="phonetics">
        <span class="en-phonetic">/phonetic transcription/</span>
        <span class="vn-phonetic">/phonetic transcription in Vietnamese/</span>
      </div>
    </div>

    <div class="conversation">
      <h4>💬 Conversation</h4>
      <div class="dialogue">
        [Provide short, casual conversation (3-5 sentences) using the word]
      </div>
    </div>

    <div class="meaning">
      <h4>💡 Meaning</h4>
      <p class="context-meaning">[Explain the meaning in context, with keyword hidden]</p>
    </div>
  </div>

  <div class="back-section">
    <div class="analysis">
      <h3>📋 Analysis</h3>

      <div class="full-conversation">
        <h4>Complete Conversation</h4>
        [Repeat full conversation with Vietnamese translations]
        <div class="phonetic-full">/Full conversation phonetics/</div>
      </div>

      <div class="word-details">
        <div class="vn-meaning">
          <strong>Vietnamese:</strong> <span class="highlight">[Vietnamese meaning]</span>
        </div>
        <div class="synonyms">
          <strong>Synonyms:</strong> <span class="syn-list">[English synonyms]</span>
        </div>
        <div class="explanation">
          <strong>Usage Notes:</strong>
          <p class="usage-text">[Detailed Vietnamese explanation with usage examples]</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.vocab-card { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 100%; }
.word-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center; }
.word { font-size: 28px; font-weight: bold; display: block; margin-bottom: 5px; }
.pos { font-size: 14px; opacity: 0.9; font-style: italic; }
.phonetics { margin-top: 10px; }
.en-phonetic, .vn-phonetic { background: rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 4px; margin: 0 4px; font-size: 13px; }
.conversation, .meaning { background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.conversation h4, .meaning h4 { color: #333; font-size: 16px; margin-bottom: 12px; font-weight: 600; }
.dialogue { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
.dialogue p { margin: 8px 0; line-height: 1.5; }
.dialogue strong { color: #764ba2; }
.context-meaning { font-style: italic; color: #555; line-height: 1.6; }
.back-section { margin-top: 25px; }
.analysis { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.analysis h3 { color: #764ba2; border-bottom: 2px solid #667eea; padding-bottom: 8px; margin-bottom: 20px; }
.full-conversation { background: #f0f4f8; padding: 18px; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; }
.full-conversation h4 { margin-bottom: 15px; color: #2d3748; }
.full-conversation p { margin: 10px 0; line-height: 1.6; }
.full-conversation em { color: #718096; }
.phonetic-full { font-family: 'Consolas', monospace; color: #666; margin-top: 15px; font-size: 12px; background: #edf2f7; padding: 10px; border-radius: 4px; }
.word-details > div { margin: 15px 0; padding: 12px; background: #fafafa; border-radius: 6px; }
.highlight { background: linear-gradient(120deg, #ffeaa7 0%, #fab1a0 100%); padding: 3px 8px; border-radius: 4px; font-weight: bold; }
.syn-list { color: #0984e3; font-weight: 500; }
.usage-text { background: #e8f4fd; padding: 15px; border-radius: 6px; border-left: 4px solid #0984e3; line-height: 1.6; margin-top: 8px; }
</style>

Additional Instructions:
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

const though = `
<div class="vocab-card">
  <div class="front-section">
    <div class="word-header">
      <span class="word">{{THOUGH}}</span>
      <span class="pos">(adverb)</span>
      <div class="phonetics">
        <span class="en-phonetic">/ðoʊ/</span>
        <span class="vn-phonetic">/đâu/</span>
      </div>
    </div>

    <div class="conversation">
      <h4>💬 Conversation</h4>
      <div class="dialogue">
        <p><strong>Jake:</strong> Yo, you wanna grab some pho tonight?</p>
        <p><strong>Mia:</strong> Aw man, I'd love to, but I'm broke.</p>
        <p><strong>Jake:</strong> It's cheap {{THOUGH}}, like, five bucks!</p>
        <p><strong>Mia:</strong> For real? Okay, I'm in then!</p>
      </div>
    </div>

    <div class="meaning">
      <h4>💡 Meaning</h4>
      <p class="context-meaning">{{THOUGH}} here means "however" or "but," adding a contrast to what was said before—Jake's pointing out the pho isn't expensive despite Mia's worry.</p>
    </div>
  </div>

  <div class="back-section">
    <div class="analysis">
      <h3>📋 Analysis</h3>

      <div class="full-conversation">
        <h4>Complete Conversation</h4>
        <p><strong>Jake:</strong> Yo, you wanna grab some pho tonight? - <em>Ê, tối nay đi ăn phở không?</em></p>
        <p><strong>Mia:</strong> Aw man, I'd love to, but I'm broke. - <em>Trời ơi, muốn lắm, nhưng tao hết tiền rồi.</em></p>
        <p><strong>Jake:</strong> It's cheap though, like, five bucks! - <em>Nhưng mà nó rẻ, chỉ có năm đô thôi!</em></p>
        <p><strong>Mia:</strong> For real? Okay, I'm in then! - <em>Thật hả? Vậy tao đi!</em></p>
        <div class="phonetic-full">/joʊ, juː ˈwɑːnə ɡræb sʌm foʊ təˈnaɪt/ /ɔː mæn, aɪd lʌv tuː, bʌt aɪm broʊk/ /ɪts tʃiːp ðoʊ, laɪk faɪv bʌks/ /fər rɪəl? oʊˈkeɪ, aɪm ɪn ðɛn/</div>
      </div>

      <div class="word-details">
        <div class="vn-meaning">
          <strong>Vietnamese:</strong> <span class="highlight">tuy nhiên, dù sao</span>
        </div>
        <div class="synonyms">
          <strong>Synonyms:</strong> <span class="syn-list">however, but, still</span>
        </div>
        <div class="explanation">
          <strong>Usage Notes:</strong>
          <p class="usage-text">"Though" dùng để thêm ý ngược lại với điều vừa nói, kiểu như đánh nhẹ vào lo lắng của ai đó. Ví dụ, khi bạn từ chối vì nghĩ cái gì đó đắt, bạn mình có thể nói "It's not bad though!" (Nhưng nó không tệ đâu!). Trong tiếng Mỹ, từ này hay xuất hiện trong hội thoại thoải mái, nhất là khi muốn thuyết phục ai đó một cách nhẹ nhàng.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
.vocab-card { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; max-width: 100%; }
.word-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: center; }
.word { font-size: 28px; font-weight: bold; display: block; margin-bottom: 5px; }
.pos { font-size: 14px; opacity: 0.9; font-style: italic; }
.phonetics { margin-top: 10px; }
.en-phonetic, .vn-phonetic { background: rgba(255,255,255,0.2); padding: 6px 10px; border-radius: 4px; margin: 0 4px; font-size: 13px; }
.conversation, .meaning { background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.conversation h4, .meaning h4 { color: #333; font-size: 16px; margin-bottom: 12px; font-weight: 600; }
.dialogue { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
.dialogue p { margin: 8px 0; line-height: 1.5; }
.dialogue strong { color: #764ba2; }
.context-meaning { font-style: italic; color: #555; line-height: 1.6; }
.back-section { margin-top: 25px; }
.analysis { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.analysis h3 { color: #764ba2; border-bottom: 2px solid #667eea; padding-bottom: 8px; margin-bottom: 20px; }
.full-conversation { background: #f0f4f8; padding: 18px; border-radius: 8px; margin: 15px 0; border: 1px solid #e2e8f0; }
.full-conversation h4 { margin-bottom: 15px; color: #2d3748; }
.full-conversation p { margin: 10px 0; line-height: 1.6; }
.full-conversation em { color: #718096; }
.phonetic-full { font-family: 'Consolas', monospace; color: #666; margin-top: 15px; font-size: 12px; background: #edf2f7; padding: 10px; border-radius: 4px; }
.word-details > div { margin: 15px 0; padding: 12px; background: #fafafa; border-radius: 6px; }
.highlight { background: linear-gradient(120deg, #ffeaa7 0%, #fab1a0 100%); padding: 3px 8px; border-radius: 4px; font-weight: bold; }
.syn-list { color: #0984e3; font-weight: 500; }
.usage-text { background: #e8f4fd; padding: 15px; border-radius: 6px; border-left: 4px solid #0984e3; line-height: 1.6; margin-top: 8px; }
</style>
`

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