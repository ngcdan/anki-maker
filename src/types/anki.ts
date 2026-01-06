/**
 * =====================================================
 * 🎯 COMPACT ANKI CARD TYPES
 * =====================================================
 * Simplified types for standard Front/Back/Audio/Ans cards
 */

// Standard Anki card fields (always the same structure)
export interface AnkiFields {
  Front: string;  // Question side HTML (styled)
  Back: string;   // Answer side HTML (styled)
  Audio: string;  // TTS audio text
  Ans: string;    // Target answer word/phrase
}

// Standard Anki note structure
export interface AnkiNote {
  modelName: string;
  deckName: string;
  fields: AnkiFields;
  tags: string[];
  key: string;
  trashed?: boolean;
  created?: boolean;
}

// AI Response structure
export interface AIResponse {
  htmlContent: string;
  prompt: string;
}

// Extracted sections from AI response
export interface ExtractedSections {
  front: string;    // Raw HTML for Front field
  back: string;     // Raw HTML for Back field
  audio: string;    // Text for Audio field
  ans: string;      // Text for Ans field
}

// Styling themes (minimal only for now)
export type StyleTheme = 'minimal';

// Compact styling configuration
export interface StyleConfig {
  theme: StyleTheme;
  customCSS?: string;
}