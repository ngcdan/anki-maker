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
/* Reset và Base styles cho Anki */
.vocab-card { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
  line-height: 1.6; 
  max-width: 100%; 
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.vocab-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 99, 132, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* Word Header - Modern gradient */
.word-header { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); 
  color: white; 
  padding: 24px; 
  border-radius: 16px; 
  margin-bottom: 24px; 
  text-align: center;
  box-shadow: 
    0 12px 40px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.word-header::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(255,255,255,0.05) 70%, transparent 100%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.word { 
  font-size: 36px; 
  font-weight: 800; 
  display: block; 
  margin-bottom: 8px; 
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

.pos { 
  font-size: 15px; 
  opacity: 0.9; 
  font-style: italic; 
  font-weight: 400;
  position: relative;
  z-index: 2;
}

.phonetics { 
  margin-top: 16px; 
  position: relative;
  z-index: 2;
}

.en-phonetic, .vn-phonetic { 
  background: rgba(255,255,255,0.25); 
  padding: 10px 16px; 
  border-radius: 25px; 
  margin: 0 8px; 
  font-size: 14px; 
  font-weight: 500;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: inline-block;
}

/* Cards với modern design */
.conversation, .meaning { 
  background: rgba(255, 255, 255, 0.9); 
  backdrop-filter: blur(20px);
  padding: 24px; 
  margin-bottom: 20px; 
  border-radius: 16px; 
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.conversation:hover, .meaning:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
}

.conversation h4, .meaning h4 { 
  color: #1e293b; 
  font-size: 18px; 
  margin-bottom: 16px; 
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Dialogue với glassmorphism */
.dialogue { 
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%); 
  padding: 20px; 
  border-radius: 12px; 
  border: 1px solid rgba(102, 126, 234, 0.2);
  position: relative;
  backdrop-filter: blur(10px);
}

.dialogue::before {
  content: '💬';
  position: absolute;
  top: -12px;
  left: 20px;
  background: white;
  padding: 8px 12px;
  border-radius: 50%;
  font-size: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 2px solid #f0f9ff;
}

.dialogue p { 
  margin: 12px 0; 
  line-height: 1.7; 
  font-size: 16px;
  color: #334155;
}

.dialogue strong { 
  color: #7c3aed; 
  font-weight: 700;
  background: linear-gradient(120deg, #7c3aed, #c084fc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.context-meaning { 
  font-style: italic; 
  color: #475569; 
  line-height: 1.8;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 18px;
  border-radius: 12px;
  border-left: 4px solid #10b981;
  position: relative;
}

.context-meaning::before {
  content: '💡';
  position: absolute;
  top: -10px;
  left: 18px;
  background: white;
  padding: 6px 10px;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* Back Section */
.back-section { 
  margin-top: 32px; 
}

.analysis { 
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(20px);
  padding: 28px; 
  border-radius: 16px; 
  box-shadow: 0 12px 48px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  position: relative;
  z-index: 1;
}

.analysis h3 { 
  color: #7c3aed; 
  border-bottom: 4px solid transparent;
  border-image: linear-gradient(90deg, #7c3aed, #c084fc) 1;
  padding-bottom: 12px; 
  margin-bottom: 28px;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Full Conversation với modern styling */
.full-conversation { 
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
  padding: 24px; 
  border-radius: 12px; 
  margin: 24px 0; 
  border: 1px solid #7dd3fc;
  position: relative;
  box-shadow: 0 4px 24px rgba(14, 165, 233, 0.1);
}

.full-conversation::before {
  content: '🗣️';
  position: absolute;
  top: -12px;
  left: 24px;
  background: white;
  padding: 8px 12px;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 2px solid #f0f9ff;
}

.full-conversation h4 { 
  margin-bottom: 20px; 
  color: #0f172a; 
  font-weight: 700;
  font-size: 16px;
}

.full-conversation p { 
  margin: 14px 0; 
  line-height: 1.8;
  padding: 12px 0 12px 20px;
  border-left: 3px solid #0ea5e9;
  position: relative;
}

.full-conversation p::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #0ea5e9;
  border-radius: 50%;
}

.full-conversation em { 
  color: #0369a1; 
  font-weight: 600;
  font-style: normal;
}

.phonetic-full { 
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace; 
  color: #64748b; 
  margin-top: 20px; 
  font-size: 13px; 
  background: rgba(15, 23, 42, 0.05); 
  padding: 16px; 
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  line-height: 1.6;
}

/* Word Details Cards */
.word-details > div { 
  margin: 20px 0; 
  padding: 20px; 
  background: rgba(255, 255, 255, 0.7); 
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.word-details > div:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.highlight { 
  background: linear-gradient(120deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); 
  color: white;
  padding: 6px 14px; 
  border-radius: 8px; 
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  display: inline-block;
}

.syn-list { 
  color: #0ea5e9; 
  font-weight: 600;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #7dd3fc;
}

.usage-text { 
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); 
  padding: 20px; 
  border-radius: 12px; 
  border-left: 4px solid #10b981; 
  line-height: 1.8; 
  margin-top: 12px;
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.1);
  position: relative;
}

.usage-text::before {
  content: '📝';
  position: absolute;
  top: -8px;
  left: 16px;
  background: white;
  padding: 4px 8px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .word { font-size: 28px; }
  .vocab-card { padding: 16px; }
  .word-header { padding: 20px; }
  .conversation, .meaning, .analysis { padding: 20px; }
}

@media (max-width: 480px) {
  .word { font-size: 24px; }
  .vocab-card { padding: 12px; }
  .word-header { padding: 16px; }
  .conversation, .meaning, .analysis { padding: 16px; }
  .en-phonetic, .vn-phonetic { 
    display: block; 
    margin: 4px 0; 
    text-align: center;
  }
}
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
/* Reset và Base styles cho Anki */
.vocab-card { 
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; 
  line-height: 1.6; 
  max-width: 100%; 
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.12);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.vocab-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 99, 132, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* Word Header - Modern gradient */
.word-header { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); 
  color: white; 
  padding: 24px; 
  border-radius: 16px; 
  margin-bottom: 24px; 
  text-align: center;
  box-shadow: 
    0 12px 40px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.word-header::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(255,255,255,0.05) 70%, transparent 100%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.word { 
  font-size: 36px; 
  font-weight: 800; 
  display: block; 
  margin-bottom: 8px; 
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
}

.pos { 
  font-size: 15px; 
  opacity: 0.9; 
  font-style: italic; 
  font-weight: 400;
  position: relative;
  z-index: 2;
}

.phonetics { 
  margin-top: 16px; 
  position: relative;
  z-index: 2;
}

.en-phonetic, .vn-phonetic { 
  background: rgba(255,255,255,0.25); 
  padding: 10px 16px; 
  border-radius: 25px; 
  margin: 0 8px; 
  font-size: 14px; 
  font-weight: 500;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: inline-block;
}

/* Cards với modern design */
.conversation, .meaning { 
  background: rgba(255, 255, 255, 0.9); 
  backdrop-filter: blur(20px);
  padding: 24px; 
  margin-bottom: 20px; 
  border-radius: 16px; 
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.conversation:hover, .meaning:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
}

.conversation h4, .meaning h4 { 
  color: #1e293b; 
  font-size: 18px; 
  margin-bottom: 16px; 
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Dialogue với glassmorphism */
.dialogue { 
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%); 
  padding: 20px; 
  border-radius: 12px; 
  border: 1px solid rgba(102, 126, 234, 0.2);
  position: relative;
  backdrop-filter: blur(10px);
}

.dialogue::before {
  content: '💬';
  position: absolute;
  top: -12px;
  left: 20px;
  background: white;
  padding: 8px 12px;
  border-radius: 50%;
  font-size: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 2px solid #f0f9ff;
}

.dialogue p { 
  margin: 12px 0; 
  line-height: 1.7; 
  font-size: 16px;
  color: #334155;
}

.dialogue strong { 
  color: #7c3aed; 
  font-weight: 700;
  background: linear-gradient(120deg, #7c3aed, #c084fc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.context-meaning { 
  font-style: italic; 
  color: #475569; 
  line-height: 1.8;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 18px;
  border-radius: 12px;
  border-left: 4px solid #10b981;
  position: relative;
}

.context-meaning::before {
  content: '💡';
  position: absolute;
  top: -10px;
  left: 18px;
  background: white;
  padding: 6px 10px;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

/* Back Section */
.back-section { 
  margin-top: 32px; 
}

.analysis { 
  background: rgba(255, 255, 255, 0.95); 
  backdrop-filter: blur(20px);
  padding: 28px; 
  border-radius: 16px; 
  box-shadow: 0 12px 48px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  position: relative;
  z-index: 1;
}

.analysis h3 { 
  color: #7c3aed; 
  border-bottom: 4px solid transparent;
  border-image: linear-gradient(90deg, #7c3aed, #c084fc) 1;
  padding-bottom: 12px; 
  margin-bottom: 28px;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Full Conversation với modern styling */
.full-conversation { 
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
  padding: 24px; 
  border-radius: 12px; 
  margin: 24px 0; 
  border: 1px solid #7dd3fc;
  position: relative;
  box-shadow: 0 4px 24px rgba(14, 165, 233, 0.1);
}

.full-conversation::before {
  content: '🗣️';
  position: absolute;
  top: -12px;
  left: 24px;
  background: white;
  padding: 8px 12px;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 2px solid #f0f9ff;
}

.full-conversation h4 { 
  margin-bottom: 20px; 
  color: #0f172a; 
  font-weight: 700;
  font-size: 16px;
}

.full-conversation p { 
  margin: 14px 0; 
  line-height: 1.8;
  padding: 12px 0 12px 20px;
  border-left: 3px solid #0ea5e9;
  position: relative;
}

.full-conversation p::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #0ea5e9;
  border-radius: 50%;
}

.full-conversation em { 
  color: #0369a1; 
  font-weight: 600;
  font-style: normal;
}

.phonetic-full { 
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace; 
  color: #64748b; 
  margin-top: 20px; 
  font-size: 13px; 
  background: rgba(15, 23, 42, 0.05); 
  padding: 16px; 
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  line-height: 1.6;
}

/* Word Details Cards */
.word-details > div { 
  margin: 20px 0; 
  padding: 20px; 
  background: rgba(255, 255, 255, 0.7); 
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.word-details > div:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.highlight { 
  background: linear-gradient(120deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); 
  color: white;
  padding: 6px 14px; 
  border-radius: 8px; 
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  display: inline-block;
}

.syn-list { 
  color: #0ea5e9; 
  font-weight: 600;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #7dd3fc;
}

.usage-text { 
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); 
  padding: 20px; 
  border-radius: 12px; 
  border-left: 4px solid #10b981; 
  line-height: 1.8; 
  margin-top: 12px;
  box-shadow: 0 2px 12px rgba(16, 185, 129, 0.1);
  position: relative;
}

.usage-text::before {
  content: '📝';
  position: absolute;
  top: -8px;
  left: 16px;
  background: white;
  padding: 4px 8px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .word { font-size: 28px; }
  .vocab-card { padding: 16px; }
  .word-header { padding: 20px; }
  .conversation, .meaning, .analysis { padding: 20px; }
}

@media (max-width: 480px) {
  .word { font-size: 24px; }
  .vocab-card { padding: 12px; }
  .word-header { padding: 16px; }
  .conversation, .meaning, .analysis { padding: 16px; }
  .en-phonetic, .vn-phonetic { 
    display: block; 
    margin: 4px 0; 
    text-align: center;
  }
}
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