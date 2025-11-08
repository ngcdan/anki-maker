import { messages } from './vocab_prompt';

export interface Note {
  modelName: string;
  deckName: string;
  fields: { Front: string, Back: string, Question: string, Ans: string, Audio?: string };
  tags: string[];
  key: string;
  trashed?: boolean;
  created?: boolean;
}

interface Options {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
}

/**
 * Format the front side for conversation-focused cards
 */
function formatSentenceFront(content: string): string {
  // Extract situation, intention and question
  const situationMatch = content.match(/�\s*Tình huống:\s*([^\n]+)/);
  const intentionMatch = content.match(/�\s*Bạn muốn nói:\s*["""]([^"""]+)["""]/);
  const questionMatch = content.match(/❓\s*([^\n]+)/);

  const situation = situationMatch ? situationMatch[1].trim() : '';
  const intention = intentionMatch ? intentionMatch[1].trim() : content;
  const question = questionMatch ? questionMatch[1].trim() : 'Làm sao để nói?';

  return `
<div class="conversation-front">
  <div class="situation-context">
    🎭 ${situation}
  </div>
  <div class="vietnamese-intention">
    💭 Bạn muốn nói: "${intention}"
  </div>
  <div class="question-prompt">
    ❓ ${question}
  </div>
</div>
  `.trim();
}

/**
 * Format the back side for conversation-focused cards
 */
function formatSentenceBack(content: string): string {
  // Extract conversation components
  const quickReplyMatch = content.match(/🗣️\s*Trả lời ngay:\s*([^\n]+)/);
  const alternativesMatch = content.match(/🔄\s*Cách khác:\s*([\s\S]*?)(?=💡|🎯|$)/i);
  const situationsMatch = content.match(/💡\s*Tình huống tương tự:\s*([^\n]+)/);
  const reflexMatch = content.match(/🎯\s*Phản xạ:\s*([\s\S]*?)$/i);

  const quickReply = quickReplyMatch ? quickReplyMatch[1].trim() : content.split('\n')[0];

  let formattedContent = `
<div class="conversation-back">
  <div class="quick-response">
    🗣️ <strong>Trả lời ngay:</strong> ${quickReply}
  </div>`;

  // Add style alternatives if available
  if (alternativesMatch) {
    const alternatives = alternativesMatch[1]
      .split('\n')
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(line => line && line.length > 5)
      .map(alt => `<li>${alt}</li>`)
      .join('');

    if (alternatives) {
      formattedContent += `
  <div class="style-alternatives">
    🔄 <strong>Cách khác:</strong>
    <ul>${alternatives}</ul>
  </div>`;
    }
  }

  // Add similar situations if available
  if (situationsMatch) {
    const situations = situationsMatch[1].trim();
    formattedContent += `
  <div class="similar-situations">
    💡 <strong>Tình huống tương tự:</strong> ${situations}
  </div>`;
  }

  // Add reflex pattern if available
  if (reflexMatch) {
    const reflex = reflexMatch[1].trim();
    formattedContent += `
  <div class="reflex-pattern">
    🎯 <strong>Phản xạ:</strong> ${reflex}
  </div>`;
  }

  formattedContent += '\n</div>';
  return formattedContent.trim();
}

export function addAnkiStyling(content: string): string {
  const ankiCSS = `
<style>
/* === CONVERSATION FOCUSED STYLES === */
.conversation-front {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.situation-context {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.intention-context {
  font-size: 1.05em;
  margin-bottom: 12px;
  padding-left: 20px;
}

.conversation-question {
  background: rgba(255,255,255,0.2);
  padding: 12px;
  border-radius: 8px;
  font-size: 1.05em;
  margin-top: 12px;
  font-weight: 500;
}

.conversation-back {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.quick-response {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 500;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.style-alternatives {
  background: #e3f2fd;
  border-left: 4px solid #2196F3;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
}

.style-alternatives ul {
  margin: 8px 0;
  padding-left: 20px;
}

.style-alternatives li {
  margin: 8px 0;
  color: #333;
  font-weight: 500;
}

.similar-situations {
  background: #fff8e1;
  border-left: 4px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  color: #333;
}

.reflex-pattern {
  background: #f3e5f5;
  border-left: 4px solid #9c27b0;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  color: #333;
}

/* === CONVERSATION ICONS === */
.situation-icon::before {
  content: "� ";
}

.intention-icon::before {
  content: "💭 ";
}

.question-icon::before {
  content: "❓ ";
}

.response-icon::before {
  content: "�️ ";
}

.alternatives-icon::before {
  content: "🔄 ";
}

.situations-icon::before {
  content: "💡 ";
}

.reflex-icon::before {
  content: "🎯 ";
}

/* === LEGACY DIALOG STYLES === */
.anki-scenario {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 15px;
}

.anki-scenario h2 {
  margin-top: 0;
  font-size: 1.4em;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.anki-dialog {
  background: #f8f9fa;
  border-left: 4px solid #007bff;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 5px;
}

.dialog-exchange {
  background: white;
  padding: 10px;
  margin: 8px 0;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.dialog-exchange p {
  margin: 5px 0;
}

.anki-options {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.anki-thinking {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.anki-confidence {
  background: #e8f5e8;
  border-left: 4px solid #4caf50;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.anki-analysis {
  margin-top: 20px;
}

.anki-translations, .anki-strategies, .anki-cultural, .anki-mistakes, .anki-phrases {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.anki-translations {
  border-left: 4px solid #28a745;
}

.anki-strategies {
  border-left: 4px solid #ffc107;
}

.anki-cultural {
  border-left: 4px solid #17a2b8;
}

.anki-mistakes {
  border-left: 4px solid #dc3545;
}

.anki-phrases {
  border-left: 4px solid #6f42c1;
}

.anki-progress {
  background: #f3e5f5;
  border-left: 4px solid #9c27b0;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.translation-pair {
  background: #f8f9fa;
  padding: 10px;
  margin: 8px 0;
  border-radius: 5px;
  border-left: 3px solid #28a745;
}

.vietnamese {
  color: #6c757d;
  font-style: italic;
  margin: 5px 0;
}

.phonetic {
  color: #007bff;
  font-family: monospace;
  font-size: 0.9em;
  margin: 5px 0;
}

.strategy-group p {
  margin: 8px 0;
}

.mistake-example {
  background: #f8d7da;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.mistake-example p {
  margin: 5px 0;
}

/* === GENERAL STYLES === */
h2 {
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

h3 {
  color: #555;
  margin-top: 15px;
}

ul, ol {
  padding-left: 20px;
}

li {
  margin: 5px 0;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .sentence-front, .sentence-back {
    padding: 15px;
    margin: 15px 0;
  }

  .english-main {
    font-size: 1em;
    padding: 12px;
  }
}
</style>
`;

  return ankiCSS + content;
}


/**
 * Detects the format being used based on the GPT response
 */
function detectFormat(text: string): 'sentence-building' | 'cloze' | 'dialog' {
  // Priority: sentence building format
  if (text.includes('**FRONT**') || text.includes('**BACK**') ||
    (text.includes('Front:') && text.includes('Back:'))) {
    return 'sentence-building';
  }

  // Legacy formats (rarely used now)
  if (text.includes('{{c') || text.includes('[...]')) {
    return 'cloze';
  }

  return 'dialog';
} export function extractSections(markdown: string, prompt: string) {
  const sections: {
    front: string;
    audio: string;
    ans: string;
    back: string
  } = {
    front: '',
    ans: '',
    audio: '',
    back: ''
  };

  const format = detectFormat(markdown);
  console.log('Detected format:', format);

  if (format === 'sentence-building') {
    // Parse structured sentence building format
    const frontMatch = markdown.match(/\*\*FRONT\*\*:?\s*(.*?)(?=\*\*BACK\*\*|$)/is);
    const backMatch = markdown.match(/\*\*BACK\*\*:?\s*(.*?)$/is);

    if (frontMatch && backMatch) {
      sections.front = frontMatch[1].trim();
      sections.back = backMatch[1].trim();
    } else {
      // Fallback to simple Front:/Back: format
      const simpleFront = markdown.match(/Front:\s*(.*?)(?=Back:|$)/is);
      const simpleBack = markdown.match(/Back:\s*(.*?)$/is);

      if (simpleFront && simpleBack) {
        sections.front = simpleFront[1].trim();
        sections.back = simpleBack[1].trim();
      } else {
        // Final fallback - use original split method
        const parts = markdown.split('---');
        if (parts.length >= 2) {
          sections.front = parts[0].trim();
          sections.back = parts[1].trim();
        } else {
          sections.front = `🇻🇳 Ý tưởng: ${prompt}\n📝 Pattern: Xây dựng câu tiếng Anh`;
          sections.back = markdown.trim();
        }
      }
    }

    // Extract English sentence for answer field
    const englishMatch = sections.back.match(/🇺🇸\s*English:\s*([^\n]+)/);
    if (englishMatch) {
      sections.ans = englishMatch[1].trim();
    } else {
      // Try alternative patterns
      const altMatch = sections.back.match(/English:\s*([^\n]+)/);
      sections.ans = altMatch ? altMatch[1].trim() : sections.back.split('\n')[0].trim();
    }

    // Create optimized audio content
    let audioContent = sections.ans;
    const alternativesMatch = sections.back.match(/🔄\s*Alternatives?:\s*([\s\S]*?)(?=🎯|🔊|📋|$)/i);
    if (alternativesMatch) {
      const alternatives = alternativesMatch[1]
        .split('\n')
        .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
        .filter(line => line && !line.includes('🎯') && !line.includes('🔊') && line.length > 3)
        .slice(0, 2) // Limit to first 2 alternatives for audio
        .join(' <break time="0.3s"/> ');

      if (alternatives) {
        audioContent += ' <break time="0.5s"/> ' + alternatives;
      }
    }
    sections.audio = audioContent;

    return sections;
  } else if (format === 'dialog') {
    // Extract Front section (scenario div or until ---)
    const frontMatch = markdown.match(/<div class="anki-scenario">[\s\S]*?<\/div>[\s\S]*?<div class="anki-dialog">[\s\S]*?<\/div>[\s\S]*?<div class="anki-options">[\s\S]*?<\/div>/) ||
      markdown.match(/[\s\S]*?(?=\n---)/);
    if (frontMatch) {
      sections.front = frontMatch[0].trim();
    }

    // Extract Audio from dialog exchanges (both HTML and markdown formats)
    let audioContent = '';

    // Try HTML format first
    const htmlDialogMatches = markdown.match(/<div class="dialog-exchange">([\s\S]*?)<\/div>/g);
    if (htmlDialogMatches) {
      audioContent = htmlDialogMatches
        .map(match => {
          const textContent = match.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          return textContent;
        })
        .join(' ');
    } else {
      // Fallback to markdown format
      const dialogMatch = markdown.match(/(?:\*\*Full Dialog:\*\*|🗣️ Full Dialog)([\s\S]*?)(?=\n\*\*Key Response Options:\*\*|🎭 Key Response Options|---)/);
      if (dialogMatch) {
        const dialogText = dialogMatch[1];
        const audioLines = dialogText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('- ') || line.includes(':'));

        audioContent = audioLines
          .map(line => {
            const colonIndex = line.indexOf(':');
            return colonIndex > -1
              ? line.substring(colonIndex + 1).trim()
              : line.replace(/^- /, '').trim();
          })
          .join(' ');
      }
    }

    sections.audio = audioContent + ' <break time="0.4s"/>';
    sections.ans = prompt || 'Dialog practice scenario';

    // Extract Back section (analysis part)
    const backMatch = markdown.match(/---\s*([\s\S]*)$/) ||
      markdown.match(/(?:\*\*Practice & Analysis\*\*|📚 Practice & Analysis)([\s\S]*)$/);
    if (backMatch) {
      sections.back = backMatch[1] ? backMatch[1].trim() : backMatch[0].trim();
    }

  } else {
    // Fallback: treat as simple content, create basic structure
    sections.front = `🇻🇳 Ý tưởng: ${prompt}\n📝 Pattern: Xây dựng câu tiếng Anh\n💡 Hint: Sử dụng ngữ pháp phù hợp`;
    sections.back = markdown.trim();
    sections.ans = prompt;
    sections.audio = prompt + ' <break time="0.4s"/>';
  }

  return sections;
}

export async function suggestAnkiNotes(
  openAIKey: string, { deckName, modelName, prompt }: Options, _notes: Note[]): Promise<any> {
  console.log('-------------- suggestAnkiNotes (Sentence Building) ----------------');
  console.log('Prompt:', prompt);
  console.log('Timestamp:', new Date().toISOString());

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      ...messages,
      {
        role: 'user',
        content: prompt,
      }
    ],
    // Optimized for sentence building cards
    temperature: 0.6,        // More consistent structure
    max_tokens: 800,         // Shorter responses for sentence building
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    stream: false
  };

  // Performance timing
  const startTime = performance.now();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify(body),
  });

  const endTime = performance.now();
  console.log(`API call took ${(endTime - startTime).toFixed(2)}ms`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('OpenAI API Error:', res.status, errorText);
    throw new Error(`OpenAI API request failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();

  if (!data.choices || !data.choices.length) {
    throw new Error('No completion choices were returned from OpenAI');
  }

  // Log usage statistics for optimization
  if (data.usage) {
    console.log('Token Usage:', {
      prompt_tokens: data.usage.prompt_tokens,
      completion_tokens: data.usage.completion_tokens,
      total_tokens: data.usage.total_tokens,
      estimated_cost: (data.usage.total_tokens * 0.00015 / 1000).toFixed(4) + ' USD' // gpt-4o-mini pricing
    });
  }

  const noteContent = data.choices[0].message.content;
  const sections = extractSections(noteContent, prompt);

  // Debug logging
  console.log('=== DEBUG SECTIONS ===');
  console.log('Front:', sections.front.substring(0, 100) + '...');
  console.log('Audio length:', sections.audio.length);
  console.log('Audio content:', sections.audio.substring(0, 200) + '...');
  console.log('Answer:', sections.ans);
  console.log('Back:', sections.back.substring(0, 100) + '...');
  console.log('=== END DEBUG ===');

  if (sections.audio.length === 0) {
    console.warn('No audio extracted, using fallback');
    // Fallback: use the prompt itself as audio
    sections.audio = prompt + ' <break time="0.4s"/>';
    sections.ans = prompt;
  }

  const format = detectFormat(noteContent);
  console.log('Final sections:', sections);

  if (format === 'sentence-building') {
    // Apply styling to sentence building format
    const styledFront = addAnkiStyling(formatSentenceFront(sections.front));
    const styledBack = addAnkiStyling(formatSentenceBack(sections.back));

    return [{
      key: crypto.randomUUID(),
      deckName,
      modelName,
      fields: {
        Front: styledFront,
        Question: styledFront,    // Same as front
        Ans: sections.ans,        // The English sentence
        Back: styledBack,         // Full explanation
        Audio: sections.audio,    // English + alternatives
      },
      tags: ['sentence-building']
    }];
  } else if (format === 'dialog') {
    // Add CSS styling to the content
    const styledFront = addAnkiStyling(sections.front);
    const styledBack = addAnkiStyling(sections.back);

    // Dialog format: Front = scenario, Back = full analysis + dialog
    return [{
      key: crypto.randomUUID(),
      deckName,
      modelName,
      fields: {
        Front: styledFront,
        Question: styledFront, // Same as front for dialog
        Ans: styledBack, // Full analysis as answer
        Back: styledBack,
        Audio: sections.audio,
      },
      tags: []
    }];
  } else {
    // Legacy dialog format - convert to sentence building style
    const styledFront = addAnkiStyling(sections.front);
    const styledBack = addAnkiStyling(sections.back);

    return [{
      key: crypto.randomUUID(),
      deckName,
      modelName,
      fields: {
        Front: styledFront,
        Question: styledFront,
        Ans: sections.ans,
        Back: styledBack,
        Audio: sections.audio,
      },
      tags: ['legacy-format']
    }];
  }
}

