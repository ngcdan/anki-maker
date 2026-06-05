import { ENDPOINTS, ERROR_MESSAGES } from '../shared';
import { SuggestOptions, Note } from '../shared';
import { buildSystemPrompt, getFieldsForType } from '../shared/noteTypes';

class OpenAIService {
  async generateNote(
    openAIKey: string,
    { deckName, modelName, tags, prompt, noteType }: SuggestOptions
  ): Promise<Note> {
    if (!openAIKey) {
      throw new Error(ERROR_MESSAGES.OPENAI_KEY_MISSING);
    }

    try {
      const systemPrompt = buildSystemPrompt(noteType);

      const body = {
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      };

      const response = await fetch(ENDPOINTS.OPENAI_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAIKey.trim()}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(ERROR_MESSAGES.OPENAI_API);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices.length) {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
      }

      const content = data.choices[0].message.content;
      let parsed: Record<string, string>;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("Failed to parse JSON from AI: " + content);
      }

      // Map lowercase keys from AI to PascalCase field names
      const expectedFields = getFieldsForType(noteType);
      const fields: Record<string, string> = {};
      for (const field of expectedFields) {
        fields[field] = parsed[field.toLowerCase()] || parsed[field] || '';
      }

      return {
        key: crypto.randomUUID(),
        deckName,
        modelName,
        fields,
        tags,
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Lỗi CORS hoặc Network. Hãy kiểm tra: 1. API Key đúng chuẩn. 2. Tắt Adblocker/Brave Shields. 3. Mạng internet bình thường.');
      }
      if (error instanceof Error) throw error;
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }
  }
}

export const openaiService = new OpenAIService();
