import { messages } from "./vocab_prompt";
import { AnkiCardService } from "./services/ankiCardService";
import { Note } from "./types";
import { ENDPOINTS } from "./constants";

interface Options {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
}


/**
 * Create Anki cards from OpenAI using structured vocab prompts
 */
export async function suggestAnkiNotes(
  openAIKey: string,
  { deckName, modelName, prompt, tags }: Options,
  _notes: Note[]
): Promise<Note[]> {
  try {
    // Debug: Check API key
    console.log('OpenAI API Key exists:', !!openAIKey);
    console.log('OpenAI API Key length:', openAIKey?.length);
    console.log('OpenAI API Key starts with sk-:', openAIKey?.startsWith('sk-'));
    console.log('OpenAI API Key first 20 chars:', openAIKey?.substring(0, 20));

    // Validate API key format
    if (!openAIKey || !openAIKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. Must start with "sk-"');
    }

    // Trim any whitespace
    const cleanKey = openAIKey.trim();

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        ...messages,
        { role: 'user', content: prompt }
      ]
    };

    console.log('Fetching OpenAI API:', ENDPOINTS.OPENAI_API);

    const res = await fetch(ENDPOINTS.OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify(body),
    });

    console.log('OpenAI Response status:', res.status, res.statusText);

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('OpenAI Error Response:', errorBody);
      throw new Error(`OpenAI API request failed: ${res.status} ${res.statusText}. Check your API key at https://platform.openai.com/api-keys`);
    }

    const data = await res.json();
    if (!data.choices?.length) {
      throw new Error('No completion choices were returned from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;

    const result = AnkiCardService.processAIResponse(aiResponse, prompt, {
      deckName,
      modelName,
      prompt,
      tags: tags || ['vocab-enhanced']
    });

    // Provide default Audio if missing
    if (!result.note.fields.Audio || result.note.fields.Audio.length === 0) {
      result.note.fields.Audio = `Audio content for: ${prompt}`;
    }

    return [{
      key: crypto.randomUUID(),
      deckName: result.note.deckName,
      modelName: result.note.modelName,
      fields: {
        Front: result.note.fields.Front,
        Back: result.note.fields.Back,
        Ans: result.note.fields.Ans,
        Audio: result.note.fields.Audio
      },
      tags: result.note.tags,
      trashed: false,
      created: false
    }];
  } catch (error) {
    throw error;
  }
}

