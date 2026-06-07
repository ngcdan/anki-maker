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
    // Clone fields to avoid mutating the original
    const cleanFields = { ...note.fields };

    // Separate media into pictures and videos for AnkiConnect
    const pictures: { data: string; filename: string; fields: string[] }[] = [];
    const videos: { data: string; filename: string; fields: string[] }[] = [];

    if (note.media && note.media.length > 0) {
      for (const item of note.media) {
        // Strip any existing media tags from fields
        for (const field of item.fields) {
          if (cleanFields[field]) {
            cleanFields[field] = cleanFields[field]
              .replace(/<img\s+src="[^"]*"\s*\/?>/gi, '')
              .replace(/\[sound:[^\]]*\]/gi, '')
              .trim();
          }
        }

        // Ensure fields with media aren't empty (AnkiConnect rejects empty notes)
        for (const field of item.fields) {
          if (!cleanFields[field]) {
            cleanFields[field] = ' ';
          }
        }

        const entry = { data: item.data, filename: item.filename, fields: item.fields };
        if (item.type === 'video') {
          videos.push(entry);
        } else {
          pictures.push(entry);
        }
      }
    }

    // Ensure no field is completely empty (AnkiConnect strips HTML then rejects if no text remains)
    // Use zero-width space (\u200b) as invisible placeholder
    for (const key of Object.keys(cleanFields)) {
      const stripped = cleanFields[key].replace(/<[^>]*>/g, '').trim();
      if (!stripped) {
        cleanFields[key] = '\u200b' + cleanFields[key];
      }
    }

    const params: any = {
      note: {
        modelName: note.modelName,
        deckName: note.deckName,
        fields: cleanFields,
        tags: note.tags,
        options: {
          allowDuplicate: true,
        },
      },
    };

    if (pictures.length > 0) {
      params.note.picture = pictures;
    }
    if (videos.length > 0) {
      params.note.video = videos;
    }

    return this.ankiConnect({
      action: 'addNote',
      params,
    });
  }

}

export const ankiService = new AnkiService();