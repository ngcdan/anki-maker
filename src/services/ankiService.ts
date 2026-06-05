import { ENDPOINTS, ANKI_CONNECT_VERSION, ERROR_MESSAGES } from '../shared';
import { AnkiConnectRequest, AnkiConnectResponse, Note } from '../shared';

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
    const params: any = {
      note: {
        modelName: note.modelName,
        deckName: note.deckName,
        fields: note.fields,
        tags: note.tags,
      },
    };

    // Add picture attachments if present
    if (note.images && note.images.length > 0) {
      params.note.picture = note.images.map(img => ({
        data: img.data,
        filename: img.filename,
        fields: img.fields,
      }));
    }

    return this.ankiConnect({
      action: 'addNote',
      params,
    });
  }

}

export const ankiService = new AnkiService();