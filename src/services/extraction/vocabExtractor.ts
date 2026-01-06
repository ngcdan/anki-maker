/**
 * =====================================================
 * 📝 VOCAB PROMPT EXTRACTOR
 * =====================================================
 * Extracts structured data from vocab prompt AI responses
 * Handles the FRONT/BACK/AUDIO/ANS format sections
 */

import { AnkiFields } from '../../types/anki';

export interface VocabCardData extends AnkiFields {
  word: string;
  partOfSpeech: string;
  phonetics: string;
  context: string;
  completeConversation: string;
  vietnameseMeaning: string;
  synonyms: string;
  grammarNotes: string;
  usageNotes: string;
  culturalContext: string;
}

/**
 * Extract vocabulary card data from AI response
 */
export function extractVocabCard(aiResponse: string): VocabCardData {
  const sections = parseStructuredResponse(aiResponse);

  const frontSection = sections.FRONT || '';
  const backSection = sections.BACK || '';
  const audioSection = sections.AUDIO || 'Audio content not available';
  const ansSection = sections.ANS || 'Answer not available';

  // Parse FRONT section
  const word = extractField(frontSection, 'WORD:');
  const partOfSpeech = extractField(frontSection, 'PART_OF_SPEECH:');
  const phonetics = extractField(frontSection, 'PHONETICS:');
  const context = extractField(frontSection, 'CONTEXT:');

  // Parse BACK section - extract conversation first
  const conversationSection = extractDelimitedSection(backSection, 'CONVERSATION_START', 'CONVERSATION_END');
  const completeConversation = conversationSection;

  // Extract Analysis section, then extract fields from it
  const analysisSection = extractDelimitedSection(backSection, 'ANALYSIS_START', 'ANALYSIS_END');
  const vietnameseMeaning = extractField(analysisSection, 'VIETNAMESE_MEANING:');
  const synonyms = extractField(analysisSection, 'SYNONYMS:');
  const grammarNotes = extractField(analysisSection, 'GRAMMAR_NOTES:');
  const usageNotes = extractField(analysisSection, 'USAGE_NOTES:');
  const culturalContext = extractField(analysisSection, 'CULTURAL_CONTEXT:');

  return {
    // Standard Anki fields
    Front: buildFrontContent(word, partOfSpeech, phonetics, context),
    Back: buildBackContent(completeConversation, vietnameseMeaning, synonyms, grammarNotes, usageNotes, culturalContext),
    Audio: audioSection.trim(),
    Ans: ansSection.trim(),

    // Raw extracted data
    word: word.trim(),
    partOfSpeech: partOfSpeech.trim(),
    phonetics: phonetics.trim(),
    context: context.trim(),
    completeConversation: completeConversation.trim(),
    vietnameseMeaning: vietnameseMeaning.trim(),
    synonyms: synonyms.trim(),
    grammarNotes: grammarNotes.trim(),
    usageNotes: usageNotes.trim(),
    culturalContext: culturalContext.trim(),
  };
}

/**
 * Parse structured AI response into sections
 */
function parseStructuredResponse(response: string): Record<string, string> {
  const sections: Record<string, string> = {};

  // Extract sections using the new delimiter format
  const sectionRegex = /=== (FRONT|BACK|AUDIO|ANS)_START ===(.*?)=== \1_END ===/gs;

  let match;
  while ((match = sectionRegex.exec(response)) !== null) {
    const sectionName = match[1].trim();
    const sectionContent = match[2].trim();
    sections[sectionName] = sectionContent;
  }

  return sections;
}

/**
 * Extract content between two delimiters
 */
function extractDelimitedSection(text: string, startDelimiter: string, endDelimiter: string): string {
  const startPattern = new RegExp(`--- ${startDelimiter} ---`);
  const endPattern = new RegExp(`--- ${endDelimiter} ---`);

  const lines = text.split('\n');
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (startPattern.test(line)) {
      startIndex = i + 1;
    } else if (endPattern.test(line) && startIndex !== -1) {
      endIndex = i;
      break;
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    return '';
  }

  return lines.slice(startIndex, endIndex).join('\n').trim();
}

/**
 * Extract field content after a label
 */
