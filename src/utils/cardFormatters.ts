import { PromptConfig } from '../config/promptConfigs';

/**
 * Format the front side for conversation-focused cards
 */
export function formatConversationFront(content: string): string {
  // Extract situation, intention and question
  const situationMatch = content.match(/🎭\s*Tình huống:\s*([^\n]+)/);
  const intentionMatch = content.match(/💭\s*Bạn muốn nói:\s*["""]([^"""]+)["""]/);
  const questionMatch = content.match(/❓\s*([^\n]+)/);

  const situation = situationMatch ? situationMatch[1].trim() : '';
  const intention = intentionMatch ? intentionMatch[1].trim() : content;
  const question = questionMatch ? questionMatch[1].trim() : 'Làm sao để nói?';

  return `
<div class="conversation-front">
  <div class="situation-context">
    🎭 <strong>Tình huống:</strong> ${situation}
  </div>
  <div class="intention-context">
    💭 <strong>Bạn muốn nói:</strong> "${intention}"
  </div>
  <div class="conversation-question">
    ❓ ${question}
  </div>
</div>`.trim();
}

/**
 * Format the back side for conversation-focused cards
 */
export function formatConversationBack(content: string): string {
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

/**
 * Format the front side for typing practice cards
 */
export function formatTypingFront(content: string): string {
  const listeningMatch = content.match(/🎧\s*Bạn nghe:\s*["""]([^"""]+)["""]/);
  const hintMatch = content.match(/💭\s*Gợi ý tiếng Việt:\s*["""]([^"""]+)["""]/);
  const promptMatch = content.match(/⌨️\s*([^\n]+)/);

  const listening = listeningMatch ? listeningMatch[1].trim() : '';
  const hint = hintMatch ? hintMatch[1].trim() : content;
  const prompt = promptMatch ? promptMatch[1].trim() : 'Hãy gõ câu trả lời bằng tiếng Anh:';

  return `
<div class="typing-front">
  <div class="listening-prompt">
    🎧 <strong>Bạn nghe:</strong> "${listening}"
  </div>
  <div class="hint-vietnamese">
    💭 <strong>Gợi ý tiếng Việt:</strong> "${hint}"
  </div>
  <div class="typing-challenge">
    ⌨️ ${prompt}
  </div>
  <div class="typing-input">
    <input type="text" class="anki-typing-input" placeholder="Type your response here..." />
  </div>
</div>`.trim();
}

/**
 * Format the back side for typing practice cards
 */
export function formatTypingBack(content: string): string {
  const correctMatch = content.match(/✅\s*Câu đúng nhất:\s*([^\n]+)/);
  const alternativesMatch = content.match(/🔄\s*Các cách khác cũng đúng:\s*([\s\S]*?)(?=💡|🎯|$)/i);
  const analysisMatch = content.match(/💡\s*Phân tích:\s*([\s\S]*?)(?=🎯|$)/i);
  const tipMatch = content.match(/🎯\s*Mẹo typing:\s*([\s\S]*?)$/i);

  const correct = correctMatch ? correctMatch[1].trim() : content.split('\n')[0];

  let formattedContent = `
<div class="typing-back">
  <div class="correct-answer">
    ✅ <strong>Câu đúng nhất:</strong> ${correct}
  </div>`;

  // Add alternatives
  if (alternativesMatch) {
    const alternatives = alternativesMatch[1]
      .split('\n')
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(line => line && line.length > 5)
      .map(alt => `<li>${alt}</li>`)
      .join('');

    if (alternatives) {
      formattedContent += `
  <div class="typing-alternatives">
    🔄 <strong>Các cách khác cũng đúng:</strong>
    <ul>${alternatives}</ul>
  </div>`;
    }
  }

  // Add analysis
  if (analysisMatch) {
    const analysis = analysisMatch[1].trim();
    formattedContent += `
  <div class="typing-analysis">
    💡 <strong>Phân tích:</strong>
    <div class="analysis-content">${analysis}</div>
  </div>`;
  }

  // Add typing tip
  if (tipMatch) {
    const tip = tipMatch[1].trim();
    formattedContent += `
  <div class="typing-tip">
    🎯 <strong>Mẹo typing:</strong> ${tip}
  </div>`;
  }

  formattedContent += '\n</div>';
  return formattedContent.trim();
}

/**
 * Format the front side for sentence building cards
 */
export function formatSentenceFront(content: string): string {
  const ideaMatch = content.match(/🇻🇳\s*Ý tưởng:\s*([^\n]+)/);
  const patternMatch = content.match(/📝\s*Pattern:\s*([^\n]+)/);
  const questionMatch = content.match(/❓\s*([^\n]+)/);

  const idea = ideaMatch ? ideaMatch[1].trim() : content;
  const pattern = patternMatch ? patternMatch[1].trim() : '';
  const question = questionMatch ? questionMatch[1].trim() : 'Hãy xây dựng câu tiếng Anh?';

  return `
<div class="sentence-front">
  <div class="vietnamese-idea">
    🇻🇳 <strong>Ý tưởng:</strong> ${idea}
  </div>
  ${pattern ? `
  <div class="pattern-hint">
    📝 <strong>Pattern:</strong> ${pattern}
  </div>` : ''}
  <div class="sentence-question">
    ❓ ${question}
  </div>
</div>`.trim();
}

/**
 * Format the back side for sentence building cards
 */
export function formatSentenceBack(content: string): string {
  const englishMatch = content.match(/🇺🇸\s*English:\s*([^\n]+)/);
  const alternativesMatch = content.match(/🔄\s*Alternatives?:\s*([\s\S]*?)(?=🎯|💡|$)/i);
  const structureMatch = content.match(/🎯\s*Structure:\s*([\s\S]*?)(?=💡|$)/i);
  const usageMatch = content.match(/💡\s*Usage:\s*([\s\S]*?)$/i);

  const englishSentence = englishMatch ? englishMatch[1].trim() : content.split('\n')[0];

  let formattedContent = `
<div class="sentence-back">
  <div class="english-main">
    🇺🇸 <strong>English:</strong> ${englishSentence}
  </div>`;

  // Add alternatives if available
  if (alternativesMatch) {
    const alternatives = alternativesMatch[1]
      .split('\n')
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(line => line && line.length > 3)
      .map(alt => `<li>${alt}</li>`)
      .join('');

    if (alternatives) {
      formattedContent += `
  <div class="alternatives-section">
    🔄 <strong>Alternatives:</strong>
    <ul>${alternatives}</ul>
  </div>`;
    }
  }

  // Add structure explanation if available
  if (structureMatch) {
    const structure = structureMatch[1].trim();
    formattedContent += `
  <div class="structure-explanation">
    🎯 <strong>Structure:</strong> ${structure}
  </div>`;
  }

  // Add usage explanation if available
  if (usageMatch) {
    const usage = usageMatch[1].trim();
    formattedContent += `
  <div class="usage-explanation">
    💡 <strong>Usage:</strong> ${usage}
  </div>`;
  }

  formattedContent += '\n</div>';
  return formattedContent.trim();
}

// Format function registry
export const FORMAT_FUNCTIONS = {
  formatConversationFront,
  formatConversationBack,
  formatTypingFront,
  formatTypingBack,
  formatSentenceFront,
  formatSentenceBack
};

/**
 * Get formatting functions based on prompt config
 */
export function getFormatFunctions(config: PromptConfig) {
  return {
    front: FORMAT_FUNCTIONS[config.formatFunctions.front as keyof typeof FORMAT_FUNCTIONS],
    back: FORMAT_FUNCTIONS[config.formatFunctions.back as keyof typeof FORMAT_FUNCTIONS]
  };
}