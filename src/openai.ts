import { messages } from "./vocab_prompt";

export interface Note {
  modelName: string;
  deckName: string;
  fields: { Front: string, Back: string };
  tags: string[];
  key: string;
  trashed?: boolean;
  created?: boolean;
}

interface Options {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
}


function extractSections(markdown: string) {
  const sections: { front: string; audio: string[]; back: string } = {
    front: '',
    audio: [],
    back: ''
  };

  const frontMatch = markdown.match(/### Front:\n([\s\S]*?)(?=\n###|$)/);
  const audioMatch = markdown.match(/### Audio:\n([\s\S]*?)(?=\n###|$)/);
  const backMatch = markdown.match(/### Back:\n([\s\S]*?)(?=\n###|$)/);

  if (frontMatch) sections.front = frontMatch[1].trim();
  if (audioMatch) {
    const audioContent = audioMatch[1].trim();
    sections.audio = audioContent
      .split(/<br\s*\/?>/)
      .map(item => item
        .replace(/^\s*-\s*/, '')
        .replace(/["\\]/g, '')
        .trim()
      )
      .filter(item => item.length > 0);
  }

  if (backMatch) sections.back = backMatch[1].trim();

  return sections;
}

export async function suggestAnkiNotes(
  openAIKey: string, { deckName, modelName, tags, prompt }: Options, _notes: Note[]): Promise<any> {
  console.log('-------------- suggestAnkiNotes ----------------');

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      ...messages,
      {
        role: 'user',
        content: prompt,
      }
    ]
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error('OpenAI API request failed');
  const data = await res.json();

  if (!data.choices || !data.choices.length) {
    throw new Error('No completion choices were returned from OpenAI');
  }

  const noteContent = data.choices[0].message.content;

  const sections = extractSections(noteContent);
  console.log('Audio:', sections.audio);

  return [
    {
      key: crypto.randomUUID(),
      deckName,
      modelName,
      fields: {
        Front: sections.front,
        Back: sections.back,
        Audio: sections.audio,
      },
      tags
    }
  ];
}
