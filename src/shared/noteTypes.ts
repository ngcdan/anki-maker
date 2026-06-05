import { AnkiNoteType } from './types';

export interface NoteTypeConfig {
  name: AnkiNoteType;
  fields: string[];
}

export const NOTE_TYPES: NoteTypeConfig[] = [
  { name: 'Basic', fields: ['Front', 'Back'] },
  { name: 'Basic (and reversed card)', fields: ['Front', 'Back'] },
  { name: 'Cloze', fields: ['Text', 'Extra'] },
];

export function getFieldsForType(noteType: AnkiNoteType): string[] {
  return NOTE_TYPES.find(t => t.name === noteType)?.fields ?? ['Front', 'Back'];
}

export function buildSystemPrompt(noteType: AnkiNoteType): string {
  const fields = getFieldsForType(noteType);

  const fieldDescriptions: Record<string, string> = {
    'Front': 'The question or front side of the card',
    'Back': 'The answer or back side of the card',
    'Text': 'The card text with cloze deletions using {{c1::answer}} syntax',
    'Extra': 'Additional context or explanation shown after answering',
  };

  const jsonExample = fields.reduce((acc, f) => {
    acc[f.toLowerCase()] = fieldDescriptions[f] || f;
    return acc;
  }, {} as Record<string, string>);

  return `You are a flashcard creation assistant. Create Anki flashcards based on the user's request.

Note type: ${noteType}
You must respond with a JSON object containing exactly ${fields.length} keys: ${fields.map(f => '"' + f.toLowerCase() + '"').join(', ')}.
Do not include any other text besides the JSON.

JSON format:
${JSON.stringify(jsonExample, null, 2)}

Rules:
- Use markdown for formatting when appropriate
- Keep content concise and suitable for flashcards
${noteType === 'Cloze' ? '- For Cloze type, use {{c1::answer}} syntax in the "text" field\n' : ''}- Respond with a JSON object only, no other text`;
}