function extractField(text: string, label: string): string {
  const lines = text.split('\n');
  const startIndex = lines.findIndex(line => line.trim().startsWith(label));

  if (startIndex === -1) {
    return '';
  }

  // Get content on the same line after the label
  let content = lines[startIndex].replace(label, '').trim();

  // Handle multi-line content
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Stop at next field label or section delimiter
    if (trimmedLine.match(/^[A-Z][A-Z_]*:/) ||
      trimmedLine.match(/^---.*---$/)) {
      break;
    }

    // Include content, preserve line breaks for multi-line fields
    if (trimmedLine) {
      if (content) {
        content += ' ' + trimmedLine;
      } else {
        content = trimmedLine;
      }
    }
  }

  return content.trim();
}

/**
 * Build front content with compact styling
 */
function buildFrontContent(
  word: string,
  partOfSpeech: string,
  phonetics: string,
  context: string
): string {
  return `
<div class="anki-front">
  <div class="anki-word">${word}</div>
  <div class="anki-pronunciation">${partOfSpeech} ${phonetics}</div>

  <div class="anki-context">
    ${context}
  </div>
</div>`.trim();
}

/**
 * Build back content with all details
 */
function buildBackContent(
  completeConversation: string,
  vietnameseMeaning: string,
  synonyms: string,
  grammarNotes: string,
  usageNotes: string,
  culturalContext: string
): string {
  return `
<div class="anki-back">
  <div class="anki-section anki-meaning">
    <div class="anki-section-title">Vietnamese</div>
    <div class="anki-meaning-text">${vietnameseMeaning}</div>
  </div>

  <div class="anki-section anki-examples">
    <div class="anki-section-title">Complete Conversation</div>
    ${formatCompleteConversation(completeConversation)}
  </div>

  <div class="anki-section anki-grammar">
    <div class="anki-section-title">Synonyms</div>
    ${synonyms}
  </div>

  <div class="anki-section">
    <div class="anki-section-title">Grammar Notes</div>
    ${grammarNotes}
  </div>

  <div class="anki-section">
    <div class="anki-section-title">Usage Notes</div>
    ${usageNotes}
  </div>

  <div class="anki-section">
    <div class="anki-section-title">Cultural Context</div>
    ${culturalContext}
  </div>
</div>`.trim();
}

/**
 * Format complete conversation for back card
 */
function formatCompleteConversation(conversation: string): string {
  const lines = conversation.split('\n');
  const formattedLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Handle dialogue lines that start with "-"
    if (trimmedLine.startsWith('-')) {
      formattedLines.push(`<div class="anki-dialogue">${trimmedLine}</div>`);
    }
    // Handle Vietnamese translation lines (indented lines without "-")
    else if (trimmedLine && !trimmedLine.includes(':')) {
      formattedLines.push(`<div class="anki-translation">&nbsp;&nbsp;${trimmedLine}</div>`);
    }
  }

  return formattedLines.join('\n');
}

/**
 * Debug extraction helper
 */
export function debugVocabExtraction(aiResponse: string): any {
  const sections = parseStructuredResponse(aiResponse);
  const backSection = sections.BACK || '';
  const analysisSection = extractDelimitedSection(backSection, 'ANALYSIS_START', 'ANALYSIS_END');

  return {
    sections: Object.keys(sections),
    backSectionLength: backSection.length,
    analysisSection: analysisSection,
    vietnameseMeaning: extractField(analysisSection, 'VIETNAMESE_MEANING:'),
    synonyms: extractField(analysisSection, 'SYNONYMS:'),
    grammarNotes: extractField(analysisSection, 'GRAMMAR_NOTES:'),
    usageNotes: extractField(analysisSection, 'USAGE_NOTES:'),
    culturalContext: extractField(analysisSection, 'CULTURAL_CONTEXT:')
  };
}

/**
 * Validation helper
 */
export function validateVocabCard(card: VocabCardData): string[] {
  const errors: string[] = [];

  if (!card.word) errors.push('Missing word');
  if (!card.Front) errors.push('Missing Front content');
  if (!card.Back) errors.push('Missing Back content');
  if (!card.Audio) errors.push('Missing Audio content');
  if (!card.Ans) errors.push('Missing Ans content');

  return errors;
}