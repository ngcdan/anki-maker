/**
 * =====================================================
 * 🎨 ANKI CARD STYLING FRAMEWORK - MINIMAL THEME
 * =====================================================
 * Simple styling system for Front/Back/Audio/Ans card structure
 * Framework defines base layout, detailed styles added per prompt
 */

import { StyleConfig } from '../../types/anki';

// Compact and space-efficient CSS framework for Anki cards
const ankiCSS = `
/* Base Variables - Space-efficient design */
:root {
  --anki-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  --anki-space-xs: 4px;
  --anki-space-sm: 8px;
  --anki-space-md: 12px;
  --anki-space-lg: 16px;
  --anki-border-radius-sm: 4px;
  --anki-border-radius-md: 6px;
  --anki-color-border: #e2e5e9;
  --anki-color-bg: #f8f9fa;
  --anki-color-muted: #e5e7eb;
  --anki-color-accent: #2563eb;
  --anki-color-highlight: #f59e0b;
}

/* Card Container */
.anki-card {
  font-family: var(--anki-font);
  line-height: 1.5;
  max-width: 100%;
  margin: 0;
  background: #fff;
  border: 1px solid var(--anki-color-border);
  border-radius: var(--anki-border-radius-md);
}

/* FRONT - Compact Question Layout */
.anki-front {
  padding: var(--anki-space-lg) var(--anki-space-md);
  text-align: center;
  background: var(--anki-color-bg);
  border-bottom: 1px solid var(--anki-color-border);
}

.anki-word {
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 var(--anki-space-sm) 0;
}

.anki-pronunciation {
  font-size: 14px;
  color: #718096;
  font-style: italic;
  margin: 0 0 var(--anki-space-md) 0;
}

.anki-context {
  font-size: 14px;
  color: #4a5568;
  background: #fff;
  padding: var(--anki-space-sm) var(--anki-space-md);
  border-radius: var(--anki-border-radius-sm);
  border-left: 3px solid var(--anki-color-accent);
  margin: 0;
}

/* BACK - Compact Answer Layout */
.anki-back {
  padding: var(--anki-space-md);
}

.anki-section {
  margin-bottom: var(--anki-space-md);
  padding: var(--anki-space-sm) var(--anki-space-md);
  border-radius: var(--anki-border-radius-sm);
  border-left: 3px solid var(--anki-color-border);
}

.anki-section:last-child {
  margin-bottom: 0;
}

.anki-section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin: 0 0 var(--anki-space-xs) 0;
  opacity: 0.8;
}

/* Section Types */
.anki-meaning {
  background: #f0f9ff;
  border-left-color: var(--anki-color-accent);
}

.anki-meaning .anki-section-title {
  color: #2b6cb0;
}

.anki-meaning-text {
  font-size: 15px;
  font-weight: 500;
  color: #2c5282;
  margin: 0;
}

.anki-examples {
  background: #f0fff4;
  border-left-color: #48bb78;
}

.anki-examples .anki-section-title {
  color: #2f855a;
}

.anki-example {
  margin: var(--anki-space-xs) 0;
  padding: var(--anki-space-xs) var(--anki-space-sm);
  background: rgba(255,255,255,0.7);
  border-radius: var(--anki-border-radius-sm);
  font-size: 14px;
}

.anki-example:last-child {
  margin-bottom: 0;
}

.anki-grammar {
  background: #fffaf0;
  border-left-color: var(--anki-color-highlight);
}

.anki-grammar .anki-section-title {
  color: #c05621;
}

/* Audio & Answer */
.anki-audio {
  background: var(--anki-color-bg);
  border-left-color: #a0aec0;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #4a5568;
  white-space: pre-wrap;
}

.anki-answer {
  display: inline-block;
  background: var(--anki-color-highlight);
  color: white;
  padding: var(--anki-space-xs) var(--anki-space-md);
  border-radius: var(--anki-space-lg);
  font-weight: 600;
  font-size: 14px;
}

/* Hidden elements for cloze deletion */
.anki-hidden {
  background: var(--anki-color-muted);
  color: var(--anki-color-muted);
  padding: var(--anki-space-xs) var(--anki-space-sm);
  border-radius: var(--anki-border-radius-sm);
  font-weight: 600;
}

/* Mobile Responsive - Even more compact */
@media (max-width: 768px) {
  .anki-front { padding: var(--anki-space-lg) var(--anki-space-md); min-height: 120px; }
  .anki-word { font-size: 24px; }
  .anki-pronunciation { font-size: 12px; }
  .anki-back { padding: var(--anki-space-md); }
  .anki-section { padding: var(--anki-space-sm); margin-bottom: var(--anki-space-sm); }
}
`;

/**
 * Generate complete CSS for Anki cards
 */
export const generateAnkiCSS = (config: StyleConfig = { theme: 'minimal' }): string => {
  let css = ankiCSS;

  // Add custom CSS if provided
  if (config.customCSS) {
    css += `\n/* Custom Styles */\n${config.customCSS}`;
  }

  return css;
};

/**
 * Apply styling to HTML content
 */
export const applyAnkiStyling = (
  htmlContent: string,
  config: StyleConfig = { theme: 'minimal' }
): string => {
  const css = generateAnkiCSS(config);

  return `<style>${css}</style>
<div class="anki-card">
${htmlContent}
</div>`;
};

/**
 * Default configuration
 */
export const defaultStyleConfig: StyleConfig = {
  theme: 'minimal',
};

/**
 * Utility to hide specific target words in content
 */
export const hideTargetWord = (content: string, targetWord: string): string => {
  if (!targetWord) return content;
  const regex = new RegExp(`\\b${targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  return content.replace(regex, '<span class="anki-hidden">______</span>');
};
