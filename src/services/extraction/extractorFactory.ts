/**
 * =====================================================
 * 🔧 COMPACT ANKI EXTRACTION
 * =====================================================
 * Simple extraction for Front/Back/Audio/Ans cards
 */

import { AIResponse, ExtractedSections } from '../../types/anki';
import { extractVocabCard } from './vocabExtractor';

/**
 * Main extractor class - handles standard vocab card format
 */
export class AnkiExtractor {
  /**
   * Extract sections from vocab card AI response
   */
  extract(response: AIResponse): ExtractedSections {
    const { htmlContent, prompt } = response;

    // Check for new structured format first
    if (htmlContent.includes('=== FRONT_START ===') && htmlContent.includes('=== BACK_START ===')) {
      const vocabData = extractVocabCard(htmlContent);
      return {
        front: vocabData.Front,
        back: vocabData.Back,
        audio: vocabData.Audio,
        ans: vocabData.Ans
      };
    }

    // Fallback to HTML parsing
    return {
      front: this.extractFront(htmlContent),
      back: this.extractBack(htmlContent),
      audio: this.extractAudio(htmlContent, prompt),
      ans: this.extractAnswer(htmlContent, prompt)
    };
  }

  private extractFront(htmlContent: string): string {
    const pattern = '<div class="front-section">(.*?)</div>\\s*<div class="back-section">';
    const match = htmlContent.match(new RegExp(pattern, 's'));
    if (match) {
      return `<div class="anki-card"><div class="front-section">${match[1]}</div></div>`;
    }
    return '';
  }

  private extractBack(htmlContent: string): string {
    const pattern = '<div class="back-section">(.*?)(?=<style>|$)';
    const match = htmlContent.match(new RegExp(pattern, 's'));
    if (match) {
      return `<div class="anki-card"><div class="back-section">${match[1]}</div></div>`;
    }
    return '';
  }

  private extractAudio(htmlContent: string, targetWord: string): string {
    const dialoguePattern = '<div class="dialogue">(.*?)</div>';
    const dialogueMatch = htmlContent.match(new RegExp(dialoguePattern, 's'));

    if (!dialogueMatch) {
      return `Audio content for word: ${targetWord}`;
    }

    const pPattern = '<p><strong>.*?</strong>\\s*(.*?)</p>';
    const pMatches = dialogueMatch[1].match(new RegExp(pPattern, 'g'));

    if (!pMatches) {
      return `Audio content for word: ${targetWord}`;
    }

    const audioLines = pMatches
      .map(pTag => {
        const textMatch = pTag.match(/<strong>.*?<\/strong>\s*(.*?)<\/p>/);
        if (textMatch) {
          return this.cleanForAudio(textMatch[1], targetWord);
        }
        return '';
      })
      .filter(line => line.trim())
      .map(line => line + ' <break time="0.4s"/>')
      .join('\n');

    return audioLines || `Audio content for word: ${targetWord}`;
  }

  private extractAnswer(htmlContent: string, targetWord: string): string {
    const dialoguePattern = '<div class="dialogue">(.*?)</div>';
    const dialogueMatch = htmlContent.match(new RegExp(dialoguePattern, 's'));

    if (!dialogueMatch) return targetWord;

    const pPattern = '<p><strong>.*?</strong>\\s*(.*?)</p>';
    const pMatches = dialogueMatch[1].match(new RegExp(pPattern, 'g'));

    if (!pMatches) return targetWord;

    // Find line containing target word
    for (const pTag of pMatches) {
      const textMatch = pTag.match(/<strong>.*?<\/strong>\s*(.*?)<\/p>/);
      if (textMatch) {
        const cleanText = this.cleanForAudio(textMatch[1], targetWord);
        if (cleanText.toLowerCase().includes(targetWord.toLowerCase())) {
          return cleanText;
        }
      }
    }

    return targetWord;
  }

  private cleanForAudio(text: string, targetWord: string): string {
    return text
      .replace(/{{.*?}}/g, targetWord)
      .replace(/<[^>]*>/g, '')
      .replace(/&[a-z]+;/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Create extractor instance - single class for simplicity
export const ankiExtractor = new AnkiExtractor();