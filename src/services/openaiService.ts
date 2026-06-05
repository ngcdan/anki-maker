import { ENDPOINTS, ERROR_MESSAGES } from '../shared';
import { SuggestOptions, Note, ExtractedSections } from '../shared';
import { messages } from '../shared/vocab_prompt';

class OpenAIService {
  async suggestAnkiNotes(
    openAIKey: string,
    { deckName, modelName, tags, prompt }: SuggestOptions
  ): Promise<Note[]> {
    if (!openAIKey) {
      throw new Error(ERROR_MESSAGES.OPENAI_KEY_MISSING);
    }

    try {
      const body = {
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          ...messages,
          {
            role: 'user',
            content: prompt,
          },
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

      const noteContent = data.choices[0].message.content;

      let sections: ExtractedSections;
      try {
        sections = JSON.parse(noteContent);
      } catch (e) {
        throw new Error("Failed to parse JSON from AI: " + noteContent);
      }

      return [
        {
          key: crypto.randomUUID(),
          deckName,
          modelName,
          fields: {
            Front: sections.front,
            Question: `{{c1::${sections.ans}}}`,
            Ans: sections.ans,
            Back: sections.back,
          },
          tags,
        },
      ];
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Lỗi CORS hoặc Network. Hãy kiểm tra: 1. API Key đúng chuẩn. 2. Tắt Adblocker/Brave Shields. 3. Mạng internet bình thường.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(ERROR_MESSAGES.UNKNOWN);
    }
  }
}

export const openaiService = new OpenAIService();