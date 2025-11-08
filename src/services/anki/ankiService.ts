import { ENDPOINTS, ANKI_CONNECT_VERSION, ERROR_MESSAGES } from '../../constants';
import { AnkiConnectRequest, AnkiConnectResponse, Note } from '../../types';

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
        console.error('AnkiConnect error:', data.error);
        console.error('Request was:', JSON.stringify(params, null, 2));
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
    // Validate required fields
    if (!note.deckName) {
      throw new Error('Deck name is required');
    }
    if (!note.modelName) {
      throw new Error('Model name is required');
    }
    if (!note.fields) {
      throw new Error('Fields are required');
    }

    // Check if deck exists
    try {
      const decks = await this.fetchDecks();
      if (!decks.includes(note.deckName)) {
        console.warn(`Deck "${note.deckName}" does not exist. Available decks:`, decks);
      }
    } catch (error) {
      console.warn('Could not verify deck existence:', error);
    }

    // Check if model exists and get its fields
    try {
      const models = await this.fetchModels();
      if (!models.includes(note.modelName)) {
        console.error(`Model "${note.modelName}" does not exist. Available models:`, models);
        throw new Error(`Model "${note.modelName}" not found in Anki`);
      }

      const modelFields = await this.fetchModelFieldNames(note.modelName);
      console.log(`Fields for model "${note.modelName}":`, modelFields);

      // Check if all required fields are provided
      const noteFields = Object.keys(note.fields);
      console.log('Note fields provided:', noteFields);

    } catch (error) {
      console.error('Error validating model:', error);
    }

    // Transform our Note format to AnkiConnect format
    const ankiNote = {
      deckName: note.deckName,
      modelName: note.modelName,
      fields: note.fields,
      tags: note.tags || [],
      ...(note.audio && { audio: note.audio })
    };

    console.log('Sending note to AnkiConnect:', JSON.stringify(ankiNote, null, 2));

    return this.ankiConnect({
      action: 'addNote',
      params: { note: ankiNote },
    });
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
}

export const ankiService = new AnkiService();