import { ENDPOINTS, ANKI_CONNECT_VERSION, ERROR_MESSAGES } from '../../shared';
import { AnkiConnectRequest, AnkiConnectResponse, Note } from '../../shared';

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
    return this.ankiConnect({
      action: 'addNote',
      params: { note },
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