/**
 * =====================================================
 * 🎯 COMPACT ANKI CARD SERVICE
 * =====================================================
 * Simple service for Front/Back/Audio/Ans cards
 */

import { ankiExtractor } from './extraction/extractorFactory';
import { applyAnkiStyling, defaultStyleConfig } from './styling/ankiStyler';
import { AnkiNote, ExtractedSections, StyleConfig } from '../types/anki';

export interface AnkiServiceOptions {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
  styleConfig?: StyleConfig;
}

export class AnkiCardService {
  /**
   * Main method: AI response → Anki card
   */
  static processAIResponse(
    htmlContent: string,
    prompt: string,
    options: AnkiServiceOptions
  ): {
    note: AnkiNote;
    sections: ExtractedSections;
  } {
    // Extract sections
    const sections = ankiExtractor.extract({ htmlContent, prompt });

    // Apply styling
    const styleConfig = options.styleConfig || defaultStyleConfig;
    const styledFront = applyAnkiStyling(sections.front, styleConfig);
    const styledBack = applyAnkiStyling(sections.back, styleConfig);

    // Hide target word in front
    const hiddenFront = this.hideTargetWord(styledFront, prompt);

    // Build note
    const note: AnkiNote = {
      key: crypto.randomUUID(),
      deckName: options.deckName,
      modelName: options.modelName,
      tags: options.tags,
      fields: {
        Front: hiddenFront,
        Back: styledBack,
        Audio: sections.audio,
        Ans: sections.ans
      }
    };

    return { note, sections };
  }

  /**
   * Hide target word for cloze effect
   */
  static hideTargetWord(content: string, targetWord: string): string {
    return content
      .replace(/{{.*?}}/g, '[...]')
      .replace(new RegExp(targetWord, 'gi'), '[...]');
  }

  /**
   * Validate sections have required content
   */
  static validateSections(sections: ExtractedSections): boolean {
    return !!(sections.front && sections.back && sections.audio);
  }
}

/**
 * Backward compatibility utilities
 */
export namespace AnkiUtils {
  /**
   * Extract sections (backward compatibility)
   */
  export function extractSections(htmlContent: string, prompt: string): ExtractedSections {
    return ankiExtractor.extract({ htmlContent, prompt });
  }

  /**
   * Apply default styling (backward compatibility)
   */
  export function addAnkiStyling(content: string): string {
    return applyAnkiStyling(content, defaultStyleConfig);
  }
}