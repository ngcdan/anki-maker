import { ENDPOINTS, ANKI_CONNECT_VERSION, ERROR_MESSAGES } from '../../constants';
import { AnkiConnectRequest, AnkiConnectResponse, Note, NoteFields } from '../../types';
import { ClozeGenerator } from '../cloze/clozeGenerator';

class AnkiService {
  private async ankiConnect<T = any>(params: Omit<AnkiConnectRequest, 'version'>): Promise<T> {
    try {
      const response = await fetch(ENDPOINTS.ANKI_CONNECT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: ANKI_CONNECT_VERSION,
          ...params,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AnkiConnectResponse<T> = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.result;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.ANKI_CONNECTION);
      }
      throw error;
    }
  }

  async fetchDecks(): Promise<string[]> {
    return this.ankiConnect({ action: 'deckNames' });
  }

  async fetchTags(): Promise<string[]> {
    return this.ankiConnect({ action: 'getTags' });
  }

  async fetchModels(): Promise<string[]> {
    return this.ankiConnect({ action: 'modelNames' });
  }

  async fetchModelFieldNames(modelName: string): Promise<string[]> {
    return this.ankiConnect({
      action: 'modelFieldNames',
      params: { modelName },
    });
  }

  async addNote(note: Note): Promise<number> {
    try {
      console.log('🔍 Starting addNote with:', {
        deckName: note.deckName,
        modelName: note.modelName,
        tags: note.tags,
        fields: note.fields,
      });

      // Validate note before sending
      await this.validateNote(note);

      // Don't auto-generate cloze - let users control their own format
      // Just pass fields as-is
      let processedFields = { ...note.fields };

      // Map fields to match the model's expected fields
      const mappedFields = await this.mapFieldsToModel(processedFields, note.modelName); console.log('✅ Fields mapped successfully:', mappedFields);

      // Validate that we have some fields to send
      if (Object.keys(mappedFields).length === 0) {
        throw new Error('No fields were successfully mapped to the model');
      }

      // Prepare note for AnkiConnect
      const ankiNote: any = {
        deckName: note.deckName,
        modelName: note.modelName,
        fields: mappedFields,
        tags: note.tags,
      };

      // Add audio if exists
      if (note.audio && note.audio.length > 0) {
        ankiNote.audio = note.audio;
      }

      console.log('📤 Sending to AnkiConnect:', JSON.stringify(ankiNote, null, 2));

      const result = await this.ankiConnect({
        action: 'addNote',
        params: { note: ankiNote },
      });

      console.log('✅ Note added successfully, ID:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to add note:', error);
      console.error('Note data:', note);
      throw error;
    }
  }

  private async validateNote(note: Note): Promise<void> {
    console.log('🔍 Validating note...');

    // Check if model exists
    const models = await this.fetchModels();
    console.log('📋 Available models:', models);
    console.log('🎯 Looking for model:', note.modelName);

    if (!models.includes(note.modelName)) {
      throw new Error(`Model "${note.modelName}" does not exist. Available models: ${models.join(', ')}`);
    }
    console.log('✅ Model exists');

    // Check if deck exists
    const decks = await this.fetchDecks();
    console.log('📚 Available decks:', decks);
    console.log('🎯 Looking for deck:', note.deckName);

    if (!decks.includes(note.deckName)) {
      throw new Error(`Deck "${note.deckName}" does not exist. Available decks: ${decks.join(', ')}`);
    }
    console.log('✅ Deck exists');
  }

  /**
   * Check if a model is a Cloze type
   */
  private async isClozeModel(modelName: string): Promise<boolean> {
    // Common Cloze model name patterns
    const clozePatterns = [
      /cloze/i,
      /^Cloze$/i,
      /Basic.*cloze/i,
    ];

    // Check by name pattern
    if (clozePatterns.some(pattern => pattern.test(modelName))) {
      return true;
    }

    // Check by fetching model templates (if needed)
    try {
      const templates = await this.ankiConnect<any>({
        action: 'modelTemplates',
        params: { modelName },
      });

      // Check if templates contain {{cloze: syntax
      const templatesStr = JSON.stringify(templates);
      return /\{\{cloze:/i.test(templatesStr);
    } catch {
      return false;
    }
  }

  async fetchRecentNotes(modelName: string, tags: string[]): Promise<any[]> {
    const searchString = `added:90 ${tags.map(tag => `"tag:${tag}"`).join(' ')} "note:${modelName}"`;

    let noteIds = await this.ankiConnect<number[]>({
      action: 'findNotes',
      params: { query: searchString },
    });

    if (noteIds.length === 0) {
      noteIds = await this.ankiConnect<number[]>({
        action: 'findNotes',
        params: { query: `added:365 "note:${modelName}"` },
      });
    }

    if (noteIds.length === 0) {
      return [];
    }

    return this.ankiConnect({
      action: 'notesInfo',
      params: { notes: noteIds },
    });
  }

  async fetchMediaDirPath(): Promise<string> {
    return this.ankiConnect({ action: 'getMediaDirPath' });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.fetchDecks();
      return true;
    } catch {
      return false;
    }
  }

  private async mapFieldsToModel(noteFields: NoteFields, modelName: string): Promise<Record<string, string>> {
    const modelFields = await this.fetchModelFieldNames(modelName);
    console.log('🔍 Model fields for', modelName, ':', modelFields);
    console.log('🔍 Note fields to map:', noteFields);

    const mappedFields: any = {};

    // Common field mappings for different model types
    const fieldMappings: Record<string, Record<string, string>> = {
      'Basic_cloze': {
        'Front': 'Text',
        'Back': 'Back Extra',
        'Ans': 'Back Extra',
        'Audio': 'Audio'
      },
      'Basic_cloze_2': {
        'Front': 'Front',
        'Back': 'Back',
        'Ans': 'Ans',
        'Audio': 'Audio'
      },
      'Basic': {
        'Front': 'Front',
        'Back': 'Back',
        'Ans': 'Back',
        'Audio': 'Audio'
      },
      'Basic (Type Answer)': {
        'Front': 'Front',
        'Back': 'Back',
        'Ans': 'Ans',
        'Audio': 'Audio'
      },
      'Cloze': {
        'Front': 'Text',
        'Back': 'Back Extra',
        'Ans': 'Back Extra',
        'Audio': 'Audio'
      }
    };



    // Use model-specific mapping if available, or create dynamic mapping
    let mapping = fieldMappings[modelName];

    // Override with actual model fields for better accuracy
    if (!mapping || !Object.values(mapping).every(field => modelFields.includes(field))) {

      // Try to match fields directly or map to the first available fields
      mapping = {};
      if (modelFields.includes('Front')) mapping['Front'] = 'Front';
      if (modelFields.includes('Back')) mapping['Back'] = 'Back';
      if (modelFields.includes('Text')) mapping['Front'] = 'Text';
      if (modelFields.includes('Back Extra')) mapping['Back'] = 'Back Extra';
      if (modelFields.includes('Audio')) mapping['Audio'] = 'Audio';

      // Map Ans field intelligently
      if (modelFields.includes('Ans')) mapping['Ans'] = 'Ans';
      else if (modelFields.includes('Answer')) mapping['Ans'] = 'Answer';
      else if (modelFields.includes('Back')) mapping['Ans'] = 'Back';
      else if (modelFields.includes('Back Extra')) mapping['Ans'] = 'Back Extra';

    }

    // Map note fields to model fields
    // Don't include Audio field as text - audio will be sent as attachment
    const fieldsToProcess = [
      ['Front', noteFields.Front],
      ['Back', noteFields.Back],
      ['Ans', noteFields.Ans],
      // Audio is handled separately as attachment, not as a text field
    ];

    console.log('🔍 Fields to process:', fieldsToProcess);
    console.log('🔍 Using mapping:', mapping);

    for (const [noteField, value] of fieldsToProcess) {
      if (!value) continue; // Skip empty fields

      const modelField = mapping[noteField] || noteField;
      console.log(`  Mapping ${noteField} -> ${modelField}:`, modelFields.includes(modelField) ? '✅' : '❌');

      // Only include if the model actually has this field
      if (modelFields.includes(modelField)) {
        mappedFields[modelField] = value;
      }
    }

    console.log('🔍 Final mapped fields:', mappedFields);
    return mappedFields;
  }
}

export const ankiService = new AnkiService();