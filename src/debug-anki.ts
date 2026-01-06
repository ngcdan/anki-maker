// Debug script to check Anki models and fields
// Run this in browser console to check what's available

import { ankiService } from './services/anki/ankiService';

export async function debugAnki() {
  console.log('🔍 Checking Anki models and decks...');

  try {
    const models = await ankiService.fetchModels();
    console.log('📋 Available models:', models);

    const decks = await ankiService.fetchDecks();
    console.log('📚 Available decks:', decks);

    // Check fields for specific models
    const modelName = 'Basic_cloze_2';
    if (models.includes(modelName)) {
      const fields = await ankiService.fetchModelFieldNames(modelName);
      console.log(`📝 Fields for "${modelName}":`, fields);
    } else {
      console.warn(`⚠️ Model "${modelName}" does not exist!`);
      console.log('Available models:', models);

      // Check Basic model as fallback
      if (models.includes('Basic')) {
        const basicFields = await ankiService.fetchModelFieldNames('Basic');
        console.log('📝 Fields for "Basic":', basicFields);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Auto-run
if (typeof window !== 'undefined') {
  (window as any).debugAnki = debugAnki;
  console.log('✅ Debug function loaded. Run: debugAnki()');
}
