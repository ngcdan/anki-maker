/**
 * Service to generate Cloze deletions for Anki cards
 */

export interface ClozeOptions {
  targetWord?: string;  // Từ cần cloze (nếu có)
  maxClozes?: number;   // Số lượng cloze tối đa
  clozeSentences?: boolean; // Cloze cả câu thay vì từ
}

export class ClozeGenerator {
  /**
   * Convert HTML content to Cloze format
   * Wraps target words or important elements with {{c1::text}}, {{c2::text}}, etc.
   */
  static generateCloze(content: string, options: ClozeOptions = {}): string {
    const { targetWord, maxClozes = 3 } = options;

    // If target word is provided, cloze it
    if (targetWord) {
      return this.clozeTargetWord(content, targetWord);
    }

    // Otherwise, intelligently select words to cloze
    return this.autoGenerateCloze(content, maxClozes);
  }

  /**
   * Cloze a specific target word in the content
   */
  private static clozeTargetWord(content: string, targetWord: string): string {
    // Case-insensitive regex to find the word
    const wordPattern = new RegExp(`\\b(${this.escapeRegex(targetWord)})\\b`, 'gi');
    let clozeIndex = 1;

    return content.replace(wordPattern, (match) => {
      return `{{c${clozeIndex++}::${match}}}`;
    });
  }

  /**
   * Auto-generate cloze deletions for important words
   */
  private static autoGenerateCloze(content: string, maxClozes: number): string {
    // Extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || '';

    // Find words to cloze (nouns, verbs, adjectives in capital or quoted)
    // For now, we'll cloze words that are:
    // 1. In quotes
    // 2. Capitalized (but not at sentence start)
    // 3. Long words (> 6 characters)

    const wordsToHighlight: string[] = [];

    // Find quoted words
    const quotedPattern = /"([^"]+)"|'([^']+)'/g;
    let match;
    while ((match = quotedPattern.exec(textContent)) !== null) {
      wordsToHighlight.push(match[1] || match[2]);
    }

    // If not enough, find long words
    if (wordsToHighlight.length < maxClozes) {
      const words = textContent.match(/\b[A-Za-z]{7,}\b/g) || [];
      wordsToHighlight.push(...words.slice(0, maxClozes - wordsToHighlight.length));
    }

    // Apply cloze deletions
    let result = content;
    wordsToHighlight.slice(0, maxClozes).forEach((word, index) => {
      const wordPattern = new RegExp(`\\b(${this.escapeRegex(word)})\\b`, 'i');
      result = result.replace(wordPattern, `{{c${index + 1}::$1}}`);
    });

    return result;
  }

  /**
   * Extract target word from a conversation or context
   * Usually the word that's being learned
   */
  static extractTargetWord(content: string): string | null {
    // Try to extract from "WORD:" section
    const wordMatch = content.match(/WORD:\s*([^\n]+)/i);
    if (wordMatch) {
      return wordMatch[1].trim();
    }

    // Try to extract from quotes
    const quoteMatch = content.match(/"([^"]+)"|'([^']+)'/);
    if (quoteMatch) {
      return (quoteMatch[1] || quoteMatch[2]).trim();
    }

    return null;
  }

  /**
   * Create cloze from structured vocab card content
   */
  static createVocabCloze(front: string, back: string, targetWord?: string): {
    Front: string;
    Back: string;
    Ans: string;
  } {
    // Extract target word if not provided
    if (!targetWord) {
      targetWord = this.extractTargetWord(front + ' ' + back);
    }

    // For vocab cards, we want to cloze the target word in the context
    let clozedFront = front;
    if (targetWord) {
      clozedFront = this.clozeTargetWord(front, targetWord);
    }

    return {
      Front: clozedFront,
      Back: back,
      Ans: targetWord || '',
    };
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Check if content already has cloze deletions
   */
  static hasCloze(content: string): boolean {
    return /\{\{c\d+::[^}]+\}\}/.test(content);
  }

  /**
   * Remove existing cloze deletions
   */
  static removeCloze(content: string): string {
    return content.replace(/\{\{c\d+::([^}]+)\}\}/g, '$1');
  }
}
